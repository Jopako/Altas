import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLoginGoogle = () => {
    window.location.href = 'http://localhost:3000/auth/google';
  };

  const handleLoginMicrosoft = () => {
    window.location.href = 'http://localhost:3000/auth/microsoft';
  };

  const handleStandardLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('E-mail e senha são obrigatórios.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await axios.post('http://localhost:3000/api/auth/login', {
        email,
        password
      });

      if (response.data.token) {
        localStorage.setItem('jwt_token', response.data.token);
        navigate('/map-viewer');
      } else {
        setError('Ocorreu um erro ao realizar login.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Erro de autenticação. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={glassCardStyle}>
        <h1 style={logoStyle}>ALTAS</h1>
        <p style={subtitleStyle}>Indoor Mapping System</p>

        {error && <div style={errorStyle}>{error}</div>}

        {/* Formulário de Login Padrão */}
        <form onSubmit={handleStandardLogin} style={formStyle}>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>E-mail:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seuemail@provedor.com"
              style={inputStyle}
              required
            />
          </div>

          <div style={inputGroupStyle}>
            <label style={labelStyle}>Senha:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              style={inputStyle}
              required
            />
          </div>

          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {/* Divisor Visual */}
        <div style={dividerContainerStyle}>
          <div style={lineStyle}></div>
          <span style={dividerTextStyle}>ou acesse com</span>
          <div style={lineStyle}></div>
        </div>

        {/* Botões do OAuth */}
        <div style={oauthContainerStyle}>
          <button onClick={handleLoginGoogle} style={oauthGoogleButtonStyle}>
            <span style={{ fontSize: '18px', marginRight: '8px' }}>🌐</span> Google
          </button>
          <button onClick={handleLoginMicrosoft} style={oauthMicrosoftButtonStyle}>
            <span style={{ fontSize: '18px', marginRight: '8px' }}>❖</span> Microsoft
          </button>
        </div>

        <p style={footerLinkStyle}>
          Novo por aqui? <span onClick={() => navigate('/register')} style={linkStyle}>Cadastre-se como Visitante</span>
        </p>
      </div>
    </div>
  );
}

const containerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  width: '100vw',
  background: '#0a0a1a',
  fontFamily: "'Inter', sans-serif",
  color: '#e0e0f0'
};

const glassCardStyle = {
  background: 'rgba(17, 17, 34, 0.75)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '16px',
  padding: '40px',
  width: '100%',
  maxWidth: '420px',
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
  textAlign: 'center'
};

const logoStyle = {
  fontFamily: "'JetBrains Mono', monospace",
  fontWeight: '700',
  fontSize: '36px',
  background: 'linear-gradient(135deg, #4466ff 0%, #aa55ff 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  letterSpacing: '-1.5px',
  marginBottom: '6px'
};

const subtitleStyle = {
  fontSize: '12px',
  color: '#888899',
  textTransform: 'uppercase',
  letterSpacing: '2px',
  marginBottom: '24px'
};

const errorStyle = {
  background: 'rgba(255, 68, 68, 0.15)',
  border: '1px solid rgba(255, 68, 68, 0.3)',
  borderRadius: '8px',
  padding: '10px',
  fontSize: '13px',
  color: '#ff6b6b',
  marginBottom: '20px',
  textAlign: 'left'
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px'
};

const inputGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  textAlign: 'left'
};

const labelStyle = {
  fontSize: '12px',
  color: '#888899',
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
};

const inputStyle = {
  padding: '12px 16px',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '8px',
  color: '#e0e0f0',
  fontSize: '14px',
  fontFamily: "'Inter', sans-serif",
  outline: 'none',
  width: '100%'
};

const buttonStyle = {
  padding: '12px',
  background: 'linear-gradient(135deg, #4466ff 0%, #aa55ff 100%)',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  fontSize: '15px',
  fontWeight: '700',
  cursor: 'pointer',
  marginTop: '8px',
  boxShadow: '0 4px 12px rgba(85, 119, 255, 0.3)',
  width: '100%'
};

const dividerContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  margin: '24px 0',
  gap: '10px'
};

const lineStyle = {
  flexGrow: 1,
  height: '1px',
  background: 'rgba(255, 255, 255, 0.1)'
};

const dividerTextStyle = {
  fontSize: '11px',
  color: '#888899',
  textTransform: 'uppercase',
  letterSpacing: '1px'
};

const oauthContainerStyle = {
  display: 'flex',
  gap: '12px',
  justifyContent: 'center'
};

const oauthGoogleButtonStyle = {
  flex: 1,
  padding: '10px',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '8px',
  color: '#e0e0f0',
  fontSize: '13px',
  fontWeight: '600',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const oauthMicrosoftButtonStyle = {
  flex: 1,
  padding: '10px',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '8px',
  color: '#e0e0f0',
  fontSize: '13px',
  fontWeight: '600',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const footerLinkStyle = {
  marginTop: '24px',
  fontSize: '13px',
  color: '#888899'
};

const linkStyle = {
  color: '#5577ff',
  cursor: 'pointer',
  fontWeight: '600',
  textDecoration: 'underline'
};