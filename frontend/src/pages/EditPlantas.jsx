export default function EditPlantas() {
    function handleLogout() {
        localStorage.removeItem('jwt_token');
        window.location.href = '/login';
    }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Editar Plantas</h1>
      <p>Aqui você pode editar as informações das plantas, como nome, descrição e localização.</p>
      <button onClick={handleLogout}>Sair</button>
    </div>
  );
}