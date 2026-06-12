import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Self-contained pure JS JWT decoder
function decodeToken(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error('Failed to decode token:', err);
    return null;
  }
}

export default function Favorites() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favoritePOIs, setFavoritePOIs] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      navigate('/login');
      return;
    }
    const decoded = decodeToken(token);
    if (decoded?.role === 'admin') {
      navigate('/map-viewer');
      return;
    }

    async function loadData() {
      try {
        setLoading(true);
        // Fetch favorites (e.g., ["mapId:poiId", ...])
        const favRes = await axios.get('http://localhost:3000/api/auth/favorites', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const favList = favRes.data.favorites || [];

        if (favList.length === 0) {
          setFavoritePOIs([]);
          setLoading(false);
          return;
        }

        // Fetch all maps to resolve details
        const mapsRes = await axios.get('http://localhost:3000/api/maps');
        const maps = mapsRes.data || [];

        // Match favorites to actual POI data
        const resolvedList = [];
        for (const favStr of favList) {
          const [mapId, poiId] = favStr.split(':');
          const map = maps.find(m => m.id === mapId);
          if (map && map.features && map.features.features) {
            const poi = map.features.features.find(f => f.properties && f.properties.id === poiId);
            if (poi) {
              resolvedList.push({
                mapId,
                mapName: map.name,
                poiId,
                name: poi.properties.name || 'Sem nome',
                description: poi.properties.description || 'Sem descrição',
                photoUrl: poi.properties.photoUrl || '',
              });
            }
          }
        }

        setFavoritePOIs(resolvedList);
      } catch (err) {
        console.error('Erro ao buscar favoritos:', err);
        setError('Não foi possível carregar os favoritos.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [navigate]);

  async function handleRemoveFavorite(mapId, poiId) {
    const token = localStorage.getItem('jwt_token');
    if (!token) return;

    try {
      await axios.post('http://localhost:3000/api/auth/favorites/toggle', { mapId, poiId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Remove from state immediately
      setFavoritePOIs(prev => prev.filter(item => !(item.mapId === mapId && item.poiId === poiId)));
    } catch (err) {
      console.error('Erro ao remover favorito:', err);
      alert('Não foi possível remover o favorito.');
    }
  }

  if (loading) {
    return (
      <div style={{ background: '#0a0a1a', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <h1 style={{ color: '#e0e0f0', fontFamily: 'sans-serif' }}>Carregando favoritos...</h1>
      </div>
    );
  }

  return (
    <div style={{ background: '#0a0a1a', minHeight: '100vh', padding: '40px', fontFamily: "'Inter', sans-serif", color: '#e0e0f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '20px', marginBottom: '30px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '32px', fontFamily: "'JetBrains Mono', monospace", background: 'linear-gradient(135deg, #4466ff 0%, #aa55ff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '700' }}>⭐ FAVORITOS</h1>
          <p style={{ margin: '4px 0 0 0', color: '#888899', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Seus Pontos de Interesse Salvos</p>
        </div>
        <button 
          onClick={() => navigate('/map-viewer')}
          style={{ padding: '10px 20px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#e0e0f0', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
        >
          Voltar para Galeria
        </button>
      </div>

      {error && (
        <div style={{ color: '#ff5555', padding: '16px', background: 'rgba(255,0,0,0.1)', borderRadius: '8px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {favoritePOIs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.08)' }}>
          <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>⭐</span>
          <h3 style={{ margin: '0 0 8px 0', color: '#888899' }}>Nenhum favorito encontrado</h3>
          <p style={{ margin: 0, color: '#666677', fontSize: '14px' }}>Você pode favoritar pontos clicando neles no mapa de visualização.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
          {favoritePOIs.map((item) => (
            <div 
              key={`${item.mapId}-${item.poiId}`} 
              style={{
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '16px',
                background: 'rgba(17, 17, 34, 0.6)',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative'
              }}
            >
              <button
                onClick={() => handleRemoveFavorite(item.mapId, item.poiId)}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(255, 153, 0, 0.15)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#ffcc00',
                  fontSize: '16px',
                  transition: 'all 0.2s',
                  zIndex: 10
                }}
                title="Remover dos favoritos"
              >
                ★
              </button>

              <div>
                {item.photoUrl ? (
                  <img 
                    src={`http://localhost:3000${item.photoUrl}`} 
                    alt={item.name} 
                    style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px', marginBottom: '14px', border: '1px solid rgba(255, 255, 255, 0.05)' }} 
                  />
                ) : (
                  <div style={{ width: '100%', height: '150px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', marginBottom: '14px', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px dashed rgba(255,255,255,0.08)', color: '#444455' }}>
                    Sem foto
                  </div>
                )}
                <h4 style={{ margin: '0 0 6px 0', color: '#e0e0f0', fontSize: '18px', fontWeight: '600' }}>{item.name}</h4>
                <p style={{ margin: '0 0 12px 0', color: '#888899', fontSize: '13px', lineHeight: '1.4' }}>{item.description}</p>
              </div>

              <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                <span style={{ display: 'block', color: '#5577ff', fontSize: '12px', marginBottom: '10px', fontWeight: '600' }}>
                  🗺️ {item.mapName}
                </span>
                <button
                  onClick={() => navigate(`/map-viewer/${item.mapId}`)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: 'linear-gradient(135deg, #4466ff 0%, #aa55ff 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '700',
                    fontSize: '13px'
                  }}
                >
                  Ver no Mapa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
