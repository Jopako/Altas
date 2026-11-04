/**
 * workspacesStorage.js — Comunicação com a API de Workspace.
 */
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE,
});
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Sessão expirada. Redirecionando para o login...");
      localStorage.removeItem('jwt_token');
      // Evita loop infinito de reload se já estiver na página de login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

function getToken() {
  return localStorage.getItem('jwt_token');
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** GET /api/workspaces/public — sem autenticação */
export async function loadPublicWorkspace() {
  // Usa a instância api em vez do axios global
  const res = await api.get('/api/workspaces/public');
  return res.data;
}

/** GET /api/workspaces/me — autenticado */
export async function loadMyWorkspace() {
  const res = await api.get('/api/workspaces/me', {
    headers: authHeaders(),
  });
  return res.data;
}

/** PUT /api/workspaces/me — autenticado. Recebe { name, blockMeta, features } */
export async function saveMyWorkspace({ name, blockMeta, features }) {
  const res = await api.put(
    '/api/workspaces/me',
    { name, blockMeta, features },
    { headers: authHeaders() }
  );
  return res.data;
}

/** POST /api/workspaces/me/upload-image — upload de imagem de bloco */
export async function uploadBlockImage(file) {
  const form = new FormData();
  form.append('image', file);
  const res = await api.post(
    '/api/workspaces/me/upload-image',
    form,
    {
      headers: {
        ...authHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return res.data;
}