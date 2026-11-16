/**
 * apiConfig.js — Centraliza a resolução dinâmica do endereço da API (backend).
 * Garante que em dispositivos móveis na mesma rede Wi-Fi o frontend acesse o backend no IP correto,
 * em vez de apontar para localhost:3000 (que no celular seria ele mesmo).
 */
export function getApiBase() {
  if (import.meta.env.VITE_API_BASE) {
    return import.meta.env.VITE_API_BASE;
  }
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined' && window.location?.hostname) {
    return `http://${window.location.hostname}:3000`;
  }
  return 'http://localhost:3000';
}

export const API_BASE = getApiBase();
