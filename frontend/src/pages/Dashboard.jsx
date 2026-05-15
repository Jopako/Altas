import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const decodedUser = jwtDecode(token);
      setUser(decodedUser);
    } catch (error) {
      localStorage.removeItem('jwt_token');
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    navigate('/login');
  };

  if (!user) return <h2>Carregando...</h2>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Bem-vindo, {user.name}!</h1>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Grupo:</strong> {user.role === 'admin' ? 'Administrador' : 'Usuário Comum'}</p>
      
      <hr />
      
      {user.role === 'admin' ? (
        <div style={{ background: '#ffebee', padding: '10px' }}>
          <h2>Painel do Administrador</h2>
          <p>Você pode editar Pontos de Interesse (POIs) e gerenciar a plataforma aqui.</p>
          {/* Suas ferramentas de edição de mapa entram aqui */}
        </div>
      ) : (
        <div style={{ background: '#e3f2fd', padding: '10px' }}>
          <h2>Visão de Usuário Comum</h2>
          <p>Você tem acesso apenas para navegação no mapa e busca de rotas.</p>
          {/* Apenas visualização do mapa entra aqui */}
        </div>
      )}

      <button onClick={handleLogout} style={{ marginTop: '20px' }}>Sair</button>
    </div>
  );
}