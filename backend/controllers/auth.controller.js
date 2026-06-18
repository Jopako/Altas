import * as authService from '../services/auth.service.js';
import { getUserFavorites, toggleUserFavorite } from '../services/user.service.js';

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
const port        = process.env.PORT          || 3000;

export const googleRedirect = (_req, res) => {
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}`
    + `&redirect_uri=http://localhost:${port}/auth/google/callback`
    + `&response_type=code&scope=profile email`;
  res.redirect(url);
};

export const googleCallback = async (req, res) => {
  try {
    const redirectUrl = await authService.handleGoogleCallback(req.query.code);
    res.redirect(redirectUrl);
  } catch (err) {
    console.error(err);
    res.redirect(`${frontendUrl}/login?error=auth_failed`);
  }
};

export const microsoftRedirect = (_req, res) => {
  const url = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${process.env.MS_CLIENT_ID}`
    + `&response_type=code`
    + `&redirect_uri=http://localhost:${port}/auth/microsoft/callback`
    + `&response_mode=query&scope=user.read`;
  res.redirect(url);
};

export const microsoftCallback = async (req, res) => {
  try {
    const redirectUrl = await authService.handleMicrosoftCallback(req.query.code);
    res.redirect(redirectUrl);
  } catch (err) {
    console.error(err);
    res.redirect(`${frontendUrl}/login?error=auth_failed`);
  }
};

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      error: 'Todos os campos (nome, e-mail e senha) são obrigatórios.'
    });
  }

  try {
    const result = await authService.register({
      name,
      email,
      password
    });

    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({
      error: err.message
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: 'E-mail e senha são obrigatórios.'
    });
  }

  try {
    const result = await authService.login({
      email,
      password
    });

    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({
      error: err.message
    });
  }
};

export const getFavorites = async (req, res) => {
  if (req.user?.role === 'admin') {
    return res.json({ favorites: [] });
  }

  try {
    const favorites = await getUserFavorites(
      req.user.email
    );

    res.json({ favorites });
  } catch (err) {
    res.status(err.status || 500).json({
      error: err.message
    });
  }
};

export const toggleFavorite = async (req, res) => {
  if (req.user?.role === 'admin') {
    return res.status(403).json({
      error: 'Administradores não usam favoritos.'
    });
  }

  const { mapId, poiId } = req.body;

  if (!mapId || !poiId) {
    return res.status(400).json({
      error: 'mapId e poiId são obrigatórios.'
    });
  }

  try {
    const favorites = await toggleUserFavorite(
      req.user.email,
      mapId,
      poiId
    );

    res.json({ favorites });
  } catch (err) {
    res.status(err.status || 500).json({
      error: err.message
    });
  }
};
