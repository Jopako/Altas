import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FeatureGroup, GeoJSON, ImageOverlay, MapContainer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";

import { PageLayout, PageHeader, PageFooter, useTheme } from '../components/PageLayout';
import { lineStringToPolygon } from '../lib/graph';

const bounds = [
  [0, 0],
  [1000, 1000]
];

const LS_KEY = 'altas_maps';

function loadMaps() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; }
}
function saveMaps(maps) {
  localStorage.setItem(LS_KEY, JSON.stringify(maps));
}

const areaShapeOptions = {
  color: '#00d4ff', weight: 3, opacity: 0.95, fillColor: '#00d4ff', fillOpacity: 0.22
};
const selectedShapeOptions = {
  color: '#ffcc00', weight: 4, opacity: 1, fillColor: '#ffcc00', fillOpacity: 0.28
};
const pathShapeOptions = {
  color: '#2563eb', weight: 4, opacity: 0.9, dashArray: '6 8'
};
const selectedPathShapeOptions = {
  color: '#ffcc00', weight: 5, opacity: 1, dashArray: '6 8'
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
  if (layer instanceof L.Marker) return 'point';
  if (layer instanceof L.Polyline && !(layer instanceof L.Polygon)) return 'edge';
  return 'area';
}

function applyDefaultLayerStyle(layer) {
  if (typeof layer.setStyle !== 'function') return;
  layer.setStyle(getLayerKind(layer) === 'edge' ? pathShapeOptions : areaShapeOptions);
}
function applySelectedLayerStyle(layer) {
  if (typeof layer.setStyle !== 'function') return;
  layer.setStyle(getLayerKind(layer) === 'edge' ? selectedPathShapeOptions : selectedShapeOptions);
}

/* ---------- snap: gruda vértice novo em vértice já existente perto ---------- */
function findClosestSnapVertex(latlng, existingVertices, tolerance = 15) {
  if (!latlng || !existingVertices?.length) return null;
  let closest = null, minDistance = Infinity;
  for (const v of existingVertices) {
    const d = Math.hypot(latlng.lng - v.lng, latlng.lat - v.lat);
    if (d <= tolerance && d < minDistance) { minDistance = d; closest = v; }
  }
  return closest ? L.latLng(closest.lat, closest.lng) : null;
}
function snapToNearby(latlng, existingVertices, tolerance = 15) {
  return findClosestSnapVertex(latlng, existingVertices, tolerance) || latlng;
}
function getExistingVertices(featureGroup, mapFeatures) {
  const vertices = [];
  const seen = new Set();
  const addVertex = (lat, lng) => {
    if (typeof lat !== 'number' || typeof lng !== 'number' || Number.isNaN(lat) || Number.isNaN(lng)) return;
    const key = `${lat.toFixed(6)},${lng.toFixed(6)}`;
    if (!seen.has(key)) { seen.add(key); vertices.push(L.latLng(lat, lng)); }
  };
  if (mapFeatures?.features) {
    mapFeatures.features.forEach((feat) => {
      const geom = feat?.geometry;
      if (!geom) return;
      if (geom.type === 'Point') addVertex(geom.coordinates[1], geom.coordinates[0]);
      else if (geom.type === 'LineString') geom.coordinates.forEach((c) => addVertex(c[1], c[0]));
    });
  }
  if (featureGroup?.eachLayer) {
    const inspect = (layer) => {
      if (layer.eachLayer) { layer.eachLayer(inspect); return; }
      if (layer instanceof L.Marker) { const ll = layer.getLatLng(); addVertex(ll.lat, ll.lng); }
      else if (layer instanceof L.Polyline && !(layer instanceof L.Polygon)) {
        const flat = layer.getLatLngs().flat(Infinity);
        flat.forEach((p) => addVertex(p.lat, p.lng));
      }
    };
    featureGroup.eachLayer(inspect);
  }
  return vertices;
}

function MapSetup({
  activeTool, featureGroupRef, selectedLayerRef, selectLayerHandlerRef,
  setActiveTool, drawingPoints, setDrawingPoints, finishPolygonDraft, finishPathDraft, mapData,
  previewLargura, // ← NOVO
}) {
  const map = useMap();
  const tempPolygonRef = useRef(null);
  const tempPathRef = useRef(null);
  const tempMarkersRef = useRef([]);
  const snapMarkerRef = useRef(null);
  const previewLayerRef = useRef(null); // ← NOVO

  function clearSnapIndicator() {
    if (snapMarkerRef.current) { map.removeLayer(snapMarkerRef.current); snapMarkerRef.current = null; }
  }
  function updateSnapIndicator(target) {
    if (!target) return clearSnapIndicator();
    if (!snapMarkerRef.current) {
      snapMarkerRef.current = L.circleMarker(target, {
        radius: 8, color: '#f59e0b', weight: 2.5, fillColor: '#fbbf24', fillOpacity: 0.9, interactive: false,
      }).addTo(map);
    } else snapMarkerRef.current.setLatLng(target);
  }
  function clearTempDraft() {
    if (tempPolygonRef.current) { map.removeLayer(tempPolygonRef.current); tempPolygonRef.current = null; }
    if (tempPathRef.current) { map.removeLayer(tempPathRef.current); tempPathRef.current = null; }
    tempMarkersRef.current.forEach((m) => map.removeLayer(m));
    tempMarkersRef.current = [];
  }
  function renderTempMarkers(points) {
    tempMarkersRef.current.forEach((m) => map.removeLayer(m));
    tempMarkersRef.current = points.map((point, index) =>
      L.marker(point, {
        interactive: false, keyboard: false,
        icon: L.divIcon({
          className: '',
          html: `<div style="width:18px;height:18px;border-radius:999px;border:2px solid #fff;background:#0ea5e9;display:grid;place-items:center;color:#fff;font-size:10px;font-weight:700;">${index + 1}</div>`,
          iconSize: [18, 18], iconAnchor: [9, 9],
        }),
      }).addTo(map)
    );
  }
  function renderTempPolygon(points) {
    clearTempDraft();
    if (points.length < 2) { if (points.length === 1) renderTempMarkers(points); return; }
    renderTempMarkers(points);
    tempPolygonRef.current = L.polygon(points, { ...areaShapeOptions, fillOpacity: 0.12, dashArray: '6 8', interactive: false }).addTo(map);
  }
  function renderTempPath(points) {
    clearTempDraft();
    if (points.length < 1) return;
    renderTempMarkers(points);
    if (points.length >= 2) {
      tempPathRef.current = L.polyline(points, { ...pathShapeOptions, interactive: false }).addTo(map);
    }
  }

  // ← NOVO: função que atualiza o preview da faixa
  function updatePreview(layer, largura) {
    if (previewLayerRef.current) {
      map.removeLayer(previewLayerRef.current);
      previewLayerRef.current = null;
    }
    if (!layer || !largura) return;

    const latlngs = layer.getLatLngs();
    if (!latlngs || latlngs.length < 2) return;

    const coords = latlngs.map((p) => [p.lng, p.lat]);
    const poly = lineStringToPolygon(coords, largura / 2);
    if (!poly) return;

    previewLayerRef.current = L.polygon(
      poly.coordinates[0].map(([x, y]) => [y, x]),
      {
        color: '#2563eb',
        weight: 1.5,
        opacity: 0.6,
        fillColor: '#2563eb',
        fillOpacity: 0.18,
        interactive: false,
      }
    ).addTo(map);
  }

  useEffect(() => {
    if (!map || !featureGroupRef.current) return;
    const drawnItems = featureGroupRef.current;
    const stopLayerClick = (event) => { if (event.originalEvent) L.DomEvent.stopPropagation(event.originalEvent); };
    const attachLayerSelection = (layer) => {
      layer.off('click');
      layer.on('click', (event) => { stopLayerClick(event); selectLayerHandlerRef.current(layer); });
    };
    const createMappedLayer = (layer) => {
      const poiId = `poi-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      applyDefaultLayerStyle(layer);
      layer.feature = {
        type: 'Feature',
        properties: { id: poiId, kind: getLayerKind(layer), tipo: 'sala', name: '', description: '', photoUrl: '', acessivel: true }
      };
      drawnItems.addLayer(layer);
      attachLayerSelection(layer);
      selectLayerHandlerRef.current(layer);
    };
    const editControl = new L.Control.Draw({ edit: { featureGroup: drawnItems }, draw: false });
    map.addControl(editControl);
    const onCreated = (event) => { createMappedLayer(event.layer); setActiveTool('select'); };
    const onDeleted = (event) => {
      event.layers.eachLayer((layer) => { if (selectedLayerRef.current === layer) selectedLayerRef.current = null; });
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
    const isSnappable = activeTool === 'point' || activeTool === 'path';
    map.getContainer().style.cursor = activeTool === 'select' ? '' : 'crosshair';

    const onMouseMove = (event) => {
      if (!isSnappable || !imageBounds.contains(event.latlng)) return clearSnapIndicator();
      const existing = getExistingVertices(featureGroupRef.current, mapData?.features);
      updateSnapIndicator(findClosestSnapVertex(event.latlng, existing, 15));
    };
    if (isSnappable) { map.on('mousemove', onMouseMove); map.on('mouseout', clearSnapIndicator); }

    const createPointOnClick = (event) => {
      if (!imageBounds.contains(event.latlng)) return;
      const existing = getExistingVertices(featureGroupRef.current, mapData?.features);
      const snapped = snapToNearby(event.latlng, existing, 15);
      clearSnapIndicator();
      map.fire(L.Draw.Event.CREATED, { layer: L.marker(snapped), layerType: 'marker' });
    };
    if (activeTool === 'point') map.on('click', createPointOnClick);

    if (activeTool === 'polygon') {
      const onClick = (e) => { if (imageBounds.contains(e.latlng)) setDrawingPoints((prev) => [...prev, e.latlng]); };
      const onDblClick = () => finishPolygonDraft();
      map.on('click', onClick); map.on('dblclick', onDblClick);
      return () => {
        map.off('click', onClick); map.off('dblclick', onDblClick);
        if (isSnappable) { map.off('mousemove', onMouseMove); map.off('mouseout', clearSnapIndicator); }
        clearSnapIndicator(); clearTempDraft();
      };
    }

    if (activeTool === 'path') {
      const onClick = (e) => {
        if (!imageBounds.contains(e.latlng)) return;
        const existing = getExistingVertices(featureGroupRef.current, mapData?.features);
        setDrawingPoints((prev) => [...prev, snapToNearby(e.latlng, existing, 15)]);
      };
      const onDblClick = () => { clearSnapIndicator(); finishPathDraft(); };
      map.on('click', onClick); map.on('dblclick', onDblClick);
      return () => {
        map.off('click', onClick); map.off('dblclick', onDblClick);
        if (isSnappable) { map.off('mousemove', onMouseMove); map.off('mouseout', clearSnapIndicator); }
        clearSnapIndicator(); clearTempDraft();
      };
    }

    return () => {
      map.off('click', createPointOnClick);
      if (isSnappable) { map.off('mousemove', onMouseMove); map.off('mouseout', clearSnapIndicator); }
      clearSnapIndicator();
      map.getContainer().style.cursor = '';
    };
  }, [activeTool, featureGroupRef, finishPolygonDraft, finishPathDraft, map, mapData, setDrawingPoints]);

  useEffect(() => {
    if (activeTool === 'polygon') renderTempPolygon(drawingPoints);
    else if (activeTool === 'path') renderTempPath(drawingPoints);
    else clearTempDraft();
  }, [activeTool, drawingPoints, map]);

  useEffect(() => {
    if (activeTool !== 'polygon' && activeTool !== 'path') { clearTempDraft(); setDrawingPoints([]); }
    if (activeTool !== 'point' && activeTool !== 'path') clearSnapIndicator();
  }, [activeTool, setDrawingPoints]);

  // ← NOVO: atualiza o preview quando a largura muda
  useEffect(() => {
    const layer = selectedLayerRef.current;
    if (!layer || getLayerKind(layer) !== 'edge') {
      if (previewLayerRef.current) {
        map.removeLayer(previewLayerRef.current);
        previewLayerRef.current = null;
      }
      return;
    }
    updatePreview(layer, previewLargura);
  }, [previewLargura, map, selectedLayerRef]);

  return null;
}

export default function MapPoiEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [theme, setTheme] = useTheme();

  const [mapData, setMapData] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const [selectedLayerKey, setSelectedLayerKey] = useState(null);
  const [selectedLayerKind, setSelectedLayerKind] = useState(null);
  const [activeTool, setActiveTool] = useState('select');
  const [drawingPoints, setDrawingPoints] = useState([]);
  const drawingPointsRef = useRef([]);
  const [poiName, setPoiName] = useState("");
  const [poiTipo, setPoiTipo] = useState("sala");
  const [poiDescription, setPoiDescription] = useState("");
  const [poiPhotoUrl, setPoiPhotoUrl] = useState("");
  const [poiAcessivel, setPoiAcessivel] = useState(true);
  const [poiLargura, setPoiLargura] = useState(60);
  const [savingMap, setSavingMap] = useState(false);

  const featureGroupRef = useRef();
  const selectedLayerRef = useRef(null);
  const selectLayerHandlerRef = useRef(() => {});

  useEffect(() => { drawingPointsRef.current = drawingPoints; }, [drawingPoints]);

  useEffect(() => {
    if (!id) { navigate('/map-editor'); return; }
    const found = loadMaps().find((m) => m.id === id);
    if (!found) { setNotFound(true); return; }
    setMapData(found);
  }, [id, navigate]);

  function persistFeatures(featureCollection) {
    const maps = loadMaps();
    const idx = maps.findIndex((m) => m.id === id);
    if (idx === -1) return;
    maps[idx] = { ...maps[idx], features: featureCollection };
    saveMaps(maps);
    setMapData(maps[idx]);
  }

  function saveFeatures() {
    if (!featureGroupRef.current) return;
    setSavingMap(true);
    persistFeatures(featureGroupRef.current.toGeoJSON());
    setSavingMap(false);
    alert('Mapa salvo neste navegador!');
  }

  function handlePoiPhotoUpload(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPoiPhotoUrl(reader.result);
    reader.readAsDataURL(file);
  }

  function selectLayer(layer) {
    if (selectedLayerRef.current && selectedLayerRef.current !== layer) applyDefaultLayerStyle(selectedLayerRef.current);
    selectedLayerRef.current = layer;
    applySelectedLayerStyle(layer);
    setSelectedLayerKey(layer.feature?.properties?.id || `layer-${L.stamp(layer)}`);
    setSelectedLayerKind(getLayerKind(layer));
    const props = layer.feature?.properties || {};
    setPoiName(props.name || '');
    setPoiTipo(props.tipo || 'sala');
    setPoiDescription(props.description || '');
    setPoiPhotoUrl(props.photoUrl || '');
    setPoiAcessivel(props.acessivel !== false);
    setPoiLargura(props.largura ?? 60);
  }
  useEffect(() => { selectLayerHandlerRef.current = selectLayer; });

  function clearPoiForm() {
    if (selectedLayerRef.current) applyDefaultLayerStyle(selectedLayerRef.current);
    selectedLayerRef.current = null;
    setSelectedLayerKey(null); setSelectedLayerKind(null);
    setPoiName(''); setPoiTipo('sala'); setPoiDescription(''); setPoiPhotoUrl(''); setPoiAcessivel(true);
    setPoiLargura(60);
  }

  function applyPoiChanges() {
    const layer = selectedLayerRef.current;
    if (!layer) return;
    const kind = getLayerKind(layer);
    const poiId = layer.feature?.properties?.id || `f-${Date.now()}`;
    if (kind === 'edge') {
      layer.feature = {
        type: 'Feature',
        geometry: layer.feature?.geometry || { type: 'LineString', coordinates: layer.getLatLngs().map((p) => [p.lng, p.lat]) },
        properties: { id: poiId, kind: 'edge', acessivel: poiAcessivel, largura: poiLargura }
      };
    } else {
      layer.feature = {
        type: 'Feature',
        properties: { ...(layer.feature?.properties || {}), id: poiId, kind, tipo: kind === 'area' ? poiTipo : undefined,
          name: poiName, description: poiDescription, photoUrl: poiPhotoUrl, acessivel: poiAcessivel }
      };
    }
    applyDefaultLayerStyle(layer);
    clearPoiForm();
  }

  function selectMappingTool(tool) {
    clearPoiForm();
    if (tool !== 'polygon' && tool !== 'path') setDrawingPoints([]);
    setActiveTool(tool);
  }

  function finishPolygonDraft() {
    const points = drawingPointsRef.current;
    if (!featureGroupRef.current || points.length < 3) return;
    const polygon = L.polygon(points, areaShapeOptions);
    const poiId = `f-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    polygon.feature = { type: 'Feature', properties: { id: poiId, kind: 'area', tipo: 'sala', name: '', description: '', photoUrl: '', acessivel: true } };
    featureGroupRef.current.addLayer(polygon);
    polygon.on('click', (e) => { if (e.originalEvent) L.DomEvent.stopPropagation(e.originalEvent); selectLayer(polygon); });
    selectLayer(polygon);
    setDrawingPoints([]); setActiveTool('select');
  }

  function finishPathDraft() {
    const points = drawingPointsRef.current;
    if (!featureGroupRef.current) return;
    const cleaned = points.filter((pt, i) => i === 0 || pt.lat !== points[i - 1].lat || pt.lng !== points[i - 1].lng);
    if (cleaned.length < 2) return;
    const polyline = L.polyline(cleaned, pathShapeOptions);
    const edgeId = `edge-${Date.now()}`;
    polyline.feature = {
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: cleaned.map((p) => [p.lng, p.lat]) },
      properties: { id: edgeId, kind: 'edge', acessivel: true, largura: 60 }
    };
    featureGroupRef.current.addLayer(polyline);
    polyline.on('click', (e) => { if (e.originalEvent) L.DomEvent.stopPropagation(e.originalEvent); selectLayer(polyline); });
    selectLayer(polyline);
    setDrawingPoints([]); setActiveTool('select');
  }

  const activeToolHint = {
    select: 'Selecione uma área, ponto ou corredor já criado para editar.',
    point: 'Ponto específico: clique uma vez no local exato da planta.',
    polygon: 'Área: clique para contornar a sala/banheiro/escada e finalize com duplo clique.',
    path: 'Corredor: clique para ir marcando o caminho (quantos pontos quiser, para fazer curvas) e finalize com duplo clique.',
  }[activeTool];

  const inputClasses = `w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors ${
    theme === 'dark' ? 'bg-[#0f2346] border border-white/10 text-white placeholder:text-white/30 focus:border-[#4A7FD4]'
      : 'bg-white border border-[#1B2F55]/15 text-[#1B2F55] placeholder:text-[#1B2F55]/35 focus:border-[#4A7FD4]'
  }`;
  const labelClasses = `block text-sm font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-[#1B2F55]'}`;

  if (!id) return null;
  if (notFound) {
    return (
      <PageLayout theme={theme}>
        <PageHeader theme={theme} setTheme={setTheme} isLoggedIn />
        <main className="relative z-10 flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-red-400 text-lg font-semibold">Mapa não encontrado neste navegador.</p>
          <button onClick={() => navigate('/map-editor')} className="px-5 py-2 bg-[#F59E0B] text-[#0B1B3B] font-semibold rounded-lg cursor-pointer">Voltar</button>
        </main>
      </PageLayout>
    );
  }
  if (!mapData) return null;

  return (
    <PageLayout theme={theme} bottomBar={false} showFooter={false}>
      <PageHeader theme={theme} setTheme={setTheme} isLoggedIn />
      <main className={`relative z-10 flex-1 overflow-hidden ${shellOuterClasses(theme)}`}>
        <div className="mx-auto flex min-h-[100svh] w-full max-w-[1600px] flex-col gap-4 px-3 pb-3 pt-4 sm:px-6 lg:flex-row lg:px-10 lg:pt-6">

          <div className={`w-full lg:w-[400px] flex-shrink-0 overflow-y-auto px-5 sm:px-6 py-6 flex flex-col relative z-20 rounded-[28px] border ${panelClasses(theme)}`}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className={`text-xl font-extrabold ${theme === 'dark' ? 'text-white' : 'text-[#1B2F55]'}`}>{mapData.name}</h2>
              <button onClick={() => navigate('/map-editor')} className={`text-xs px-3 py-1.5 rounded-full font-semibold cursor-pointer ${
                theme === 'dark' ? 'text-white/70 bg-white/10 hover:bg-white/15' : 'text-[#1B2F55]/70 bg-[#1B2F55]/10 hover:bg-[#1B2F55]/15'
              }`}>⬅ Voltar</button>
            </div>

            {selectedLayerKey ? (
              selectedLayerKind === 'edge' ? (
                <div className="flex flex-col gap-4">
                  <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-[#0f2346] border-white/10' : 'bg-white border-[#1B2F55]/15'}`}>
                    <p className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-[#1B2F55]'}`}>Corredor</p>

                    <div className="mt-4">
                      <label className={`block text-sm font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-[#1B2F55]'}`}>
                        Largura da faixa: <span className="text-[#F59E0B]">{poiLargura}px</span>
                      </label>
                      <input
                        type="range"
                        min="20"
                        max="200"
                        step="5"
                        value={poiLargura}
                        onChange={(e) => setPoiLargura(Number(e.target.value))}
                        className="w-full accent-[#F59E0B] cursor-pointer"
                      />
                      <div className="flex justify-between mt-1">
                        <span className={`text-[10px] ${theme === 'dark' ? 'text-white/40' : 'text-[#1B2F55]/40'}`}>20</span>
                        <span className={`text-[10px] ${theme === 'dark' ? 'text-white/40' : 'text-[#1B2F55]/40'}`}>200</span>
                      </div>
                      <p className={`text-[11px] mt-2 ${theme === 'dark' ? 'text-white/40' : 'text-[#1B2F55]/40'}`}>
                        A faixa aparece em tempo real no mapa. A rota sempre segue o eixo.
                      </p>
                    </div>

                    <label className="flex items-center gap-2 mt-4 cursor-pointer select-none">
                      <input type="checkbox" checked={poiAcessivel} onChange={(e) => setPoiAcessivel(e.target.checked)} />
                      <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-[#1B2F55]'}`}>Rota acessível (sem escadas)</span>
                    </label>
                  </div>
                  <button onClick={applyPoiChanges} className="w-full px-5 py-2.5 bg-[#F59E0B] text-[#0B1B3B] rounded-full text-sm font-semibold cursor-pointer">Salvar corredor</button>
                  <button onClick={clearPoiForm} className={`text-xs px-3 py-2 rounded-full cursor-pointer ${theme === 'dark' ? 'text-white/60 bg-white/5' : 'text-[#1B2F55]/60 bg-[#1B2F55]/5'}`}>Cancelar</button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div>
                    <label className={labelClasses}>Nome:</label>
                    <input type="text" value={poiName} onChange={(e) => setPoiName(e.target.value)} placeholder="Nome do local..." className={inputClasses} />
                  </div>
                  {selectedLayerKind === 'area' && (
                    <div>
                      <label className={labelClasses}>Tipo:</label>
                      <select value={poiTipo} onChange={(e) => setPoiTipo(e.target.value)} className={inputClasses}>
                        <option value="sala">Sala</option>
                        <option value="banheiro">Banheiro</option>
                        <option value="escada">Escada</option>
                        <option value="elevador">Elevador</option>
                        <option value="outro">Outro</option>
                      </select>
                    </div>
                  )}
                  <div>
                    <label className={labelClasses}>Descrição:</label>
                    <textarea value={poiDescription} onChange={(e) => setPoiDescription(e.target.value)} placeholder="Descrição do local..." rows={4} className={`${inputClasses} resize-vertical`} />
                  </div>
                  {poiPhotoUrl && <img src={poiPhotoUrl} alt="foto" className="w-full rounded-lg object-cover max-h-[140px] border border-white/10" />}
                  <label className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold cursor-pointer bg-[#4A7FD4] text-white w-fit">
                    <input type="file" accept="image/*" onChange={(e) => handlePoiPhotoUpload(e.target.files[0])} className="hidden" />
                    Adicionar foto
                  </label>
                  <button onClick={applyPoiChanges} className="w-full px-5 py-2.5 bg-[#F59E0B] text-[#0B1B3B] rounded-full text-sm font-semibold cursor-pointer">Salvar ponto de interesse</button>
                  <button onClick={clearPoiForm} className={`text-xs px-3 py-2 rounded-full cursor-pointer ${theme === 'dark' ? 'text-white/60 bg-white/5' : 'text-[#1B2F55]/60 bg-[#1B2F55]/5'}`}>Cancelar</button>
                </div>
              )
            ) : (
              <div className="flex-1 flex flex-col gap-5">
                <p className={`text-sm ${theme === 'dark' ? 'text-white/50' : 'text-[#1B2F55]/50'}`}>
                  Use as ferramentas abaixo para criar um ponto, uma área ou um corredor no mapa.
                </p>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: 'select', label: 'Selecionar' },
                      { key: 'point', label: 'Ponto específico' },
                      { key: 'polygon', label: 'Área' },
                      { key: 'path', label: 'Corredor' },
                    ].map((tool) => (
                      <button key={tool.key} onClick={() => selectMappingTool(tool.key)}
                        className={`px-3 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                          activeTool === tool.key ? 'bg-[#F59E0B] text-[#0B1B3B] shadow-md'
                            : theme === 'dark' ? 'bg-white/10 text-white/70 hover:bg-white/15' : 'bg-[#1B2F55]/10 text-[#1B2F55]/70 hover:bg-[#1B2F55]/15'
                        }`}>{tool.label}</button>
                    ))}
                  </div>
                  <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-white/40' : 'text-[#1B2F55]/40'}`}>{activeToolHint}</p>
                  {activeTool === 'polygon' && drawingPoints.length >= 2 && (
                    <div className="flex flex-wrap gap-2">
                      <button onClick={finishPolygonDraft} className="px-3 py-2 rounded-full text-xs font-semibold bg-[#F59E0B] text-[#0B1B3B]">Finalizar área</button>
                      <button onClick={() => setDrawingPoints([])} className={`px-3 py-2 rounded-full text-xs font-semibold ${theme === 'dark' ? 'bg-white/10 text-white/70' : 'bg-[#1B2F55]/10 text-[#1B2F55]/70'}`}>Limpar pontos</button>
                    </div>
                  )}
                  {activeTool === 'path' && drawingPoints.length >= 2 && (
                    <div className="flex flex-wrap gap-2">
                      <button onClick={finishPathDraft} className="px-3 py-2 rounded-full text-xs font-semibold bg-[#F59E0B] text-[#0B1B3B]">Finalizar corredor</button>
                      <button onClick={() => setDrawingPoints([])} className={`px-3 py-2 rounded-full text-xs font-semibold ${theme === 'dark' ? 'bg-white/10 text-white/70' : 'bg-[#1B2F55]/10 text-[#1B2F55]/70'}`}>Limpar pontos</button>
                    </div>
                  )}
                  <button onClick={saveFeatures} disabled={savingMap} className="w-full px-5 py-2.5 bg-[#F59E0B] text-[#0B1B3B] rounded-full text-sm font-semibold cursor-pointer mt-auto">
                    {savingMap ? 'Salvando...' : '💾 Salvar mapa'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 relative min-h-[420px] lg:min-h-0">
            <div className={`absolute inset-0 rounded-[28px] overflow-hidden border ${theme === 'dark' ? 'border-white/10' : 'border-[#1B2F55]/15'}`}>
              <MapContainer crs={L.CRS.Simple} bounds={bounds} maxBounds={bounds} maxBoundsViscosity={0.8}
                doubleClickZoom={false} className="h-full w-full"
                style={{ height: '100%', width: '100%', background: theme === 'dark' ? '#071427' : '#edf3f9' }}>
                <ImageOverlay url={mapData.imageUrl} bounds={bounds} />
                <FeatureGroup ref={featureGroupRef}>
                  <GeoJSON key={id} data={mapData.features} onEachFeature={(_f, layer) => {
                    applyDefaultLayerStyle(layer);
                    layer.on('click', (e) => { if (e.originalEvent) L.DomEvent.stopPropagation(e.originalEvent); selectLayer(layer); });
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
                  finishPathDraft={finishPathDraft}
                  mapData={mapData}
                  previewLargura={poiLargura} // ← NOVO
                />
              </MapContainer>
            </div>
          </div>
        </div>
      </main>
      <PageFooter theme={theme} />
    </PageLayout>
  );
}
