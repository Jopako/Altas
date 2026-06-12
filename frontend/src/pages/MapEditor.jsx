import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function decodeToken(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export default function MapEditor() {
  const navigate = useNavigate();
  const [mapList, setMapList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [newName, setNewName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      navigate('/login');
      return;
    }

    const decoded = decodeToken(token);
    if (!decoded || decoded.role !== 'admin') {
      alert("Acesso negado. Esta área é restrita a administradores.");
      navigate('/map-viewer');
      return;
    }

    setUser(decoded);
  }, [navigate]);

  async function fetchMaps() {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:3000/api/maps");
      setMapList(res.data);
      setError(null);
    } catch (err) {
      console.error("Erro ao listar mapas:", err);
      setError("Erro ao carregar a lista de mapas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMaps();
  }, []);

  async function handleUpload(e) {
    e.preventDefault();
    if (!selectedFile) return alert("Selecione uma imagem primeiro!");

    try {
      setUploading(true);
      const token = localStorage.getItem('jwt_token');
      const formData = new FormData();
      formData.append("name", newName || "Mapa sem nome");
      formData.append("image", selectedFile);

      await axios.post("http://localhost:3000/api/maps/upload-image", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      alert("Mapa criado com sucesso!");
      setNewName("");
      setSelectedFile(null);
      fetchMaps();
    } catch (err) {
      console.error("Erro no upload:", err);
      alert(err.response?.data?.error || "Erro ao fazer upload. Você está logado como Admin?");
    } finally {
      setUploading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem('jwt_token');
    navigate('/login');
  }

  if (loading) {
    return (
      <div style={{ background: '#0a0a1a', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <h1 style={{ color: '#e0e0f0', fontFamily: 'sans-serif' }}>Carregando...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: '#0a0a1a', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontFamily: 'sans-serif', gap: '20px' }}>
        <h2 style={{ color: '#ff6b6b' }}>Ops! {error}</h2>
        <button
          onClick={fetchMaps}
          style={{ padding: '10px 20px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  const myMaps = mapList.filter((map) => user && map.creatorEmail === user.email);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a1a', color: '#e0e0f0', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ width: '320px', padding: '30px', borderRight: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(17, 17, 34, 0.75)', backdropFilter: 'blur(12px)', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '18px', color: '#e0e0f0', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '24px' }}>➕ Criar Novo Mapa</h3>

        <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: '#888899', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Nome do Mapa:
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ex: Bloco A, Campus..."
              style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#e0e0f0', outline: 'none' }}
              required
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: '#888899', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Imagem do Mapa:
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              style={{ padding: '8px 0', color: '#aaa', cursor: 'pointer' }}
              required
            />
          </label>

          <button
            type="submit"
            disabled={uploading}
            style={{ padding: '12px', background: 'linear-gradient(135deg, #4466ff 0%, #aa55ff 100%)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(85, 119, 255, 0.3)' }}
          >
            {uploading ? "Enviando..." : "Fazer Upload"}
          </button>
        </form>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={() => navigate('/map-viewer')}
            style={{ padding: '10px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#e0e0f0', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
          >
            👁 Ir para o Visualizador
          </button>
          <button
            onClick={handleLogout}
            style={{ padding: '10px', background: 'rgba(255, 68, 68, 0.1)', border: '1px solid rgba(255, 68, 68, 0.2)', color: '#ff6b6b', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
          >
            Sair
          </button>
        </div>
      </div>

      <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '20px', marginBottom: '30px' }}>
          <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '700' }}>Painel do Administrador</h2>
          <p style={{ margin: '4px 0 0 0', color: '#888899', fontSize: '14px' }}>Selecione um dos seus mapas para criar ou editar pontos de interesse:</p>
        </div>

        {myMaps.length === 0 ? (
          <p style={{ marginTop: '20px', color: '#888899', fontStyle: 'italic' }}>Você ainda não criou nenhum mapa. Use o formulário ao lado para fazer o upload do primeiro!</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '24px' }}>
            {myMaps.map((map) => (
              <div
                key={map.id}
                onClick={() => navigate(`/map-editor/${map.id}/pontos`)}
                style={{
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '16px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  background: 'rgba(17, 17, 34, 0.6)',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                  transition: 'transform 0.2s, border-color 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = '#5577ff';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                <img
                  src={`http://localhost:3000${map.imageUrl}`}
                  alt={map.name}
                  style={{ width: '100%', height: '130px', objectFit: 'cover', borderRadius: '8px', marginBottom: '12px' }}
                />
                <h4 style={{ margin: '0 0 4px 0', color: '#e0e0f0', fontSize: '16px', fontWeight: '600' }}>{map.name}</h4>
                <p style={{ margin: '0 0 8px 0', color: '#888899', fontSize: '12px' }}>Criado por: {map.creatorName || 'Admin'}</p>
                <small style={{ color: '#5577ff', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px' }}>ID: {map.id}</small>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
