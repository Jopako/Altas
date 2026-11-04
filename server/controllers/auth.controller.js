import * as authService from '../services/auth.service.js';
import { getUserFavorites, toggleUserFavorite } from '../services/user.service.js';

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
const port        = process.env.PORT          || 3000;

// Garante a URI correta em desenvolvimento ou produção
const getRedirectUri = (req, envKey, fallbackPath) => {
  if (process.env[envKey]) return process.env[envKey];
  const protocol = req.protocol || 'http';
  const host = req.get('host') || `localhost:${port}`;
  return `${protocol}://${host}${fallbackPath}`;
};

export const microsoftRedirect = (req, res) => {
  const redirectUri = getRedirectUri(req, 'MS_REDIRECT_URI', '/auth/microsoft/callback');
  const url = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize`
    + `?client_id=${process.env.MS_CLIENT_ID}`
    + `&response_type=code`
    + `&redirect_uri=${encodeURIComponent(redirectUri)}`
    + `&response_mode=query`
    + `&scope=openid+profile+email+User.Read`;
    
  res.redirect(url);
};

export const microsoftCallback = async (req, res) => {
  try {
    const redirectUri = getRedirectUri(req, 'MS_REDIRECT_URI', '/auth/microsoft/callback');
    const redirectUrl = await authService.handleMicrosoftCallback(req.query.code, redirectUri);
    res.redirect(redirectUrl);
  } catch (err) {
    console.error(err);
    res.redirect(`${frontendUrl}/login?error=auth_failed`);
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
  }

  try {
    const result = await authService.login({ email, password });
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const getFavorites = async (req, res) => {
  if (req.user?.role === 'admin') {
    return res.json({ favorites: [] });
  }

  try {
    const favorites = await getUserFavorites(req.user.email);
    res.json({ favorites });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const toggleFavorite = async (req, res) => {
  if (req.user?.role === 'admin') {
    return res.status(403).json({ error: 'Administradores não usam favoritos.' });
  }

  const { mapId, poiId } = req.body;

  if (!mapId || !poiId) {
    return res.status(400).json({ error: 'mapId e poiId são obrigatórios.' });
  }

  try {
    const favorites = await toggleUserFavorite(req.user.email, mapId, poiId);
    res.json({ favorites });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};
