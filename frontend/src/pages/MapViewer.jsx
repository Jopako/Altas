import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
  MapContainer,
  ImageOverlay,
  GeoJSON,
  Polyline,
  useMap
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PageLayout, PageHeader, PageFooter, useTheme } from '../components/PageLayout';
import { buildGraph, nearestNode, dijkstra } from '../lib/graph';

// ----- Constantes globais -----
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

const ORIGEM_STYLE = { color: '#22c55e', weight: 3, fillColor: '#22c55e', fillOpacity: 0.35 };
const DESTINO_STYLE = { color: '#ef4444', weight: 3, fillColor: '#ef4444', fillOpacity: 0.35 };

// ----- Funções auxiliares -----
function getFeatureCenter(feature) {
  if (!feature?.geometry) return null;
  const { type, coordinates } = feature.geometry;

  if (type === 'Point') {
    const [lng, lat] = coordinates;
    return { lng, lat };
  }

  if (type === 'LineString') {
    const pts = coordinates;
    if (!pts?.length) return null;
    const mid = pts[Math.floor(pts.length / 2)];
    return { lng: mid[0], lat: mid[1] };
  }

  if (type === 'Polygon') {
    const ring = coordinates[0] || [];
    if (!ring.length) return null;
    const points = ring.length > 1 &&
      ring[0][0] === ring[ring.length - 1][0] &&
      ring[0][1] === ring[ring.length - 1][1]
      ? ring.slice(0, -1)
      : ring;
    const sum = points.reduce(
      (acc, [lng, lat]) => ({ lng: acc.lng + lng, lat: acc.lat + lat }),
      { lng: 0, lat: 0 }
    );
    return { lng: sum.lng / points.length, lat: sum.lat / points.length };
  }

  if (type === 'MultiPolygon') {
    return getFeatureCenter({ geometry: { type: 'Polygon', coordinates: coordinates[0] } });
  }

  return null;
}

function getFeatureKey(feature, index) {
  return feature?.properties?.id
    || feature?.properties?.name
    || `feature-${index}`;
}

function getFeatureLabel(feature, index) {
  const props = feature?.properties || {};
  if (props.name) return props.name;
  if (props.kind === 'area') return `Área ${index + 1}`;
  if (props.kind === 'edge') return `Corredor ${index + 1}`;
  return `Local ${index + 1}`;
}

// ----- Componentes internos -----
function FundoEsquematico({ theme, size = 1000, step = 50 }) {
  const isDark = theme === 'dark';
  const color = isDark ? '#1e3a5f' : '#c7d5ea';
  const majorColor = isDark ? '#2a4a78' : '#9fb4d4';

  const lines = [];
  for (let i = 0; i <= size; i += step) {
    const isMajor = i % (step * 5) === 0;
    const style = {
      color: isMajor ? majorColor : color,
      weight: isMajor ? 1 : 0.5,
      opacity: isMajor ? 0.35 : 0.16,
      interactive: false,
    };
    lines.push(
      <Polyline key={`h${i}`} positions={[[i, 0], [i, size]]} pathOptions={style} />
    );
    lines.push(
      <Polyline key={`v${i}`} positions={[[0, i], [size, i]]} pathOptions={style} />
    );
  }
  return <>{lines}</>;
}

function RouteLayer({ caminho }) {
  const map = useMap();
  const polylineRef = useRef(null);

  useEffect(() => {
    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    if (!caminho || caminho.length < 2) return;

    const latlngs = caminho.map((key) => {
      const [x, y] = key.split(',').map(Number);
      return L.latLng(y, x);
    });

    const polyline = L.polyline(latlngs, {
      color: '#f59e0b',
      weight: 5,
      opacity: 0.9,
      dashArray: null,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    polylineRef.current = polyline;

    map.fitBounds(polyline.getBounds(), { padding: [40, 40] });

    return () => {
      if (polylineRef.current) {
        polylineRef.current.remove();
        polylineRef.current = null;
      }
    };
  }, [caminho, map]);

  return null;
}

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

// ----- Componente principal -----
export default function MapViewer() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [theme, setTheme] = useTheme();

  const [mapData, setMapData] = useState(null);
  const [mapList, setMapList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const favoritesRef = useRef([]);
  const poiToFocusRef = useRef(null);

  const [modoEsquematico, setModoEsquematico] = useState(false);

  const [navOrigem, setNavOrigem] = useState(null);
  const [navDestino, setNavDestino] = useState(null);
  const [alvoAtivo, setAlvoAtivo] = useState('origem'); // 'origem' | 'destino'
  const [somenteAcessivel, setSomenteAcessivel] = useState(false);
  const [rotaCaminho, setRotaCaminho] = useState(null);
  const [rotaError, setRotaError] = useState('');

  const poiLayersRef = useRef(new Map());
  const alvoAtivoRef = useRef('origem');
  const handlePoiClickRef = useRef(null);

  useEffect(() => {
    favoritesRef.current = favorites;
  }, [favorites]);

  useEffect(() => {
    poiToFocusRef.current = searchParams.get('poi');
  }, [searchParams]);

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

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

  // Aceita Point, Polygon, LineString e MultiPolygon. Exclui corredores.
  const listaPois = (mapData?.features?.features || [])
    .map((f, index) => {
      const center = getFeatureCenter(f);
      if (!center) return null;
      return {
        feature: f,
        index,
        key: getFeatureKey(f, index),
        label: getFeatureLabel(f, index),
        lng: center.lng,
        lat: center.lat,
        kind: f.properties?.kind || f.geometry?.type,
      };
    })
    .filter(Boolean)
    .filter((item) => item.kind !== 'edge');

  // ---------- REFS SINCRONIZADAS ----------
  // Mantém a ref do alvo atualizada com o state
  useEffect(() => {
    alvoAtivoRef.current = alvoAtivo;
  }, [alvoAtivo]);

  // Mantém a ref do handler atualizada a cada render.
  // É essa ref que o onEachFeature do Leaflet vai chamar —
  // assim ele nunca fica "congelado" com valores antigos.
  useEffect(() => {
    handlePoiClickRef.current = (poi) => {
      const alvo = alvoAtivoRef.current;
      if (alvo === 'origem') {
        if (navDestino?.id === poi.id) setNavDestino(null);
        setNavOrigem(poi);
      } else {
        if (navOrigem?.id === poi.id) return;
        setNavDestino(poi);
      }
    };
  }, [navOrigem, navDestino]);

  // Estiliza origem/destino nos layers registrados
  useEffect(() => {
    poiLayersRef.current.forEach((layer, key) => {
      if (navOrigem?.id === key) {
        if (layer.setStyle) layer.setStyle(ORIGEM_STYLE);
        layer.setZIndexOffset?.(1000);
      } else if (navDestino?.id === key) {
        if (layer.setStyle) layer.setStyle(DESTINO_STYLE);
        layer.setZIndexOffset?.(1000);
      } else {
        if (layer.setStyle) {
          layer.setStyle({ color: '#4A7FD4', weight: 2, fillColor: '#4A7FD4', fillOpacity: 0.3 });
        }
        layer.setZIndexOffset?.(0);
      }
    });
  }, [navOrigem, navDestino]);

  // Recalcula rota quando origem, destino ou filtro mudam
  useEffect(() => {
    if (!mapData?.features || !navOrigem || !navDestino) {
      setRotaCaminho(null);
      setRotaError('');
      return;
    }

    if (navOrigem.id === navDestino.id) {
      setRotaCaminho(null);
      setRotaError('Origem e destino são o mesmo local.');
      return;
    }

    if (navOrigem.lng == null || navDestino.lng == null) {
      setRotaCaminho(null);
      setRotaError('');
      return;
    }

    const graph = buildGraph(mapData.features);

    if (Object.keys(graph).length === 0) {
      setRotaCaminho(null);
      setRotaError('Nenhum corredor foi desenhado neste mapa ainda.');
      return;
    }

    const origemKey = nearestNode(graph, { lng: navOrigem.lng, lat: navOrigem.lat });
    const destinoKey = nearestNode(graph, { lng: navDestino.lng, lat: navDestino.lat });

    const resultado = dijkstra(graph, origemKey, destinoKey, { somenteAcessivel });

    if (!resultado) {
      setRotaCaminho(null);
      setRotaError(
        somenteAcessivel
          ? 'Não há rota acessível entre esses pontos.'
          : 'Não foi possível encontrar um caminho entre esses pontos.'
      );
    } else {
      setRotaCaminho(resultado.caminho);
      setRotaError('');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navOrigem, navDestino, somenteAcessivel, mapData]);

  const token = localStorage.getItem('jwt_token');
  const user = token ? decodeToken(token) : null;
  const isAdmin = user && user.role === 'admin';

  // ---------- RENDER ----------
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

  // TELA 1: Galeria
  if (!id) {
    return (
      <PageLayout theme={theme}>
        <PageHeader theme={theme} setTheme={setTheme} isLoggedIn />

        <main className="relative z-10 flex-1 px-6 sm:px-10 lg:px-16 pb-8">
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

  // TELA 2: Mapa aberto
  if (id && mapData) {
    const isDark = theme === 'dark';
    return (
      <div className={`relative min-h-[100svh] overflow-hidden ${shellOuterClasses(theme)}`}>
        <div className="absolute inset-0 pointer-events-none opacity-70">
          <div className={`absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full blur-3xl ${
            isDark ? 'bg-[#4A7FD4]/15' : 'bg-[#93c5fd]/30'
          }`} />
        </div>

        <button
          onClick={() => navigate('/map-viewer')}
          className={`absolute left-4 top-4 z-20 ${actionButtonClasses} ${
            isDark
              ? 'bg-white/10 text-white border border-white/10 hover:bg-white/15'
              : 'bg-white/90 text-[#1B2F55] border border-[#1B2F55]/10 hover:bg-white'
          }`}
        >
          ⬅ Voltar para a Galeria
        </button>

        <button
          onClick={() => setModoEsquematico((v) => !v)}
          className={`absolute right-4 top-16 z-30 ${actionButtonClasses} ${
            isDark
              ? 'bg-[#4A7FD4]/90 text-white border border-white/15 hover:bg-[#4A7FD4]'
              : 'bg-[#3F64A6] text-white border border-[#1B2F55]/15 hover:bg-[#2F5EA8]'
          }`}
          title="Alterna entre planta original e modo esquemático"
        >
          {modoEsquematico ? '🗺️ Ver planta' : '✨ Sem planta'}
        </button>

        <div className={`absolute right-4 top-4 z-20 max-w-[calc(100vw-2rem)] rounded-2xl border px-4 py-3 text-xs sm:text-sm ${panelClasses(theme)}`}>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-semibold">Planta:</span>
            <span className="font-medium">{mapData.name}</span>
            <span className={`hidden sm:inline ${isDark ? 'text-white/20' : 'text-[#1B2F55]/20'}`}>|</span>
            <span className="font-semibold">Criado por:</span>
            <span className={isDark ? 'text-blue-300 font-semibold' : 'text-[#3F64A6] font-semibold'}>
              {mapData.creatorName || 'Administrador'}
            </span>
          </div>
        </div>

        {/* Painel de Navegação */}
        {listaPois.length >= 2 && (
          <div
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className={`absolute left-4 bottom-6 z-20 w-[min(340px,calc(100vw-2rem))] rounded-2xl border px-4 py-4 text-xs sm:text-sm ${panelClasses(theme)}`}
          >
            <p className="font-bold mb-1 text-sm">🧭 Traçar rota</p>
            <p className={`text-[11px] mb-3 ${isDark ? 'text-white/50' : 'text-[#1B2F55]/50'}`}>
              Clique numa caixa abaixo e depois clique num local do mapa.
            </p>

            <datalist id="poi-list-nav">
              {listaPois.map((item) => (
                <option key={item.key} value={item.label} />
              ))}
            </datalist>

            <div className="flex flex-col gap-2">
              <label className="flex flex-col gap-1">
                <span className={`font-semibold flex items-center gap-1.5 ${isDark ? 'text-white/70' : 'text-[#1B2F55]/70'}`}>
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500" />
                  Origem
                  {alvoAtivo === 'origem' && (
                    <span className="ml-auto text-[10px] font-bold text-green-500">
                      ← clique no mapa
                    </span>
                  )}
                </span>
                <input
                  list="poi-list-nav"
                  value={navOrigem?.name || ''}
                  onClick={(e) => { e.stopPropagation(); setAlvoAtivo('origem'); }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    const nome = e.target.value;
                    const item = listaPois.find((p) => p.label === nome);
                    if (item) {
                      setNavOrigem({ id: item.key, name: item.label, lng: item.lng, lat: item.lat });
                    } else {
                      setNavOrigem(nome ? { id: null, name: nome, lng: null, lat: null } : null);
                    }
                  }}
                  placeholder="Clique aqui e depois no mapa…"
                  className={`w-full rounded-lg border-2 px-3 py-2 text-sm outline-none transition-all ${
                    alvoAtivo === 'origem'
                      ? 'border-green-500 ring-2 ring-green-500/30'
                      : (isDark
                          ? 'border-white/15 bg-white/5 text-white placeholder:text-white/30'
                          : 'border-[#1B2F55]/15 bg-white text-[#1B2F55] placeholder:text-[#1B2F55]/30')
                  } ${isDark ? 'bg-white/5 text-white placeholder:text-white/30' : 'bg-white text-[#1B2F55] placeholder:text-[#1B2F55]/30'}`}
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className={`font-semibold flex items-center gap-1.5 ${isDark ? 'text-white/70' : 'text-[#1B2F55]/70'}`}>
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500" />
                  Destino
                  {alvoAtivo === 'destino' && (
                    <span className="ml-auto text-[10px] font-bold text-red-500">
                      ← clique no mapa
                    </span>
                  )}
                </span>
                <input
                  list="poi-list-nav"
                  value={navDestino?.name || ''}
                  onClick={(e) => { e.stopPropagation(); setAlvoAtivo('destino'); }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    const nome = e.target.value;
                    const item = listaPois.find((p) => p.label === nome);
                    if (item) {
                      setNavDestino({ id: item.key, name: item.label, lng: item.lng, lat: item.lat });
                    } else {
                      setNavDestino(nome ? { id: null, name: nome, lng: null, lat: null } : null);
                    }
                  }}
                  placeholder="Clique aqui e depois no mapa…"
                  className={`w-full rounded-lg border-2 px-3 py-2 text-sm outline-none transition-all ${
                    alvoAtivo === 'destino'
                      ? 'border-red-500 ring-2 ring-red-500/30'
                      : (isDark
                          ? 'border-white/15 bg-white/5 text-white placeholder:text-white/30'
                          : 'border-[#1B2F55]/15 bg-white text-[#1B2F55] placeholder:text-[#1B2F55]/30')
                  } ${isDark ? 'bg-white/5 text-white placeholder:text-white/30' : 'bg-white text-[#1B2F55] placeholder:text-[#1B2F55]/30'}`}
                />
              </label>

              <label className={`flex items-center gap-2 cursor-pointer select-none mt-1 ${isDark ? 'text-white/70' : 'text-[#1B2F55]/70'}`}>
                <input
                  type="checkbox"
                  checked={somenteAcessivel}
                  onChange={(e) => setSomenteAcessivel(e.target.checked)}
                  className="accent-[#f59e0b] w-4 h-4"
                />
                Somente rota acessível (sem escadas)
              </label>

              {rotaError && (
                <p className="mt-1 text-xs text-red-400 font-medium">{rotaError}</p>
              )}

              {rotaCaminho && !rotaError && (
                <p className="mt-1 text-xs text-[#f59e0b] font-medium">✅ Rota encontrada!</p>
              )}

              {(navOrigem || navDestino || rotaCaminho) && (
                <button
                  onClick={() => {
                    setNavOrigem(null);
                    setNavDestino(null);
                    setRotaCaminho(null);
                    setRotaError('');
                    setAlvoAtivo('origem');
                  }}
                  className={`mt-1 w-full rounded-lg py-1.5 text-xs font-semibold transition-colors ${
                    isDark
                      ? 'bg-white/10 text-white/80 hover:bg-white/15'
                      : 'bg-[#1B2F55]/10 text-[#1B2F55] hover:bg-[#1B2F55]/15'
                  }`}
                >
                  Limpar rota
                </button>
              )}
            </div>
          </div>
        )}

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
                background: modoEsquematico
                  ? (isDark
                      ? 'radial-gradient(circle at 50% 40%, #0f2346 0%, #071427 70%, #050d1c 100%)'
                      : 'radial-gradient(circle at 50% 40%, #eef4fb 0%, #dbe6f5 60%, #c7d5ea 100%)')
                  : (isDark ? '#071427' : '#edf3f9')
              }}
            >
                {modoEsquematico && <FundoEsquematico theme={theme} />}

                {!modoEsquematico && (
                  <ImageOverlay
                    url={`http://localhost:3000${mapData?.imageUrl}`}
                    bounds={bounds}
                  />
                )}

                <GeoJSON
                  key={id}
                  data={mapData?.features}
                  onEachFeature={(feature, layer) => {
                    const props = feature.properties || {};
                    const index = (mapData?.features?.features || []).indexOf(feature);
                    const poiId = getFeatureKey(feature, index);
                    const label = getFeatureLabel(feature, index);
                    const desc = props.description || 'Sem descrição';
                    const photoHtml = props.photoUrl
                      ? `<img src="http://localhost:3000${props.photoUrl}" style="width: 100%; max-height: 150px; object-fit: cover; border-radius: 10px; margin-top: 8px; display: block;" />`
                      : '';

                    const favoriteButtonHtml = isAdmin
                      ? ''
                      : `<button id="btn-fav-${poiId}" style="margin-top:10px; width:100%; padding:8px 10px; background:#4A7FD4; color:#fff; border:none; border-radius:999px; font-weight:600; cursor:pointer; font-size:12px; display:flex; align-items:center; justify-content:center; gap:4px;">☆ Favoritar</button>`;

                    layer.bindPopup(`
                      <div style="font-family: Inter, sans-serif; min-width: 190px; color: #0b1b3b;">
                      <h3 style="margin: 0 0 6px 0; color: #1B2F55; font-size: 15px; font-weight: 700;">${label}</h3>
                      <p style="margin: 0 0 8px 0; color: #5b6b86; font-size: 12px; line-height: 1.45;">${desc}</p>
                      ${photoHtml}
                      ${favoriteButtonHtml}
                      </div>`, {
                        autoPan: false,
                        closeButton: false,
                        offset: [0, -10],
                    });

                    layer.on('mouseover', () => layer.openPopup());
                    layer.on('mouseout', () => layer.closePopup());

                    if (poiToFocusRef.current && poiToFocusRef.current === poiId) {
                      setTimeout(() => {
                        layer.openPopup();
                      }, 100);
                    }

                    // Registra layer e clique para qualquer feature não-corredor
                    const isEdge = props.kind === 'edge'
                      || feature.geometry?.type === 'LineString';

                    if (!isEdge) {
                      const center = getFeatureCenter(feature);
                      if (center) {
                        poiLayersRef.current.set(poiId, layer);
                        layer.on('click', (ev) => {
                          if (ev?.originalEvent) {
                            L.DomEvent.stopPropagation(ev.originalEvent);
                          }
                          // Chama a REF, que sempre tem o handler atualizado
                          handlePoiClickRef.current?.({
                            id: poiId,
                            name: label,
                            lng: center.lng,
                            lat: center.lat,
                          });
                        });
                      }
                    }

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

                <RouteLayer caminho={rotaCaminho} />
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