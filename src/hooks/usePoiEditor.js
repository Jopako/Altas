/**
 * usePoiEditor — Hook de gerenciamento de estado e operações do editor de POIs/corredores.
 */
import { useState, useRef, useEffect } from "react";
import L from "leaflet";
import { updateMapFeatures } from "../lib/mapsStorage";
import {
  areaShapeOptions,
  pathShapeOptions,
  getLayerKind,
  applyDefaultLayerStyle,
  applySelectedLayerStyle,
} from "../components/map/editor/layerStyles";

export function usePoiEditor(id, setMapData) {
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

  useEffect(() => {
    drawingPointsRef.current = drawingPoints;
  }, [drawingPoints]);

  function persistFeatures(featureCollection) {
    const updated = updateMapFeatures(id, featureCollection);
    if (updated && setMapData) setMapData(updated);
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
    if (selectedLayerRef.current && selectedLayerRef.current !== layer) {
      applyDefaultLayerStyle(selectedLayerRef.current);
    }
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

  useEffect(() => {
    selectLayerHandlerRef.current = selectLayer;
  });

  function clearPoiForm() {
    if (selectedLayerRef.current) applyDefaultLayerStyle(selectedLayerRef.current);
    selectedLayerRef.current = null;
    setSelectedLayerKey(null);
    setSelectedLayerKind(null);
    setPoiName('');
    setPoiTipo('sala');
    setPoiDescription('');
    setPoiPhotoUrl('');
    setPoiAcessivel(true);
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
        geometry: layer.feature?.geometry || {
          type: 'LineString',
          coordinates: layer.getLatLngs().map((p) => [p.lng, p.lat]),
        },
        properties: { id: poiId, kind: 'edge', acessivel: poiAcessivel, largura: poiLargura },
      };
    } else {
      layer.feature = {
        type: 'Feature',
        properties: {
          ...(layer.feature?.properties || {}),
          id: poiId,
          kind,
          tipo: kind === 'area' ? poiTipo : undefined,
          name: poiName,
          description: poiDescription,
          photoUrl: poiPhotoUrl,
          acessivel: poiAcessivel,
        },
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
    polygon.feature = {
      type: 'Feature',
      properties: { id: poiId, kind: 'area', tipo: 'sala', name: '', description: '', photoUrl: '', acessivel: true },
    };
    featureGroupRef.current.addLayer(polygon);
    polygon.on('click', (e) => {
      if (e.originalEvent) L.DomEvent.stopPropagation(e.originalEvent);
      selectLayer(polygon);
    });
    selectLayer(polygon);
    setDrawingPoints([]);
    setActiveTool('select');
  }

  function finishPathDraft() {
    const points = drawingPointsRef.current;
    if (!featureGroupRef.current) return;
    const cleaned = points.filter(
      (pt, i) => i === 0 || pt.lat !== points[i - 1].lat || pt.lng !== points[i - 1].lng
    );
    if (cleaned.length < 2) return;
    const polyline = L.polyline(cleaned, pathShapeOptions);
    const edgeId = `edge-${Date.now()}`;
    polyline.feature = {
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: cleaned.map((p) => [p.lng, p.lat]) },
      properties: { id: edgeId, kind: 'edge', acessivel: true, largura: 60 },
    };
    featureGroupRef.current.addLayer(polyline);
    polyline.on('click', (e) => {
      if (e.originalEvent) L.DomEvent.stopPropagation(e.originalEvent);
      selectLayer(polyline);
    });
    selectLayer(polyline);
    setDrawingPoints([]);
    setActiveTool('select');
  }

  return {
    selectedLayerKey, selectedLayerKind, activeTool, setActiveTool, drawingPoints, setDrawingPoints,
    poiName, setPoiName, poiTipo, setPoiTipo, poiDescription, setPoiDescription,
    poiPhotoUrl, poiAcessivel, setPoiAcessivel, poiLargura, setPoiLargura, savingMap,
    featureGroupRef, selectedLayerRef, selectLayerHandlerRef, selectLayer, clearPoiForm,
    applyPoiChanges, selectMappingTool, finishPolygonDraft, finishPathDraft,
    saveFeatures, handlePoiPhotoUpload,
  };
}
