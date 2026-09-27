import { Fragment, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, GeoJSON, Polygon, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { PageLayout, PageHeader, PageFooter, useTheme } from '../components/PageLayout';
import {
  buildGraph,
  nearestNode,
  dijkstra,
  smoothPath,
  toPoint,
  lineStringToPolygon,
} from '../lib/graph';

const bounds = [[0, 0], [1000, 1000]];
const LS_KEY = 'altas_maps';

const ORIGEM_STYLE = { color: '#22c55e', weight: 3, fillColor: '#22c55e', fillOpacity: 0.35 };
const DESTINO_STYLE = { color: '#ef4444', weight: 3, fillColor: '#ef4444', fillOpacity: 0.35 };
const DEFAULT_AREA_STYLE = { color: '#00d4ff', weight: 2.5, fillColor: '#00d4ff', fillOpacity: 0.22 };
const DEFAULT_POINT_STYLE = { radius: 7, color: '#fff', weight: 2, fillColor: '#f59e0b', fillOpacity: 1 };

function loadMaps() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; }
}

const shellOuterClasses = (theme) =>
  theme === 'dark'
    ? 'bg-[radial-gradient(circle_at_top,rgba(74,127,212,0.14),transparent_42%),linear-gradient(180deg,#071427_0%,#0b1830_55%,#071427_100%)] text-white'
    : 'bg-transparent text-[#1B2F55]';

const panelClasses = (theme) =>
  theme === 'dark'
    ? 'bg-[#0b1830]/85 border-white/10 shadow-[0_18px_50px_rgba(0,0,0,0.24)] backdrop-blur-xl'
    : 'bg-[#f1f6fb] border-[#1B2F55]/10 shadow-[0_16px_40px_rgba(27,47,85,0.08)] backdrop-blur-xl';

function getFeatureCenter(feature) {
  if (!feature?.geometry) return null;
  const { type, coordinates } = feature.geometry;
  if (type === 'Point') {
    const [lng, lat] = coordinates;
    return { lng, lat };
  }
  if (type === 'Polygon') {
    const ring = coordinates[0] || [];
    if (!ring.length) return null;
    const points =
      ring.length > 1 &&
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
  return null;
}

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

function RouteFocus({ pontos }) {
  const map = useMap();
  useEffect(() => {
    if (!pontos || pontos.length < 2) return;
    const b = L.latLngBounds(pontos);
    map.fitBounds(b, { padding: [40, 40] });
  }, [pontos, map]);
  return null;
}

function falar(texto) {
  if (!('speechSynthesis' in window)) return alert('Este navegador não suporta leitura em voz.');
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(texto);
  u.lang = 'pt-BR';
  speechSynthesis.speak(u);
}

export default function MapViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [theme, setTheme] = useTheme();

  const [mapList, setMapList] = useState([]);
  const [mapData, setMapData] = useState(null);

  const [poiSelecionado, setPoiSelecionado] = useState(null);

  const [navOrigem, setNavOrigem] = useState(null);
  const [navDestino, setNavDestino] = useState(null);
  const [alvoAtivo, setAlvoAtivo] = useState('origem');
  const [somenteAcessivel, setSomenteAcessivel] = useState(false);
  const [rotaPontos, setRotaPontos] = useState(null);
  const [rotaTexto, setRotaTexto] = useState('');
  const [rotaErro, setRotaErro] = useState('');

  const alvoAtivoRef = useRef('origem');
  const handlePoiClickRef = useRef(null);
  const poiLayersRef = useRef(new Map());

  useEffect(() => {
    if (id) {
      const found = loadMaps().find((m) => m.id === id);
      setMapData(found || null);
    } else {
      setMapList(loadMaps());
    }
  }, [id]);

  useEffect(() => {
    alvoAtivoRef.current = alvoAtivo;
  }, [alvoAtivo]);

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
      setPoiSelecionado(poi.feature || null);
    };
  }, [navOrigem, navDestino]);

  useEffect(() => {
    poiLayersRef.current.forEach((layer, key) => {
      if (navOrigem?.id === key) {
        if (layer.setStyle) layer.setStyle(ORIGEM_STYLE);
        if (layer.setRadius) layer.setStyle({ ...ORIGEM_STYLE, radius: 9 });
        layer.setZIndexOffset?.(1000);
      } else if (navDestino?.id === key) {
        if (layer.setStyle) layer.setStyle(DESTINO_STYLE);
        if (layer.setRadius) layer.setStyle({ ...DESTINO_STYLE, radius: 9 });
        layer.setZIndexOffset?.(1000);
      } else {
        if (layer.setStyle) {
          if (layer instanceof L.CircleMarker) {
            layer.setStyle(DEFAULT_POINT_STYLE);
          } else {
            layer.setStyle(DEFAULT_AREA_STYLE);
          }
        }
        layer.setZIndexOffset?.(0);
      }
    });
  }, [navOrigem, navDestino]);

  // Recalcula rota
  useEffect(() => {
    if (!mapData?.features || !navOrigem || !navDestino) {
      setRotaPontos(null);
      setRotaTexto('');
      setRotaErro('');
      return;
    }

    if (navOrigem.id === navDestino.id) {
      setRotaPontos(null);
      setRotaTexto('');
      setRotaErro('Origem e destino são o mesmo local.');
      return;
    }

    if (navOrigem.lng == null || navDestino.lng == null) {
      setRotaPontos(null);
      setRotaTexto('');
      setRotaErro('');
      return;
    }

    const { graph, __meta } = buildGraph(mapData.features);

    if (!graph || Object.keys(graph).length === 0) {
      setRotaPontos(null);
      setRotaTexto('');
      setRotaErro('Nenhum corredor foi desenhado neste mapa ainda.');
      return;
    }

    const origemKey = __meta?.roomCenterKey?.get(navOrigem.id) || nearestNode(graph, [navOrigem.lng, navOrigem.lat]);
    const destinoKey = __meta?.roomCenterKey?.get(navDestino.id) || nearestNode(graph, [navDestino.lng, navDestino.lat]);

    if (!origemKey || !destinoKey) {
      setRotaPontos(null);
      setRotaTexto('');
      setRotaErro('Não foi possível localizar origem ou destino no grafo.');
      return;
    }

    const resultado = dijkstra(graph, origemKey, destinoKey, { somenteAcessivel });

    if (!resultado) {
      setRotaPontos(null);
      setRotaTexto('');
      setRotaErro(
        somenteAcessivel
          ? 'Não há rota acessível entre esses pontos.'
          : 'Não foi possível calcular uma rota entre esses pontos.'
      );
      return;
    }

    const origemPonto = { x: navOrigem.lng, y: navOrigem.lat };
    const destinoPonto = { x: navDestino.lng, y: navDestino.lat };

    const rooms = mapData.features.features
      .filter(f => f.geometry?.type === 'Polygon' &&
                   !(f.properties?.kind === 'edge' || f.properties?.tipo === 'corredor'))
      .map(f => ({ ring: f.geometry.coordinates[0] }));

    const corridorNodes = __meta?.corridorNodes || [];
    const caminhoSuave = smoothPath(resultado.caminho, rooms, corridorNodes, 0);

    const pontosFinais = [
      origemPonto,
      ...caminhoSuave.map(k => toPoint(k)),
      destinoPonto,
    ];

    const latlngs = pontosFinais.map(p => L.latLng(p.y, p.x));
    setRotaPontos(latlngs);
    setRotaTexto(`Rota de "${navOrigem.name}" até "${navDestino.name}" traçada no mapa.`);
    setRotaErro('');
  }, [navOrigem, navDestino, somenteAcessivel, mapData]);

  const areas = (mapData?.features?.features || []).filter(
    (f) => f.geometry?.type === 'Polygon' &&
           !(f.properties?.kind === 'edge' || f.properties?.tipo === 'corredor')
  );
  const pontos = (mapData?.features?.features || []).filter((f) => f.geometry?.type === 'Point');
  const corredores = (mapData?.features?.features || []).filter(
    (f) => f.properties?.kind === 'edge' || f.properties?.tipo === 'corredor'
  );
  const listaPois = [...areas, ...pontos].filter((f) => f.properties?.name);

  const inputClasses = `w-full px-3 py-2.5 rounded-xl text-sm outline-none ${
    theme === 'dark'
      ? 'bg-[#0f2346] border border-white/10 text-white'
      : 'bg-white border border-[#1B2F55]/15 text-[#1B2F55]'
  }`;

  // TELA 1: galeria
  if (!id) {
    return (
      <PageLayout theme={theme}>
        <PageHeader theme={theme} setTheme={setTheme} />
        <main className="relative z-10 flex-1 px-6 sm:px-10 lg:px-16 pb-8">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <h2 className={`text-2xl sm:text-3xl font-extrabold ${theme === 'dark' ? 'text-white' : 'text-[#1B2F55]'}`}>
              Mapas da Instituição
            </h2>
            <button
              onClick={() => navigate('/map-editor')}
              className={`px-4 py-2 rounded-full text-xs font-semibold ${
                theme === 'dark'
                  ? 'bg-white/10 text-white border border-white/10'
                  : 'bg-[#1B2F55]/10 text-[#1B2F55] border border-[#1B2F55]/10'
              }`}
            >
              ⚙️ Editar mapas
            </button>
          </div>
          <div className={`rounded-2xl p-6 sm:p-8 ${theme === 'dark' ? 'bg-[#0f2346]/80 border border-white/10' : 'bg-[#c0cfe6]/50 border border-[#1B2F55]/10'}`}>
            {mapList.length === 0 ? (
              <p className={`text-sm text-center py-16 ${theme === 'dark' ? 'text-white/50' : 'text-[#1B2F55]/50'}`}>
                Nenhum mapa disponível ainda.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                {mapList.map((map) => (
                  <div
                    key={map.id}
                    onClick={() => navigate(`/map-viewer/${map.id}`)}
                    className={`group rounded-xl overflow-hidden cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg ${
                      theme === 'dark' ? 'bg-[#0d203b] border border-white/10' : 'bg-white border border-[#1B2F55]/10'
                    }`}
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-[#1a3a6e]">
                      <img src={map.imageUrl} alt={map.name} className="w-full h-full object-cover" />
                    </div>
                    <p className={`p-3 text-xs font-semibold truncate ${theme === 'dark' ? 'text-white' : 'text-[#1B2F55]'}`}>
                      {map.name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
        <PageFooter theme={theme} />
      </PageLayout>
    );
  }

  if (!mapData) {
    return (
      <PageLayout theme={theme}>
        <PageHeader theme={theme} setTheme={setTheme} />
        <main className="relative z-10 flex-1 flex items-center justify-center">
          <p className={theme === 'dark' ? 'text-white/70' : 'text-[#1B2F55]/70'}>
            Mapa não encontrado neste navegador.
          </p>
        </main>
      </PageLayout>
    );
  }

  // TELA 2: mapa
  return (
    <div className={`relative min-h-[100svh] overflow-hidden ${shellOuterClasses(theme)}`}>
      <div className="absolute left-4 top-4 z-20 flex gap-2 flex-wrap">
        <button
          onClick={() => navigate('/map-viewer')}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            theme === 'dark'
              ? 'bg-white/10 text-white border border-white/10'
              : 'bg-white/90 text-[#1B2F55] border border-[#1B2F55]/10'
          }`}
        >
          ⬅ Voltar
        </button>
        <button
          onClick={() => navigate(`/map-editor/${id}/pontos`)}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            theme === 'dark'
              ? 'bg-white/10 text-white border border-white/10'
              : 'bg-white/90 text-[#1B2F55] border border-[#1B2F55]/10'
          }`}
        >
          ⚙️ Editar
        </button>
      </div>

      <div className="relative mx-auto flex min-h-[100svh] w-full max-w-[1600px] flex-col lg:flex-row gap-4 px-3 pb-3 pt-20 sm:px-6 lg:px-10 lg:pt-24">
        {/* Mapa */}
        <div className="flex-1 relative min-h-[380px]">
          <div className={`absolute inset-0 rounded-[28px] overflow-hidden border ${panelClasses(theme)}`}>
            <MapContainer
              crs={L.CRS.Simple}
              bounds={bounds}
              className="h-full w-full"
              style={{
                height: '100%',
                width: '100%',
                background:
                  theme === 'dark'
                    ? 'radial-gradient(circle at 50% 40%, #0f2346 0%, #071427 70%, #050d1c 100%)'
                    : 'radial-gradient(circle at 50% 40%, #eef4fb 0%, #dbe6f5 60%, #c7d5ea 100%)',
              }}
            >
              <FundoEsquematico theme={theme} />

              {/* Corredores: faixa visual + eixo tracejado */}
              {corredores.map((f) => {
                const coords = f.geometry?.type === 'Polygon'
                  ? f.geometry.coordinates[0]
                  : f.geometry?.coordinates;
                if (!coords || coords.length < 2) return null;

                const largura = f.properties?.largura || 60;
                const poly = f.geometry?.type === 'Polygon'
                  ? f.geometry
                  : lineStringToPolygon(coords, largura / 2);
                if (!poly) return null;

                return (
                  <Fragment key={f.properties?.id}>
                    <Polygon
                      positions={poly.coordinates[0].map(([x, y]) => [y, x])}
                      pathOptions={{
                        color: theme === 'dark' ? '#4A7FD4' : '#3F64A6',
                        weight: 1.5,
                        opacity: 0.55,
                        fillColor: theme === 'dark' ? '#4A7FD4' : '#3F64A6',
                        fillOpacity: 0.18,
                        lineCap: 'round',
                        lineJoin: 'round',
                      }}
                    />
                    {f.geometry?.type === 'LineString' && (
                      <Polyline
                        positions={coords.map(([x, y]) => [y, x])}
                        pathOptions={{
                          color: theme === 'dark' ? '#4A7FD4' : '#3F64A6',
                          weight: 1,
                          opacity: 0.45,
                          dashArray: '4 6',
                        }}
                      />
                    )}
                  </Fragment>
                );
              })}

              {/* Áreas / salas */}
              {areas.map((f) => {
                const poiId = f.properties.id;
                return (
                  <Polygon
                    key={poiId}
                    positions={f.geometry.coordinates[0].map(([x, y]) => [y, x])}
                    pathOptions={
                      navOrigem?.id === poiId
                        ? ORIGEM_STYLE
                        : navDestino?.id === poiId
                        ? DESTINO_STYLE
                        : DEFAULT_AREA_STYLE
                    }
                    eventHandlers={{
                      click: () => {
                        const center = getFeatureCenter(f);
                        handlePoiClickRef.current?.({
                          id: poiId,
                          name: f.properties.name,
                          lng: center?.lng,
                          lat: center?.lat,
                          feature: f,
                        });
                      },
                      add: (e) => {
                        poiLayersRef.current.set(poiId, e.target);
                      },
                    }}
                  />
                );
              })}

              {/* Pontos */}
              <GeoJSON
                data={{ type: 'FeatureCollection', features: pontos }}
                pointToLayer={(feature, latlng) => {
                  const poiId = feature.properties.id;
                  const isOrigem = navOrigem?.id === poiId;
                  const isDestino = navDestino?.id === poiId;
                  return L.circleMarker(latlng, {
                    ...(isOrigem ? { ...ORIGEM_STYLE, radius: 9 } : isDestino ? { ...DESTINO_STYLE, radius: 9 } : DEFAULT_POINT_STYLE),
                  });
                }}
                onEachFeature={(feature, layer) => {
                  const poiId = feature.properties.id;
                  poiLayersRef.current.set(poiId, layer);
                  layer.on('click', () => {
                    const center = getFeatureCenter(feature);
                    handlePoiClickRef.current?.({
                      id: poiId,
                      name: feature.properties.name,
                      lng: center?.lng,
                      lat: center?.lat,
                      feature,
                    });
                  });
                }}
              />

              {rotaPontos && (
                <>
                  <Polyline
                    positions={rotaPontos}
                    pathOptions={{ color: '#f59e0b', weight: 5, opacity: 0.9, lineCap: 'round', lineJoin: 'round' }}
                  />
                  <RouteFocus pontos={rotaPontos} />
                </>
              )}
            </MapContainer>
          </div>
        </div>

        {/* Painel lateral */}
        <div className="w-full lg:w-[360px] flex-shrink-0 flex flex-col gap-4">
          <div className={`rounded-2xl border p-4 ${panelClasses(theme)}`}>
            {poiSelecionado ? (
              <>
                <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${theme === 'dark' ? 'text-white/50' : 'text-[#1B2F55]/50'}`}>
                  Local selecionado
                </p>
                <p className={`text-lg font-extrabold mb-2 ${theme === 'dark' ? 'text-white' : 'text-[#1B2F55]'}`}>
                  {poiSelecionado.properties.name}
                </p>
                {poiSelecionado.properties.photoUrl && (
                  <img
                    src={poiSelecionado.properties.photoUrl}
                    alt=""
                    className="w-full rounded-lg object-cover max-h-[140px] mb-2"
                  />
                )}
                <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-white/70' : 'text-[#1B2F55]/70'}`}>
                  {poiSelecionado.properties.description || 'Sem descrição cadastrada.'}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      falar(`${poiSelecionado.properties.name}. ${poiSelecionado.properties.description || ''}`)
                    }
                    className="flex-1 px-3 py-2 rounded-full bg-[#F59E0B] text-[#0B1B3B] text-xs font-bold"
                  >
                    🔊 Ouvir
                  </button>
                  <button
                    onClick={() => alert('Aqui entraria o widget VLibras traduzindo este texto para Libras.')}
                    className={`flex-1 px-3 py-2 rounded-full text-xs font-bold ${
                      theme === 'dark' ? 'bg-white/10 text-white' : 'bg-[#1B2F55]/10 text-[#1B2F55]'
                    }`}
                  >
                    🤟 Libras
                  </button>
                </div>
              </>
            ) : (
              <p className={`text-sm ${theme === 'dark' ? 'text-white/50' : 'text-[#1B2F55]/50'}`}>
                Toque numa sala ou ponto do mapa para ver a descrição.
              </p>
            )}
          </div>

          {listaPois.length >= 2 && (
            <div className={`rounded-2xl border p-4 ${panelClasses(theme)}`}>
              <p className={`text-sm font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-[#1B2F55]'}`}>
                🧭 Traçar rota
              </p>
              <p className={`text-[11px] mb-3 ${theme === 'dark' ? 'text-white/50' : 'text-[#1B2F55]/50'}`}>
                Clique numa caixa abaixo e depois clique num local do mapa.
              </p>

              <datalist id="poi-list-nav">
                {listaPois.map((f) => (
                  <option key={f.properties.id} value={f.properties.name} />
                ))}
              </datalist>

              <div className="flex flex-col gap-3">
                <label className="flex flex-col gap-1">
                  <span className={`font-semibold flex items-center gap-1.5 text-xs ${theme === 'dark' ? 'text-white/70' : 'text-[#1B2F55]/70'}`}>
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500" />
                    Origem
                    {alvoAtivo === 'origem' && (
                      <span className="ml-auto text-[10px] font-bold text-green-500">← clique no mapa</span>
                    )}
                  </span>
                  <input
                    list="poi-list-nav"
                    value={navOrigem?.name || ''}
                    onClick={() => setAlvoAtivo('origem')}
                    onChange={(e) => {
                      const nome = e.target.value;
                      const f = listaPois.find((p) => p.properties.name === nome);
                      if (f) {
                        const center = getFeatureCenter(f);
                        setNavOrigem({
                          id: f.properties.id,
                          name: f.properties.name,
                          lng: center?.lng,
                          lat: center?.lat,
                          feature: f,
                        });
                        setPoiSelecionado(f);
                      } else {
                        setNavOrigem(nome ? { id: null, name: nome, lng: null, lat: null } : null);
                      }
                    }}
                    placeholder="Clique aqui e depois no mapa…"
                    className={`${inputClasses} border-2 ${
                      alvoAtivo === 'origem' ? 'border-green-500 ring-2 ring-green-500/30' : ''
                    }`}
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className={`font-semibold flex items-center gap-1.5 text-xs ${theme === 'dark' ? 'text-white/70' : 'text-[#1B2F55]/70'}`}>
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500" />
                    Destino
                    {alvoAtivo === 'destino' && (
                      <span className="ml-auto text-[10px] font-bold text-red-500">← clique no mapa</span>
                    )}
                  </span>
                  <input
                    list="poi-list-nav"
                    value={navDestino?.name || ''}
                    onClick={() => setAlvoAtivo('destino')}
                    onChange={(e) => {
                      const nome = e.target.value;
                      const f = listaPois.find((p) => p.properties.name === nome);
                      if (f) {
                        const center = getFeatureCenter(f);
                        setNavDestino({
                          id: f.properties.id,
                          name: f.properties.name,
                          lng: center?.lng,
                          lat: center?.lat,
                          feature: f,
                        });
                        setPoiSelecionado(f);
                      } else {
                        setNavDestino(nome ? { id: null, name: nome, lng: null, lat: null } : null);
                      }
                    }}
                    placeholder="Clique aqui e depois no mapa…"
                    className={`${inputClasses} border-2 ${
                      alvoAtivo === 'destino' ? 'border-red-500 ring-2 ring-red-500/30' : ''
                    }`}
                  />
                </label>

                <label
                  className={`flex items-center gap-2 text-xs font-semibold cursor-pointer ${
                    theme === 'dark' ? 'text-white/70' : 'text-[#1B2F55]/70'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={somenteAcessivel}
                    onChange={(e) => setSomenteAcessivel(e.target.checked)}
                  />
                  Somente rota acessível (sem escadas)
                </label>

                {rotaErro && <p className="text-xs text-red-400 font-medium">{rotaErro}</p>}
                {rotaTexto && !rotaErro && (
                  <div>
                    <p className="text-xs text-[#22c55e] font-medium">✅ {rotaTexto}</p>
                    <button
                      onClick={() => falar(rotaTexto)}
                      className="mt-2 w-full px-3 py-2 rounded-full bg-[#F59E0B] text-[#0B1B3B] text-xs font-bold"
                    >
                      🔊 Ouvir
                    </button>
                  </div>
                )}

                {(navOrigem || navDestino || rotaPontos) && (
                  <button
                    onClick={() => {
                      setNavOrigem(null);
                      setNavDestino(null);
                      setRotaPontos(null);
                      setRotaTexto('');
                      setRotaErro('');
                      setAlvoAtivo('origem');
                      setPoiSelecionado(null);
                    }}
                    className={`w-full rounded-lg py-1.5 text-xs font-semibold ${
                      theme === 'dark'
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
        </div>
      </div>
    </div>
  );
}