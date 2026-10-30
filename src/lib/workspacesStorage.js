/**
 * workspacesStorage.js — Comunicação com a API de Workspace.
 */
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

function getToken() {
  return localStorage.getItem('jwt_token');
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** GET /api/workspaces/public — sem autenticação */
export async function loadPublicWorkspace() {
  const res = await axios.get(`${API_BASE}/api/workspaces/public`);
  return res.data;
}

/** GET /api/workspaces/me — autenticado */
export async function loadMyWorkspace() {
  const res = await axios.get(`${API_BASE}/api/workspaces/me`, {
    headers: authHeaders(),
  });
  return res.data;
}

/** PUT /api/workspaces/me — autenticado. Recebe { name, blockMeta, features } */
export async function saveMyWorkspace({ name, blockMeta, features }) {
  const res = await axios.put(
    `${API_BASE}/api/workspaces/me`,
    { name, blockMeta, features },
    { headers: authHeaders() }
  );
  return res.data;
}

/** POST /api/workspaces/me/upload-image — upload de imagem de bloco */
export async function uploadBlockImage(file) {
  const form = new FormData();
  form.append('image', file);
  const res = await axios.post(
    `${API_BASE}/api/workspaces/me/upload-image`,
    form,
    {
      headers: {
        ...authHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return res.data; // espera { url: "/uploads/images/..." }
}