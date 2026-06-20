import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FeatureGroup, GeoJSON, ImageOverlay, MapContainer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";

// Patch Leaflet.Draw to prevent duplicate events on touch/hybrid screens
if (typeof L !== 'undefined' && L.Draw && L.Draw.Polyline) {
  const originalOnMouseDown = L.Draw.Polyline.prototype._onMouseDown;
  L.Draw.Polyline.prototype._onMouseDown = function(e) {
    if (this._lastTouchTime && (Date.now() - this._lastTouchTime < 600)) {
      return;
    }
    originalOnMouseDown.call(this, e);
  };

  const originalOnTouch = L.Draw.Polyline.prototype._onTouch;
  L.Draw.Polyline.prototype._onTouch = function(e) {
    this._lastTouchTime = Date.now();
    originalOnTouch.call(this, e);
  };
}

import { PageLayout, PageHeader, PageFooter, useTheme } from '../components/PageLayout';

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
  } catch {
    return null;
  }
}

const areaShapeOptions = {
  color: '#00d4ff',
  weight: 3,
  opacity: 0.95,
  fillColor: '#00d4ff',
  fillOpacity: 0.22
};

const selectedShapeOptions = {
  color: '#ffcc00',
  weight: 4,
  opacity: 1,
  fillColor: '#ffcc00',
  fillOpacity: 0.28
};

const shellOuterClasses = (theme) =>
  theme === 'dark'
    ? 'bg-[radial-gradient(circle_at_top,rgba(74,127,212,0.14),transparent_42%),linear-gradient(180deg,#071427_0%,#0b1830_55%,#071427_100%)] text-white'
    : 'bg-transparent text-[#1B2F55]';

const panelClasses = (theme) =>
  theme === 'dark'
    ? 'bg-[#0b1830]/85 border-white/10 shadow-[0_18px_50px_rgba(0,0,0,0.24)] backdrop-blur-xl'
    : 'bg-[#f1f6fb] border-[#1B2F55]/10 shadow-[0_16px_40px_rgba(27,47,85,0.08)] backdrop-blur-xl';

function getLayerKind(layer) {
  return layer instanceof L.Marker ? 'point' : 'area';
}

function applyDefaultLayerStyle(layer) {
  if (typeof layer.setStyle === 'function') {
    layer.setStyle(areaShapeOptions);
  }
}

function applySelectedLayerStyle(layer) {
  if (typeof layer.setStyle === 'function') {
    layer.setStyle(selectedShapeOptions);
  }
}

function MapSetup({
  activeTool,
  featureGroupRef,
  selectedLayerRef,
  selectLayerHandlerRef,
  setActiveTool,
  drawingPoints,
  setDrawingPoints,
  finishPolygonDraft,
}) {
  const map = useMap();
  const tempPolygonRef = useRef(null);
  const tempMarkersRef = useRef([]);

  function clearTempPolygon() {
    if (tempPolygonRef.current) {
      map.removeLayer(tempPolygonRef.current);
      tempPolygonRef.current = null;
    }
    tempMarkersRef.current.forEach((marker) => map.removeLayer(marker));
    tempMarkersRef.current = [];
  }

  function renderTempMarkers(points) {
    tempMarkersRef.current.forEach((marker) => map.removeLayer(marker));
    tempMarkersRef.current = points.map((point, index) =>
      L.marker(point, {
        interactive: false,
        keyboard: false,
        icon: L.divIcon({
          className: '',
          html: `
            <div style="
              width: 18px;
              height: 18px;
              border-radius: 999px;
              border: 2px solid #ffffff;
              background: #0ea5e9;
              box-shadow: 0 2px 10px rgba(0,0,0,0.35);
              display: grid;
              place-items: center;
              color: white;
              font-size: 10px;
              font-weight: 700;
              line-height: 1;
            ">${index + 1}</div>
          `,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        }),
      }).addTo(map)
    );
  }

  function renderTempPolygon(points) {
    clearTempPolygon();
    if (points.length < 2) return;
    renderTempMarkers(points);
    tempPolygonRef.current = L.polygon(points, {
      ...areaShapeOptions,
      fillOpacity: 0.12,
      dashArray: '6 8',
      interactive: false,
    }).addTo(map);
  }

  useEffect(() => {
    if (!map || !featureGroupRef.current) return;

    const drawnItems = featureGroupRef.current;

    const stopLayerClick = (event) => {
      if (event.originalEvent) {
        L.DomEvent.stopPropagation(event.originalEvent);
      }
    };

    const attachLayerSelection = (layer) => {
      layer.off('click');
      layer.on('click', (event) => {
        stopLayerClick(event);
        selectLayerHandlerRef.current(layer);
      });
    };

    const createMappedLayer = (layer) => {
      const poiId = `poi-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      applyDefaultLayerStyle(layer);
      layer.feature = {
        type: 'Feature',
        properties: {
          id: poiId,
          kind: getLayerKind(layer),
          name: '',
          description: '',
          photoUrl: ''
        }
      };
      drawnItems.addLayer(layer);
      attachLayerSelection(layer);
      selectLayerHandlerRef.current(layer);
    };

    const editControl = new L.Control.Draw({
      edit: { featureGroup: drawnItems },
      draw: false
    });
    map.addControl(editControl);

    const onCreated = (event) => {
      createMappedLayer(event.layer);
      setActiveTool('select');
    };

    const onDeleted = (event) => {
      event.layers.eachLayer((layer) => {
        if (selectedLayerRef.current === layer) {
          selectedLayerRef.current = null;
        }
      });
    };

    map.on(L.Draw.Event.CREATED, onCreated);
    map.on(L.Draw.Event.DELETED, onDeleted);

    return () => {
      map.off(L.Draw.Event.CREATED, onCreated);
      map.off(L.Draw.Event.DELETED, onDeleted);
      map.removeControl(editControl);
    };
  }, [map, featureGroupRef, selectedLayerRef, selectLayerHandlerRef, setActiveTool]);

  useEffect(() => {
    if (!map || !featureGroupRef.current) return;

    const imageBounds = L.latLngBounds(bounds);

    map.getContainer().style.cursor = activeTool === 'select' ? '' : 'crosshair';

    const createPointOnClick = (event) => {
      if (!imageBounds.contains(event.latlng)) return;
      map.fire(L.Draw.Event.CREATED, {
        layer: L.marker(event.latlng),
        layerType: 'marker'
      });
    };

    if (activeTool === 'point') {
      map.on('click', createPointOnClick);
    }

    if (activeTool === 'polygon') {
      const onPolygonClick = (event) => {
        if (!imageBounds.contains(event.latlng)) return;
        setDrawingPoints((prev) => [...prev, event.latlng]);
      };

      const onPolygonDoubleClick = () => {
        finishPolygonDraft();
      };

      map.on('click', onPolygonClick);
      map.on('dblclick', onPolygonDoubleClick);

      return () => {
        map.off('click', onPolygonClick);
        map.off('dblclick', onPolygonDoubleClick);
        clearTempPolygon();
      };
    }

    return () => {
      map.off('click', createPointOnClick);
      map.getContainer().style.cursor = '';
    };
  }, [activeTool, featureGroupRef, finishPolygonDraft, map, setDrawingPoints]);

  useEffect(() => {
    if (activeTool !== 'polygon') return;
    renderTempPolygon(drawingPoints);
  }, [activeTool, drawingPoints, map]);

  useEffect(() => {
    if (activeTool !== 'polygon') {
      clearTempPolygon();
      setDrawingPoints([]);
    }
  }, [activeTool, setDrawingPoints]);

  return null;
}

export default function MapPoiEditor() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [theme, setTheme] = useTheme();
  
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  // Estados para edição do POI
  const [selectedLayerKey, setSelectedLayerKey] = useState(null);
  const [selectedLayerKind, setSelectedLayerKind] = useState(null);
  const [activeTool, setActiveTool] = useState('select');
  const [drawingPoints, setDrawingPoints] = useState([]);
  const drawingPointsRef = useRef([]);
  const [poiName, setPoiName] = useState("");
  const [poiDescription, setPoiDescription] = useState("");
  const [poiPhotoUrl, setPoiPhotoUrl] = useState("");
  const [uploadingPoiPhoto, setUploadingPoiPhoto] = useState(false);
  const [savingMap, setSavingMap] = useState(false);
  
  const featureGroupRef = useRef();
  const selectedLayerRef = useRef(null);
  const selectLayerHandlerRef = useRef(() => {});

  useEffect(() => {
    drawingPointsRef.current = drawingPoints;
  }, [drawingPoints]);

  // Verificação de acesso Admin
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

  // Se não tiver ID, redireciona para o MapEditor
  useEffect(() => {
    if (!id) {
      navigate('/map-editor');
    }
  }, [id, navigate]);

  useEffect(() => {
    if (id) {
      loadMap();
    }
  }, [id]);

  async function loadMap() {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:3000/api/maps/${id}`);
      setMapData(res.data);
      setError(null);
    } catch (err) {
      console.error("Erro ao carregar o mapa:", err);
      setError("Não foi possível carregar este mapa.");
    } finally {
      setLoading(false);
    }
  }

  async function saveFeatures() {
    try {
      if (!featureGroupRef.current) return;
      setSavingMap(true);
      const layers = featureGroupRef.current.toGeoJSON();
      const token = localStorage.getItem('jwt_token');

      await axios.put(
        `http://localhost:3000/api/maps/${id}/features`,
        layers,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      await loadMap();
      alert('Mapa salvo com sucesso!');
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert('Erro ao salvar. Verifique se você está logado como Admin.');
    } finally {
      setSavingMap(false);
    }
  }

  async function handlePoiPhotoUpload(file) {
    if (!file) return;
    const token = localStorage.getItem('jwt_token');
    const formData = new FormData();
    formData.append('image', file);
    try {
      setUploadingPoiPhoto(true);
      const res = await axios.post('http://localhost:3000/api/maps/upload-poi-photo', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      setPoiPhotoUrl(res.data.imageUrl);
    } catch {
      alert('Erro ao enviar foto do ponto.');
    } finally {
      setUploadingPoiPhoto(false);
    }
  }

  function selectLayer(layer) {
    if (selectedLayerRef.current && selectedLayerRef.current !== layer) {
      applyDefaultLayerStyle(selectedLayerRef.current);
    }
    selectedLayerRef.current = layer;
    applySelectedLayerStyle(layer);
    setSelectedLayerKey(layer.feature?.properties?.id || `layer-${L.stamp(layer)}`);
    setSelectedLayerKind(getLayerKind(layer));
    const props = layer.feature?.properties || {};
    setPoiName(props.name || '');
    setPoiDescription(props.description || '');
    setPoiPhotoUrl(props.photoUrl || '');
  }

  useEffect(() => {
    selectLayerHandlerRef.current = selectLayer;
  });

  function clearPoiForm() {
    if (selectedLayerRef.current) {
      applyDefaultLayerStyle(selectedLayerRef.current);
    }
    selectedLayerRef.current = null;
    setSelectedLayerKey(null);
    setSelectedLayerKind(null);
    setPoiName('');
    setPoiDescription('');
    setPoiPhotoUrl('');
  }

  function applyPoiChanges() {
    const layer = selectedLayerRef.current;
    if (!layer) return;
    const poiId = layer.feature?.properties?.id || `poi-${Date.now()}`;
    layer.feature = {
      type: 'Feature',
      properties: {
        ...(layer.feature?.properties || {}),
        id: poiId,
        kind: getLayerKind(layer),
        name: poiName,
        description: poiDescription,
        photoUrl: poiPhotoUrl
      }
    };
    clearPoiForm();
  }

  function selectMappingTool(tool) {
    clearPoiForm();
    if (tool !== 'polygon') {
      setDrawingPoints([]);
    }
    setActiveTool(tool);
  }

  function finishPolygonDraft() {
    const points = drawingPointsRef.current;
    if (!featureGroupRef.current || points.length < 3) return;

    const polygon = L.polygon(points, areaShapeOptions);
    const poiId = `poi-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    polygon.feature = {
      type: 'Feature',
      properties: {
        id: poiId,
        kind: 'area',
        name: '',
        description: '',
        photoUrl: ''
      }
    };

    featureGroupRef.current.addLayer(polygon);
    polygon.on('click', (event) => {
      if (event.originalEvent) {
        L.DomEvent.stopPropagation(event.originalEvent);
      }
      selectLayer(polygon);
    });
    selectLayer(polygon);
    setDrawingPoints([]);
    setActiveTool('select');
  }

  const activeToolHint = {
    select: 'Selecione uma área ou ponto já criado para editar.',
    point: 'Ponto específico: clique uma vez no local exato da planta.',
    polygon: 'Selecionar local: clique quantos pontos forem necessários para contornar a área e finalize com duplo clique. Use este modo para áreas livres ou formas irregulares.'
  }[activeTool];

  const inputClasses = `w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors ${
    theme === 'dark'
      ? 'bg-[#0f2346] border border-white/10 text-white placeholder:text-white/30 focus:border-[#4A7FD4]'
      : 'bg-white border border-[#1B2F55]/15 text-[#1B2F55] placeholder:text-[#1B2F55]/35 focus:border-[#4A7FD4]'
  }`;

  const labelClasses = `block text-sm font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-[#1B2F55]'}`;

  if (!id) return null; // Will redirect via useEffect

  if (loading) {
    return (
      <PageLayout theme={theme}>
        <PageHeader theme={theme} setTheme={setTheme} isLoggedIn />
        <main className="relative z-10 flex-1 flex items-center justify-center">
          <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white/70' : 'text-[#1B2F55]/70'}`}>
            Carregando...
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
            onClick={() => navigate('/map-editor')}
            className="px-5 py-2 bg-[#F59E0B] text-[#0B1B3B] font-semibold rounded-lg hover:bg-[#d97706] transition-colors cursor-pointer"
          >
            Voltar para a Lista
          </button>
        </main>
      </PageLayout>
    );
  }

  // TELA: EDITOR DO LEAFLET — Layout lado a lado dentro do PageLayout
  return (
    <PageLayout theme={theme} bottomBar={false} showFooter={false}>
      <PageHeader theme={theme} setTheme={setTheme} isLoggedIn />

      <main className={`relative z-10 flex-1 overflow-hidden ${shellOuterClasses(theme)}`}>
        <div className="mx-auto flex min-h-[100svh] w-full max-w-[1600px] flex-col gap-4 px-3 pb-3 pt-4 sm:px-6 lg:flex-row lg:px-10 lg:pt-6">
        {/* Lado esquerdo - Formulário POI */}
        <div className={`w-full lg:w-[400px] flex-shrink-0 overflow-y-auto px-5 sm:px-6 py-6 flex flex-col relative z-20 rounded-[28px] border ${panelClasses(theme)}`}>
          {/* Info do usuário */}
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-[#1B2F55]'}`}>
                {user?.name || user?.email || 'Administrador'}
              </p>
              <p className={`text-xs ${theme === 'dark' ? 'text-white/60' : 'text-[#1B2F55]/60'}`}>
                Perfil: Administrador
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/map-editor')}
              className={`text-xs px-3 py-1.5 rounded-full cursor-pointer transition-all hover:-translate-y-0.5 font-semibold ${
                theme === 'dark'
                  ? 'text-white/70 hover:text-white bg-white/10 hover:bg-white/15'
                  : 'text-[#1B2F55]/70 hover:text-[#1B2F55] bg-[#1B2F55]/10 hover:bg-[#1B2F55]/15'
              }`}
            >
              ⬅ Voltar
            </button>
          </div>

          <h2 className={`text-xl font-extrabold mb-5 ${theme === 'dark' ? 'text-white' : 'text-[#1B2F55]'}`}>
            Adicionar pontos de interesse:
          </h2>

          {selectedLayerKey ? (
            <div className="flex flex-col gap-4">
              <div>
                <label className={labelClasses}>Nome:</label>
                <input
                  type="text"
                  value={poiName}
                  onChange={(e) => setPoiName(e.target.value)}
                  placeholder="Nome do novo ponto de interesse..."
                  className={inputClasses}
                />
              </div>

              <div>
                <label className={labelClasses}>Descrição:</label>
                <textarea
                  value={poiDescription}
                  onChange={(e) => setPoiDescription(e.target.value)}
                  placeholder="Digite a descrição do local..."
                  rows={4}
                  className={`${inputClasses} resize-vertical`}
                />
              </div>

              {uploadingPoiPhoto && (
                <p className={`text-xs ${theme === 'dark' ? 'text-blue-300' : 'text-[#3F64A6]'}`}>
                  ⏳ Enviando foto...
                </p>
              )}

              {poiPhotoUrl && (
                <div>
                  <p className={`text-xs font-bold mb-1 ${theme === 'dark' ? 'text-white/50' : 'text-[#1B2F55]/50'}`}>
                    Foto Atual:
                  </p>
                  <img
                    src={`http://localhost:3000${poiPhotoUrl}`}
                    alt="foto ponto"
                    className={`w-full rounded-lg object-cover max-h-[140px] border ${
                      theme === 'dark' ? 'border-white/10' : 'border-[#1B2F55]/10'
                    }`}
                  />
                </div>
              )}

              <div className="flex flex-wrap gap-3 mt-2">
                <label
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold cursor-pointer transition-all hover:-translate-y-0.5 ${
                    theme === 'dark'
                      ? 'bg-[#4A7FD4] hover:bg-[#3f6fba] text-white'
                      : 'bg-[#4A7FD4] hover:bg-[#3f6fba] text-white'
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePoiPhotoUpload(e.target.files[0])}
                    className="hidden"
                  />
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  Fazer upload de imagem
                </label>
              </div>

              <button
                onClick={applyPoiChanges}
                className="flex items-center justify-center gap-2 w-full px-5 py-2.5 bg-[#F59E0B] text-[#0B1B3B] rounded-full text-sm font-semibold hover:bg-[#d97706] transition-all hover:-translate-y-0.5 cursor-pointer mt-1"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                Salvar ponto de interesse
              </button>

              <button
                onClick={clearPoiForm}
                className={`text-xs px-3 py-2 rounded-full cursor-pointer transition-all hover:-translate-y-0.5 ${
                  theme === 'dark'
                    ? 'text-white/60 hover:text-white bg-white/5 hover:bg-white/10'
                    : 'text-[#1B2F55]/60 hover:text-[#1B2F55] bg-[#1B2F55]/5 hover:bg-[#1B2F55]/10'
                }`}
              >
                Cancelar
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col gap-5">
              <p className={`text-sm ${theme === 'dark' ? 'text-white/50' : 'text-[#1B2F55]/50'}`}>
                Use as ferramentas abaixo para criar um ponto ou contornar uma área no mapa, depois preencha os dados.
              </p>

              {/* Ferramentas de mapeamento */}
              <div className="flex flex-col gap-3">
                <p className={`text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-white/40' : 'text-[#1B2F55]/40'}`}>
                  Ferramentas
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'select', label: 'Selecionar' },
                    { key: 'point', label: 'Ponto específico' },
                    { key: 'polygon', label: 'Selecionar local' },
                  ].map(tool => (
                    <button
                      key={tool.key}
                      type="button"
                      onClick={() => selectMappingTool(tool.key)}
                      className={`px-3 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                        activeTool === tool.key
                          ? 'bg-[#F59E0B] text-[#0B1B3B] shadow-md'
                          : theme === 'dark'
                            ? 'bg-white/10 text-white/70 hover:bg-white/15'
                            : 'bg-[#1B2F55]/10 text-[#1B2F55]/70 hover:bg-[#1B2F55]/15'
                      }`}
                    >
                      {tool.label}
                    </button>
                  ))}
                </div>
                <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-white/40' : 'text-[#1B2F55]/40'}`}>
                  {activeToolHint}
                </p>
                {activeTool === 'polygon' && drawingPoints.length >= 2 && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={finishPolygonDraft}
                      className="px-3 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all bg-[#F59E0B] text-[#0B1B3B] shadow-md hover:-translate-y-0.5"
                    >
                      Finalizar área
                    </button>
                    <button
                      type="button"
                      onClick={() => setDrawingPoints([])}
                      className={`px-3 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                        theme === 'dark'
                          ? 'bg-white/10 text-white/70 hover:bg-white/15'
                          : 'bg-[#1B2F55]/10 text-[#1B2F55]/70 hover:bg-[#1B2F55]/15'
                      }`}
                      >
                      Limpar pontos
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  onClick={saveFeatures}
                  disabled={savingMap}
                  className="flex items-center justify-center gap-2 w-full px-5 py-2.5 bg-[#F59E0B] text-[#0B1B3B] rounded-full text-sm font-semibold hover:bg-[#d97706] transition-all hover:-translate-y-0.5 cursor-pointer mt-auto"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17 21 17 13 7 13 7 21"/>
                    <polyline points="7 3 7 8 15 8"/>
                  </svg>
                  {savingMap ? 'Salvando...' : '💾 Salvar Alterações no Mapa'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Lado direito - Mapa Leaflet */}
        <div className="flex-1 relative min-h-[420px] lg:min-h-0">
          <div className={`absolute inset-0 rounded-[28px] overflow-hidden border ${
            theme === 'dark' ? 'border-white/10' : 'border-[#1B2F55]/15'
          }`}>
            <MapContainer
              crs={L.CRS.Simple}
              bounds={bounds}
              maxBounds={bounds}
              maxBoundsViscosity={0.8}
              tap={false}
              doubleClickZoom={false}
              className="h-full w-full"
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
              <FeatureGroup ref={featureGroupRef}>
                <GeoJSON key={id} data={mapData?.features} onEachFeature={(_feature, layer) => {
                  applyDefaultLayerStyle(layer);
                  layer.on('click', (event) => {
                    if (event.originalEvent) {
                      L.DomEvent.stopPropagation(event.originalEvent);
                    }
                    selectLayer(layer);
                  });
                }} />
              </FeatureGroup>
              <MapSetup
                activeTool={activeTool}
                featureGroupRef={featureGroupRef}
                selectedLayerRef={selectedLayerRef}
                selectLayerHandlerRef={selectLayerHandlerRef}
                setActiveTool={setActiveTool}
                drawingPoints={drawingPoints}
                setDrawingPoints={setDrawingPoints}
                finishPolygonDraft={finishPolygonDraft}
              />
            </MapContainer>
          </div>
        </div>
        </div>
      </main>

      {/* Footer */}
      <PageFooter theme={theme} />
    </PageLayout>
  );
}
