import axios from 'axios';
import {
  saveOrUpdateUser,
  findUserByEmail,
  createUser,
  hashPassword
} from './user.service.js';

import { signToken } from './token.service.js';

const port        = process.env.PORT        || 3000;
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

// ── OAuth helpers ───────────────────────────────────────────

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
  const token = signToken(user);
  return `${frontendUrl}/callback?token=${token}`;
}

export async function handleMicrosoftCallback(code) {
  const params = new URLSearchParams({
    client_id:     process.env.MS_CLIENT_ID,
    client_secret: process.env.MS_CLIENT_SECRET,
    scope:         'user.read',
    code,
    redirect_uri:  `http://localhost:${port}/auth/microsoft/callback`,
    grant_type:    'authorization_code',
  });

  const { data: tokens } = await axios.post(
    'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    params,
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  const { data: info } = await axios.get('https://graph.microsoft.com/v1.0/me', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  const user = await saveOrUpdateUser({ name: info.displayName, email: info.mail || info.userPrincipalName });
  const token = signToken(user);
  return `${frontendUrl}/callback?token=${token}`;
}

// ── Standard auth ───────────────────────────────────────────

export async function register({ name, email, password }) {
  const userEmail = email.toLowerCase().trim();

  if (
    userEmail.endsWith('@estudantes.ifc.edu.br') ||
    userEmail.endsWith('@ifc.edu.br')
  ) {
    throw Object.assign(
      new Error('Contas institucionais devem usar login com Microsoft.'),
      { status: 400 }
    );
  }

  const existingUser = await findUserByEmail(userEmail);

  if (existingUser) {
    throw Object.assign(
      new Error('Este e-mail já está cadastrado.'),
      { status: 400 }
    );
  }

  const newUser = {
    email: userEmail,
    name: name.trim(),
    role: 'visitante',
    password: hashPassword(password),
    favorites: []
  };

  await createUser(newUser);

  const payload = {
    email: newUser.email,
    name: newUser.name,
    role: newUser.role
  };

  return {
    token: signToken(payload),
    user: payload
  };
}

export async function login({ email, password }) {
  const user = await findUserByEmail(
    email.toLowerCase().trim()
  );

  if (!user || !user.password) {
    throw Object.assign(
      new Error(
        'E-mail ou senha incorretos, ou usuário cadastrado via OAuth.'
      ),
      { status: 401 }
    );
  }

  if (user.password !== hashPassword(password)) {
    throw Object.assign(
      new Error('E-mail ou senha incorretos.'),
      { status: 401 }
    );
  }

  const payload = {
    email: user.email,
    name: user.name,
    role: user.role
  };

  return {
    token: signToken(payload),
    user: payload
  };
}
