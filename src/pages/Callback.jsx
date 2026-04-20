import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Callback() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      localStorage.setItem('jwt_token', token);
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  }, [location, navigate]);

  return <h2>Autenticando... Por favor, aguarde.</h2>;
}