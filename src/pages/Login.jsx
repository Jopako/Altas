export default function Login() {
    const handleLoginGoogle = () => {
      window.location.href = 'http://localhost:3000/auth/google';
    };
  
    const handleLoginMicrosoft = () => {
      window.location.href = 'http://localhost:3000/auth/microsoft';
    };
  
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h1>ALTAS - Autenticação</h1>
        <p>Selecione seu provedor de acesso:</p>
        <button onClick={handleLoginGoogle} style={{ margin: '10px', padding: '10px' }}>
          Login com Google
        </button>
        <br/>
        <button onClick={handleLoginMicrosoft} style={{ margin: '10px', padding: '10px' }}>
          Login com Entra ID (Microsoft)
        </button>
      </div>
    );
  }