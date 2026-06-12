import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  MapContainer,
  ImageOverlay,
  GeoJSON
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const bounds = [
  [0, 0],
  [1000, 1000]
];

function decodeToken(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export default function MapViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [mapData, setMapData] = useState(null);
  const [mapList, setMapList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const favoritesRef = useRef([]);

  useEffect(() => {
    favoritesRef.current = favorites;
  }, [favorites]);

  // Verificação de token
  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  // Carregar favoritos apenas para visitantes.
  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    const decoded = token ? decodeToken(token) : null;
    if (!token || decoded?.role === 'admin') {
      setFavorites([]);
      return;
    }

    axios.get('http://localhost:3000/api/auth/favorites', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setFavorites(res.data.favorites || []);
    })
    .catch(err => {
      console.error('Erro ao carregar favoritos:', err);
    });
  }, [id]);

  useEffect(() => {
    if (id) {
      async function loadMap() {
        try {
          setLoading(true);
          const res = await axios.get(`http://localhost:3000/api/maps/${id}`);
          setMapData(res.data);
          setError(null);
        } catch (err) {
          console.error("Erro ao carregar o mapa:", err);
          setError("Não foi possível abrir este mapa.");
        } finally {
          setLoading(false);
        }
      }
      loadMap();
    } else {
      async function fetchMaps() {
        try {
          setLoading(true);
          const res = await axios.get("http://localhost:3000/api/maps");
          setMapList(res.data);
          setMapData(null);
          setError(null);
        } catch (err) {
          console.error("Erro ao listar mapas:", err);
          setError("Erro ao carregar a galeria de mapas.");
        } finally {
          setLoading(false);
        }
      }
      fetchMaps();
    }
  }, [id]);

  async function toggleFavorite(poiId) {
    const token = localStorage.getItem('jwt_token');
    const decoded = token ? decodeToken(token) : null;
    if (!token || !mapData || decoded?.role === 'admin') return null;

    try {
      const res = await axios.post('http://localhost:3000/api/auth/favorites/toggle', {
        mapId: mapData.id,
        poiId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const nextFavorites = res.data.favorites || [];
      favoritesRef.current = nextFavorites;
      setFavorites(nextFavorites);
      return nextFavorites;
    } catch (err) {
      console.error('Erro ao favoritar POI:', err);
      return null;
    }
  }

  function handleLogout() {
    localStorage.removeItem('jwt_token');
    navigate('/login');
  }

  if (loading) {
    return (
      <div style={{ background: '#0a0a1a', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <h1 style={{ color: '#e0e0f0', fontFamily: 'sans-serif' }}>Carregando dados...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: '#0a0a1a', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontFamily: 'sans-serif', gap: '20px' }}>
        <h2 style={{ color: '#ff6b6b' }}>Ops! {error}</h2>
        <button 
          onClick={() => navigate('/map-viewer')}
          style={{ padding: '10px 20px', background: '#007bff', color: '#white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Voltar para a Galeria
        </button>
      </div>
    );
  }

  const token = localStorage.getItem('jwt_token');
  const user = token ? decodeToken(token) : null;
  const isAdmin = user && user.role === 'admin';

  // TELA 1: Se o ID estiver ausente na URL, mostra a galeria de mapas
  if (!id) {
    return (
      <div style={{ background: '#0a0a1a', minHeight: '100vh', padding: '40px', fontFamily: "'Inter', sans-serif", color: '#e0e0f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '20px', marginBottom: '30px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '32px', fontFamily: "'JetBrains Mono', monospace", background: 'linear-gradient(135deg, #4466ff 0%, #aa55ff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '700' }}>🗺️ ALTAS</h1>
            <p style={{ margin: '4px 0 0 0', color: '#888899', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Galeria de Mapas Disponíveis</p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            {isAdmin ? (
              <button 
                onClick={() => navigate('/map-editor')}
                style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #00b4db 0%, #0083b0 100%)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', boxShadow: '0 4px 12px rgba(0, 180, 219, 0.3)' }}
              >
                ➕ Novo Mapa/Ponto de Interesse
              </button>
            ) : (
              <button 
                onClick={() => navigate('/favoritos')}
                style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #ff9900 0%, #ff5500 100%)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', boxShadow: '0 4px 12px rgba(255, 153, 0, 0.3)' }}
              >
                ⭐ Favoritos
              </button>
            )}
            <button 
              onClick={handleLogout}
              style={{ padding: '10px 20px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#e0e0f0', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
            >
              Sair
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '10px' }}>
          <span style={{ fontSize: '14px', color: '#888899' }}>Olá, <strong>{user?.name || user?.email || 'Visitante'}</strong> ({user?.role === 'admin' ? 'Administrador' : 'Visitante'})</span>
        </div>
        
        {mapList.length === 0 ? (
          <p style={{ marginTop: '20px', fontStyle: 'italic', color: '#888899' }}>Nenhum mapa foi publicado no sistema ainda.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '30px', marginTop: '20px' }}>
            {mapList.map((map) => (
              <div 
                key={map.id} 
                onClick={() => navigate(`/map-viewer/${map.id}`)}
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
                  style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px', marginBottom: '14px', border: '1px solid rgba(255, 255, 255, 0.05)' }} 
                />
                <h4 style={{ margin: '0 0 4px 0', color: '#e0e0f0', fontSize: '18px', fontWeight: '600' }}>{map.name}</h4>
                <p style={{ margin: '0 0 10px 0', color: '#888899', fontSize: '13px' }}>
                  Criado por: <span style={{ color: '#aaa' }}>{map.creatorName || 'Administrador'}</span>
                </p>
                <small style={{ color: '#5577ff', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px' }}>ID: {map.id}</small>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // TELA 2: Se houver ID na URL, abre o mapa em tela cheia com seus pontos (GeoJSON)
  if (id && mapData) {
    return (
      <div style={{ position: 'relative', height: '100vh', width: '100%', background: '#c4c4c4ff' }}>
        
        {/* Botão flutuante para voltar à galeria */}
        <button 
          onClick={() => navigate('/map-viewer')}
          style={{
            position: 'absolute',
            top: '15px',
            left: '60px',
            zIndex: 1000,
            padding: '10px 16px',
            background: 'rgba(17, 17, 34, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            cursor: 'pointer',
            fontWeight: 'bold',
            color: '#e0e0f0',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(85, 119, 255, 0.2)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(17, 17, 34, 0.85)'}
        >
          ⬅ Voltar para a Galeria
        </button>

        {/* Banner de informações da Planta com o Nome do Admin Criador */}
        <div style={{
          position: 'absolute',
          top: '15px',
          right: '20px',
          zIndex: 1000,
          padding: '10px 20px',
          background: 'rgba(17, 17, 34, 0.85)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          color: '#e0e0f0',
          fontFamily: "'Inter', sans-serif",
          fontSize: '13px'
        }}>
          <strong>Planta:</strong> {mapData.name} <span style={{ margin: '0 8px', color: 'rgba(255, 255, 255, 0.15)' }}>|</span> <strong>Criado por:</strong> <span style={{ color: '#5577ff', fontWeight: 'bold' }}>{mapData.creatorName || 'Administrador'}</span>
        </div>

        <MapContainer
          crs={L.CRS.Simple}
          bounds={bounds}
          style={{
            height: '100%',
            width: '100%'
          }}
        >
          <ImageOverlay
            url={`http://localhost:3000${mapData?.imageUrl}`}
            bounds={bounds}
          />

          <GeoJSON
            key={id} 
            data={mapData?.features}
            onEachFeature={(feature, layer) => {
              const props = feature.properties || {};
              const poiId = props.id || props.name || Math.random().toString(36).substr(2, 9);
              const name = props.name || 'Sem nome';
              const desc = props.description || 'Sem descrição';
              const photoHtml = props.photoUrl 
                ? `<img src="http://localhost:3000${props.photoUrl}" style="width: 100%; max-height: 150px; object-fit: cover; border-radius: 6px; margin-top: 8px; display: block;" />`
                : '';

              const favoriteButtonHtml = isAdmin
                ? ''
                : `<button id="btn-fav-${poiId}" style="margin-top:10px; width:100%; padding:6px; background:#ff9900; color:#fff; border:none; border-radius:4px; font-weight:bold; cursor:pointer; font-size:12px; display:flex; align-items:center; justify-content:center; gap:4px; transition: background 0.2s;">☆ Favoritar</button>`;

              layer.bindPopup(`
                <div style="font-family: 'Inter', sans-serif; min-width: 180px; color: #fff;">
                  <h3 style="margin: 0 0 6px 0; color: #5577ff; font-size: 15px; font-weight: 700;">${name}</h3>
                  <p style="margin: 0 0 8px 0; color: #888899; font-size: 12px; line-height: 1.4;">${desc}</p>
                  ${photoHtml}
                  ${favoriteButtonHtml}
                </div>
              `);

              if (!isAdmin) {
                layer.on('popupopen', () => {
                  setTimeout(() => {
                    const btn = document.getElementById(`btn-fav-${poiId}`);
                    if (!btn) return;

                    const key = `${id}:${poiId}`;
                    const renderFavoriteState = (favList) => {
                      const isFav = favList.includes(key);
                      btn.innerHTML = isFav ? '⭐ Remover Favorito' : '☆ Favoritar';
                      btn.style.background = isFav ? 'rgba(255, 0, 0, 0.6)' : '#ff9900';
                    };

                    renderFavoriteState(favoritesRef.current);
                    btn.onclick = async (event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      btn.disabled = true;
                      const nextFavorites = await toggleFavorite(poiId);
                      if (nextFavorites) renderFavoriteState(nextFavorites);
                      btn.disabled = false;
                    };
                  }, 50);
                });
              }
            }}
          />
        </MapContainer>
      </div>
    );
  }

  return (
    <div style={{ background: '#0a0a1a', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <h1 style={{ color: '#e0e0f0', fontFamily: 'sans-serif' }}>Carregando dados do mapa...</h1>
    </div>
  );
}
