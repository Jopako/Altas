import axios from 'axios';
import jwt from 'jsonwebtoken';
import {
  saveOrUpdateUser,
  findUserByEmail,
  createUser,
  hashPassword,
} from './user.service.js';

import { signToken } from './token.service.js';

const port        = process.env.PORT        || 3000;
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

// ── Regras de autorização (E2) ───────────────────────────────────────────────

function getEnvList(varName) {
  return (process.env[varName] || '')
    .split(',')
    .map(v => v.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Retorna true se o e-mail e o tenant (tid) são autorizados.
 * @param {string} email   e-mail em minúsculas
 * @param {string} tid     tenant ID do token Microsoft
 */
function isAuthorized(email, tid) {
  const allowedTenants = getEnvList('ALLOWED_TENANT_IDS');
  const allowedDomains = getEnvList('ALLOWED_DOMAINS');
  const authorizedEmails = [
    ...getEnvList('AUTHORIZED_EMAILS'),
    ...getEnvList('ADMIN_EMAILS'),
  ];

  // 1. Verificar tenant primeiro (se configurado)
  if (allowedTenants.length > 0 && !allowedTenants.includes(tid?.toLowerCase())) {
    console.warn(`[AUTH] Bloqueado por tenant não autorizado: tid="${tid}"`);
    return false;
  }

  // 2. E-mail individual explicitamente autorizado (AUTHORIZED_EMAILS ou ADMIN_EMAILS)
  if (authorizedEmails.includes(email)) {
    console.log(`[AUTH] Autorizado por lista de e-mails individuais: "${email}"`);
    return true;
  }

  // 3. Domínio autorizado (terminação exata com @)
  if (allowedDomains.some(domain => email.endsWith(domain))) {
    console.log(`[AUTH] Autorizado por domínio corporativo: "${email}"`);
    return true;
  }

  console.warn(`[AUTH] E-mail não autorizado: "${email}". Domínios: [${allowedDomains}], E-mails: [${authorizedEmails}]`);
  return false;
}

// ── OAuth helpers ────────────────────────────────────────────────────────────

export async function handleGoogleCallback(code) {
  const { data: tokens } = await axios.post('https://oauth2.googleapis.com/token', {
    client_id:     process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    code,
    redirect_uri:  `http://localhost:${port}/auth/google/callback`,
    grant_type:    'authorization_code',
  });

  const { data: info } = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  const user = await saveOrUpdateUser(info);
  const token = signToken({ email: user.email, name: user.name, role: user.role });
  return `${frontendUrl}/auth/callback?token=${token}`;
}

export async function handleMicrosoftCallback(code, customRedirectUri) {
  const redirect_uri = customRedirectUri || process.env.MS_REDIRECT_URI || `http://localhost:${port}/auth/microsoft/callback`;
  const params = new URLSearchParams({
    client_id:     process.env.MS_CLIENT_ID,
    client_secret: process.env.MS_CLIENT_SECRET,
    scope:         'openid profile email User.Read',
    code,
    redirect_uri,
    grant_type:    'authorization_code',
  });

  const { data: tokens } = await axios.post(
    'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    params,
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  // Decodifica o id_token para pegar o tid sem verificar (a verificação real é pelo tenant)
  let tid = null;
  try {
    const idTokenPayload = jwt.decode(tokens.id_token || '');
    tid = idTokenPayload?.tid || null;
  } catch { /* tid permanece null */ }

  const { data: info } = await axios.get('https://graph.microsoft.com/v1.0/me', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  const email = (info.mail || info.userPrincipalName || '').toLowerCase().trim();
  const name  = info.displayName || email;

  // ── Verificação de autorização ──────────────────────────
  if (!isAuthorized(email, tid)) {
    return `${frontendUrl}/login?error=email_nao_autorizado`;
  }

  // Upsert do usuário (sempre role: 'admin' para quem passar pela regra)
  const existing = await findUserByEmail(email);
  let user;
  if (existing) {
    user = existing;
  } else {
    user = await createUser({
      email,
      name,
      role: 'admin',
      authProvider: 'microsoft',
      favorites: [],
    });
  }

  const token = signToken({ email: user.email, name: user.name, role: user.role });
  return `${frontendUrl}/auth/callback?token=${token}`;
}

// ── Standard auth (mantido para compatibilidade — sem rota de cadastro pública) ──

export async function login({ email, password }) {
  const user = await findUserByEmail(email.toLowerCase().trim());

  if (!user || !user.password) {
    throw Object.assign(
      new Error('E-mail ou senha incorretos, ou usuário cadastrado via OAuth.'),
      { status: 401 }
    );
  }

  if (user.password !== hashPassword(password)) {
    throw Object.assign(new Error('E-mail ou senha incorretos.'), { status: 401 });
  }

  const payload = { email: user.email, name: user.name, role: user.role };
  return { token: signToken(payload), user: payload };
}
