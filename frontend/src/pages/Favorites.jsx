import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PageLayout, PageHeader, PageFooter, useTheme } from '../components/PageLayout';
import { AuthBackground } from '../components/AuthBackground';

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
  const [theme, setTheme] = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favoritePOIs, setFavoritePOIs] = useState([]);
  const [mapList, setMapList] = useState([]);
  const [user, setUser] = useState(null);

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
    setUser(decoded);

    async function loadData() {
      try {
        setLoading(true);
        // Fetch favorites (e.g., ["mapId:poiId", ...])
        const favRes = await axios.get('http://localhost:3000/api/auth/favorites', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const favList = favRes.data.favorites || [];

        // Fetch all maps to resolve details
        const mapsRes = await axios.get('http://localhost:3000/api/maps');
        const maps = mapsRes.data || [];
        setMapList(maps);

        if (favList.length === 0) {
          setFavoritePOIs([]);
          setLoading(false);
          return;
        }

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
                institutionName: map.creatorName || 'Instituição',
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
      <PageLayout theme={theme} background={<AuthBackground theme={theme} />}>
        <PageHeader theme={theme} setTheme={setTheme} isLoggedIn />
        <main className="relative z-10 flex-1 flex items-center justify-center">
          <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white/70' : 'text-[#1B2F55]/70'}`}>
            Carregando favoritos...
          </p>
        </main>
      </PageLayout>
    );
  }

  return (
    <PageLayout theme={theme} background={<AuthBackground theme={theme} />}>
      <PageHeader theme={theme} setTheme={setTheme} isLoggedIn />

      <main className="relative z-10 flex-1 flex flex-col lg:flex-row gap-8 px-6 sm:px-10 lg:px-16 pb-8">
        {/* Lado esquerdo - Favoritos */}
        <div className="w-full lg:w-[420px] flex-shrink-0">
          {/* Info do usuário */}
          <div className="mb-5">
            <p className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-[#1B2F55]'}`}>
              {user?.name || user?.email || 'Visitante'}
            </p>
            <p className={`text-xs ${theme === 'dark' ? 'text-white/60' : 'text-[#1B2F55]/60'}`}>
              Perfil: Visitante
            </p>
          </div>

          <h2 className={`text-xl font-extrabold mb-1 ${theme === 'dark' ? 'text-white' : 'text-[#1B2F55]'}`}>
            Pontos de Interesse
          </h2>
          <h2 className={`text-xl font-extrabold mb-5 ${theme === 'dark' ? 'text-white' : 'text-[#1B2F55]'}`}>
            Favoritos:
          </h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 text-red-400 text-sm">
              {error}
            </div>
          )}

          {favoritePOIs.length === 0 ? (
            <div className={`text-center py-12 rounded-xl border border-dashed ${
              theme === 'dark' ? 'border-white/10 bg-white/3' : 'border-[#1B2F55]/10 bg-[#1B2F55]/3'
            }`}>
              <span className="text-4xl block mb-3">⭐</span>
              <p className={`text-sm font-semibold mb-1 ${theme === 'dark' ? 'text-white/50' : 'text-[#1B2F55]/50'}`}>
                Nenhum favorito encontrado
              </p>
              <p className={`text-xs ${theme === 'dark' ? 'text-white/35' : 'text-[#1B2F55]/35'}`}>
                Você pode favoritar pontos clicando neles no mapa.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {favoritePOIs.map((item) => (
                <div
                  key={`${item.mapId}-${item.poiId}`}
                  className={`flex gap-4 p-3 rounded-xl transition-all duration-200 hover:shadow-md ${
                    theme === 'dark'
                      ? 'bg-[#0f2346]/80 border border-white/10 hover:border-blue-400/30'
                      : 'bg-white/80 border border-[#1B2F55]/10 hover:border-[#4A7FD4]/30'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className={`w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden ${
                    theme === 'dark' ? 'bg-[#1a3a6e]' : 'bg-[#6b8fc7]'
                  }`}>
                    {item.photoUrl ? (
                      <img
                        src={`http://localhost:3000${item.photoUrl}`}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/50 text-[10px] text-center px-1">
                        Imagem do lugar
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-[10px] mb-0.5 ${theme === 'dark' ? 'text-white/40' : 'text-[#1B2F55]/40'}`}>
                      <span className="font-bold">Instituição:</span> {item.institutionName}
                    </p>
                    <p className={`text-[10px] mb-0.5 ${theme === 'dark' ? 'text-white/40' : 'text-[#1B2F55]/40'}`}>
                      <span className="font-bold">Nome do Local:</span> {item.name}
                    </p>
                    <p className={`text-[10px] leading-relaxed ${theme === 'dark' ? 'text-white/40' : 'text-[#1B2F55]/40'}`}>
                      <span className="font-bold">Descrição:</span> {item.description}
                    </p>
                  </div>

                  {/* Botão favorito */}
                  <button
                    onClick={() => handleRemoveFavorite(item.mapId, item.poiId)}
                    className="flex-shrink-0 self-center text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                    title="Remover dos favoritos"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lado direito - Grid de mapas cadastrados */}
        <div className="flex-1 min-w-0">
          <h2 className={`text-2xl sm:text-3xl font-extrabold mb-6 ${theme === 'dark' ? 'text-white' : 'text-[#1B2F55]'}`}>
            Mapas cadastrados:
          </h2>

          <div className={`rounded-2xl p-5 sm:p-6 ${theme === 'dark' ? 'bg-[#0f2346]/80 border border-white/10' : 'bg-[#c0cfe6]/50 border border-[#1B2F55]/10'}`}>
            {mapList.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-4xl block mb-3">🗺️</span>
                <p className={`text-sm ${theme === 'dark' ? 'text-white/50' : 'text-[#1B2F55]/50'}`}>
                  Nenhum mapa disponível.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
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
        </div>
      </main>
    </PageLayout>
  );
}
