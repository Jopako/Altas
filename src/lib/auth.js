// src/lib/auth.js

function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch (e) {
    return null;
  }
}

export function isTokenValid() {
  const token = localStorage.getItem('jwt_token');
  if (!token) return false;

  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return false;

  // O exp do JWT é em segundos, o Date.now() em milissegundos
  const isExpired = decoded.exp * 1000 < Date.now();
  
  if (isExpired) {
    logout(); // Limpa o cache automaticamente
    return false;
  }
  
  return true;
}

export function getUserFromToken() {
  const token = localStorage.getItem('jwt_token');
  if (!token) return null;
  const decoded = decodeToken(token);
  return decoded?.email || null;
}

export function logout() {
  localStorage.removeItem('jwt_token');
  // window.location.href = '/login'; // Opcional: forçar recarregamento
}