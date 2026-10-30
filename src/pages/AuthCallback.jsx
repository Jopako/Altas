/**
 * AuthCallback — Lê o token da URL após o redirect OAuth Microsoft,
 * salva no localStorage e redireciona para /admin/maps.
 */
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('jwt_token', token);
      // Remove o token da URL sem adicionar ao histórico
      window.history.replaceState({}, '', '/auth/callback');
    }
    navigate('/admin/maps', { replace: true });
  }, []);

  return (
    <div className="flex h-screen items-center justify-center bg-[#0b1a30] text-white">
      <p>Autenticando…</p>
    </div>
  );
}
