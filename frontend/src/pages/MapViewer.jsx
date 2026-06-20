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
import { PageLayout, PageHeader, PageFooter, useTheme } from '../components/PageLayout';

const bounds = [
  [0, 0],
  [1000, 1000]
];

const shellOuterClasses = (theme) =>
  theme === 'dark'
    ? 'bg-[radial-gradient(circle_at_top,rgba(74,127,212,0.14),transparent_42%),linear-gradient(180deg,#071427_0%,#0b1830_55%,#071427_100%)] text-white'
    : 'bg-transparent text-[#1B2F55]';

const panelClasses = (theme) =>
  theme === 'dark'
    ? 'bg-[#0b1830]/85 border-white/10 shadow-[0_18px_50px_rgba(0,0,0,0.24)] backdrop-blur-xl'
    : 'bg-[#f1f6fb] border-[#1B2F55]/10 shadow-[0_16px_40px_rgba(27,47,85,0.08)] backdrop-blur-xl';

const actionButtonClasses =
  'inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5';

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
  const [theme, setTheme] = useTheme();
  
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

  const token = localStorage.getItem('jwt_token');
  const user = token ? decodeToken(token) : null;
  const isAdmin = user && user.role === 'admin';

  if (loading) {
    return (
      <PageLayout theme={theme}>
        <PageHeader theme={theme} setTheme={setTheme} isLoggedIn />
        <main className="relative z-10 flex-1 flex items-center justify-center">
          <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white/70' : 'text-[#1B2F55]/70'}`}>
            Carregando dados...
          </p>
        </main>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout theme={theme}>
        <PageHeader theme={theme} setTheme={setTheme} isLoggedIn />
        <main className="relative z-10 flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-red-400 text-lg font-semibold">Ops! {error}</p>
          <button
            onClick={() => navigate('/map-viewer')}
            className="px-5 py-2 bg-[#F59E0B] text-[#0B1B3B] font-semibold rounded-lg hover:bg-[#d97706] transition-colors cursor-pointer"
          >
            Voltar para a Galeria
          </button>
        </main>
      </PageLayout>
    );
  }

  // TELA 1: Se o ID estiver ausente na URL, mostra a galeria de mapas
  if (!id) {
    return (
      <PageLayout theme={theme}>
        <PageHeader theme={theme} setTheme={setTheme} isLoggedIn />

        <main className="relative z-10 flex-1 px-6 sm:px-10 lg:px-16 pb-8">
          {/* Info do usuário + Botão ação */}
          <div className="flex items-start justify-between mb-6">
            <h2 className={`text-2xl sm:text-3xl font-extrabold ${theme === 'dark' ? 'text-white' : 'text-[#1B2F55]'}`}>
              Mapas da Instituição
            </h2>

            <div className="flex flex-col items-end gap-3">
              <div className="text-right">
                <p className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-[#1B2F55]'}`}>
                  {user?.name || user?.email || 'Usuário'}
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-white/60' : 'text-[#1B2F55]/60'}`}>
                  Perfil: {isAdmin ? 'Administrador' : 'Visitante'}
                </p>
              </div>

              {isAdmin ? (
                <button
                  onClick={() => navigate('/map-editor')}
                  className="flex items-center gap-2 px-4 py-2 bg-[#F59E0B] text-[#0B1B3B] text-sm font-semibold rounded-lg hover:bg-[#d97706] transition-colors cursor-pointer"
                >
                  Novo mapa/Ponto de interesse
                </button>
              ) : (
                <button
                  onClick={() => navigate('/favoritos')}
                  className="flex items-center gap-2 px-4 py-2 bg-[#F59E0B] text-[#0B1B3B] text-sm font-semibold rounded-lg hover:bg-[#d97706] transition-colors cursor-pointer"
                >
                  ⭐ Favoritos
                </button>
              )}
            </div>
          </div>

          {/* Grid container com fundo cinza */}
          <div className={`rounded-2xl p-6 sm:p-8 ${theme === 'dark' ? 'bg-[#0f2346]/80 border border-white/10' : 'bg-[#c0cfe6]/50 border border-[#1B2F55]/10'}`}>
            {mapList.length === 0 ? (
              <div className="text-center py-16">
                <span className="text-5xl block mb-4">🗺️</span>
                <p className={`text-sm ${theme === 'dark' ? 'text-white/50' : 'text-[#1B2F55]/50'}`}>
                  Nenhum mapa foi publicado no sistema ainda.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                {mapList.map((map) => (
                  <div
                    key={map.id}
                    onClick={() => navigate(`/map-viewer/${map.id}`)}
                    className={`group rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
                      theme === 'dark'
                        ? 'bg-[#0d203b] border border-white/10 hover:border-blue-400/40'
                        : 'bg-white border border-[#1B2F55]/10 hover:border-[#4A7FD4]/40'
                    }`}
                  >
                    <div className={`aspect-[4/3] flex items-center justify-center overflow-hidden ${
                      theme === 'dark' ? 'bg-[#1a3a6e]' : 'bg-[#6b8fc7]'
                    }`}>
                      <img
                        src={`http://localhost:3000${map.imageUrl}`}
                        alt={map.name}
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                    <div className="p-3">
                      <p className={`text-xs font-semibold truncate ${theme === 'dark' ? 'text-white' : 'text-[#1B2F55]'}`}>
                        {map.name}
                      </p>
                      <p className={`text-[10px] mt-0.5 ${theme === 'dark' ? 'text-white/50' : 'text-[#1B2F55]/50'}`}>
                        {map.creatorName || 'Administrador'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </PageLayout>
    );
  }

  // TELA 2: Se houver ID na URL, abre o mapa em tela cheia com seus pontos (GeoJSON)
  if (id && mapData) {
    return (
      <div className={`relative min-h-[100svh] overflow-hidden ${shellOuterClasses(theme)}`}>
        <div className="absolute inset-0 pointer-events-none opacity-70">
          <div className={`absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full blur-3xl ${
            theme === 'dark' ? 'bg-[#4A7FD4]/15' : 'bg-[#93c5fd]/30'
          }`} />
        </div>

        <button 
          onClick={() => navigate('/map-viewer')}
          className={`absolute left-4 top-4 z-20 ${actionButtonClasses} ${
            theme === 'dark'
              ? 'bg-white/10 text-white border border-white/10 hover:bg-white/15'
              : 'bg-white/90 text-[#1B2F55] border border-[#1B2F55]/10 hover:bg-white'
          }`}
        >
          ⬅ Voltar para a Galeria
        </button>

        <div className={`absolute right-4 top-4 z-20 max-w-[calc(100vw-2rem)] rounded-2xl border px-4 py-3 text-xs sm:text-sm ${panelClasses(theme)}`}>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-semibold">Planta:</span>
            <span className="font-medium">{mapData.name}</span>
            <span className={`hidden sm:inline ${theme === 'dark' ? 'text-white/20' : 'text-[#1B2F55]/20'}`}>|</span>
            <span className="font-semibold">Criado por:</span>
            <span className={theme === 'dark' ? 'text-blue-300 font-semibold' : 'text-[#3F64A6] font-semibold'}>
              {mapData.creatorName || 'Administrador'}
            </span>
          </div>
        </div>

        <div className="relative mx-auto flex min-h-[100svh] w-full max-w-[1600px] items-center justify-center px-3 pb-3 pt-24 sm:px-6 sm:pt-24 lg:px-10 lg:pb-8">
          <div className={`w-full overflow-hidden rounded-[28px] border ${panelClasses(theme)}`}>
            <div className="flex min-h-[calc(100svh-7rem)] flex-col">
            <MapContainer
              crs={L.CRS.Simple}
              bounds={bounds}
              className="flex-1"
              style={{
                height: '100%',
                width: '100%',
                background: theme === 'dark' ? '#071427' : '#edf3f9'
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
                      ? `<img src="http://localhost:3000${props.photoUrl}" style="width: 100%; max-height: 150px; object-fit: cover; border-radius: 10px; margin-top: 8px; display: block;" />`
                      : '';

                    const favoriteButtonHtml = isAdmin
                      ? ''
                      : `<button id="btn-fav-${poiId}" style="margin-top:10px; width:100%; padding:8px 10px; background:#4A7FD4; color:#fff; border:none; border-radius:999px; font-weight:600; cursor:pointer; font-size:12px; display:flex; align-items:center; justify-content:center; gap:4px;">☆ Favoritar</button>`;

                    layer.bindPopup(`
                      <div style="font-family: Inter, sans-serif; min-width: 190px; color: #0b1b3b;">
                        <h3 style="margin: 0 0 6px 0; color: #1B2F55; font-size: 15px; font-weight: 700;">${name}</h3>
                        <p style="margin: 0 0 8px 0; color: #5b6b86; font-size: 12px; line-height: 1.45;">${desc}</p>
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
                            btn.style.background = isFav ? '#dc2626' : '#4A7FD4';
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <PageLayout theme={theme}>
      <PageHeader theme={theme} setTheme={setTheme} isLoggedIn />
      <main className="relative z-10 flex-1 flex items-center justify-center">
        <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white/70' : 'text-[#1B2F55]/70'}`}>
          Carregando dados do mapa...
        </p>
      </main>
    </PageLayout>
  );
}
