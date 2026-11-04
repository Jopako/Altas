import { useState, useRef, useEffect } from "react";
import L from "leaflet";
import { loadMyWorkspace, saveMyWorkspace, uploadBlockImage } from "../lib/workspacesStorage";
import {
  areaShapeOptions,
  pathShapeOptions,
  getLayerKind,
  applyDefaultLayerStyle,
  applySelectedLayerStyle,
} from "../components/map/editor/layerStyles";

const MIN_BLOCK_DISTANCE = 150;

// Transladar coordenadas GeoJSON recursivamente ([lng, lat] no CRS.Simple)
function translateFeatureCoords(coords, dx, dy) {
  if (typeof coords[0] === "number") {
    return [coords[0] + dx, coords[1] + dy];
  }
  return coords.map((c) => translateFeatureCoords(c, dx, dy));
}

export function usePoiEditor(setMapData) {
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedLayerKey, setSelectedLayerKey] = useState(null);
  const [selectedLayerKind, setSelectedLayerKind] = useState(null);
  const [activeTool, setActiveTool] = useState('select');
  const [drawingPoints, setDrawingPoints] = useState([]);
  const drawingPointsRef = useRef([]);
  
  const [selectedBlockId, setSelectedBlockId] = useState(null);

  const [poiName, setPoiName] = useState("");
  const [poiTipo, setPoiTipo] = useState("sala");
  const [poiGallery, setPoiGallery] = useState([]);
  const [poiAcessivel, setPoiAcessivel] = useState(true);
  const [poiLargura, setPoiLargura] = useState(60);
  const [savingMap, setSavingMap] = useState(false);

  const featureGroupRef = useRef();
  const selectedLayerRef = useRef(null);
  const selectLayerHandlerRef = useRef(() => {});

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const ws = await loadMyWorkspace();
        setWorkspace(ws);
        if (setMapData) setMapData(ws);
      } catch (err) {
        console.error("Erro ao carregar workspace:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [setMapData]);

  useEffect(() => {
    drawingPointsRef.current = drawingPoints;
  }, [drawingPoints]);

  // Mistura as features do bloco atual com as dos outros
  async function saveFeatures() {
    if (!featureGroupRef.current || !workspace) return;
    
    setSavingMap(true);

    // 1. O que está na tela AGORA (só do bloco atual)
    const currentFeatures = featureGroupRef.current.toGeoJSON().features;

    // 2. Garante que o blockId foi salvo em todas
    const featuresWithBlockId = currentFeatures.map(f => ({
      ...f,
      //Se a feature já tem blockId (é de outro bloco), mantém. Se for nova, põe o atual.
      properties: { ...f.properties, blockId: f.properties?.blockId || selectedBlockId }
    }));

    // 3. Pega o que já existia no workspace dos OUTROS blocos
    const allWorkspaceFeatures = workspace.features?.features || [];
    const otherBlockFeatures = allWorkspaceFeatures.filter(
      f => f.properties?.blockId !== selectedBlockId
    );

    // 4. Junta tudo e cria o payload
    const mergedFeatures = {
      type: 'FeatureCollection',
      features: [...otherBlockFeatures, ...featuresWithBlockId]
    };

    const payload = {
      name: workspace.name || "Minha Workspace",
      features: mergedFeatures,
      blockMeta: workspace.blockMeta || {},
    };

    try {
      const updated = await saveMyWorkspace(payload);
      setWorkspace((prev) => ({ ...prev, ...updated }));
      if (setMapData) setMapData(updated);
      alert('Workspace salvo com sucesso!');
    } catch (err) {
      console.error("Erro ao salvar workspace:", err);
      alert('Erro ao salvar o workspace no servidor.');
    } finally {
      setSavingMap(false);
    }
  }

  async function handlePoiPhotoUpload(file) {
    if (!file) return;
    try {
      const uploadRes = await uploadBlockImage(file);
      const imageUrl = uploadRes.imageUrl || uploadRes.url;
      
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
      const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${API_BASE}${imageUrl}`;

      setPoiGallery((prev) => [...prev, { photo: fullImageUrl, description: '' }]);
    } catch (err) {
      console.error("Erro ao fazer upload da foto do ponto:", err);
      alert("Erro ao enviar a foto para o servidor.");
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
    setPoiTipo(props.tipo || 'sala');
    setPoiGallery(props.gallery || (props.photoUrl ? [{ photo: props.photoUrl, description: props.description || '' }] : []));
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
    setPoiGallery([]);
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
        properties: { id: poiId, kind: 'edge', blockId: selectedBlockId, acessivel: poiAcessivel, largura: poiLargura },
      };
    } else {
      layer.feature = {
        type: 'Feature',
        properties: {
          ...(layer.feature?.properties || {}),
          id: poiId,
          kind,
          blockId: selectedBlockId,
          tipo: kind === 'area' ? poiTipo : undefined,
          name: poiName,
          gallery: poiGallery,
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
    if (!featureGroupRef.current || points.length < 3 || !selectedBlockId) return;
    const polygon = L.polygon(points, areaShapeOptions);
    const poiId = `f-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    polygon.feature = {
      type: 'Feature',
      properties: { id: poiId, kind: 'area', blockId: selectedBlockId, tipo: 'sala', name: '', gallery: [], acessivel: true },
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
    if (!featureGroupRef.current || !selectedBlockId) return;
    const cleaned = points.filter(
      (pt, i) => i === 0 || pt.lat !== points[i - 1].lat || pt.lng !== points[i - 1].lng
    );
    if (cleaned.length < 2) return;
    const polyline = L.polyline(cleaned, pathShapeOptions);
    const edgeId = `edge-${Date.now()}`;
    polyline.feature = {
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: cleaned.map((p) => [p.lng, p.lat]) },
      properties: { id: edgeId, kind: 'edge', blockId: selectedBlockId, acessivel: true, largura: 60 },
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

  /**
   * Move um bloco inteiro (bounds + todas as features do bloco).
   * Valida colisão com margem mínima. Atualiza estado React e layers do Leaflet.
   * @returns {boolean} true se moveu com sucesso
   */
  function moveBlock(blockId, dx, dy) {
    if (!workspace || !blockId) return false;

    const currentMeta = workspace.blockMeta?.[blockId];
    if (!currentMeta || !currentMeta.bounds) return false;

    const currentBounds = currentMeta.bounds;

    // Bounds no Leaflet: [[south, west], [north, east]] → no CRS.Simple é [[y0, x0], [y1, x1]]
    const newBounds = [
      [currentBounds[0][0] + dy, currentBounds[0][1] + dx],
      [currentBounds[1][0] + dy, currentBounds[1][1] + dx],
    ];

    // 1. Validação de colisão (margem mínima)
    const hasCollision = Object.entries(workspace.blockMeta || {}).some(([otherId, meta]) => {
      if (otherId === blockId || !meta.bounds) return false;
      const other = meta.bounds;
      return (
        newBounds[0][0] < other[1][0] + MIN_BLOCK_DISTANCE &&
        newBounds[1][0] > other[0][0] - MIN_BLOCK_DISTANCE &&
        newBounds[0][1] < other[1][1] + MIN_BLOCK_DISTANCE &&
        newBounds[1][1] > other[0][1] - MIN_BLOCK_DISTANCE
      );
    });

    if (hasCollision) {
      alert("Distância mínima entre blocos não respeitada!");
      return false;
    }

    // 2. Atualiza as coordenadas das features no estado
    const allFeatures = workspace.features?.features || [];
    const updatedFeatures = allFeatures.map((f) => {
      if (f.properties?.blockId !== blockId) return f;
      return {
        ...f,
        geometry: {
          ...f.geometry,
          coordinates: translateFeatureCoords(f.geometry.coordinates, dx, dy),
        },
      };
    });

    // 3. Novo estado do workspace
    const newWorkspace = {
      ...workspace,
      blockMeta: {
        ...workspace.blockMeta,
        [blockId]: { ...currentMeta, bounds: newBounds },
      },
      features: { type: "FeatureCollection", features: updatedFeatures },
    };

    setWorkspace(newWorkspace);
    if (setMapData) setMapData(newWorkspace);

    // 4. Atualiza visualmente os layers já renderizados no FeatureGroup
    if (featureGroupRef.current) {
      featureGroupRef.current.eachLayer((layer) => {
        if (layer.feature?.properties?.blockId !== blockId) return;

        if (layer.setLatLngs) {
          const latlngs = layer.getLatLngs();
          // Polygon: array de rings; Polyline: array de pontos
          if (Array.isArray(latlngs[0])) {
            const newLatLngs = latlngs.map((ring) =>
              ring.map((p) => L.latLng(p.lat + dy, p.lng + dx))
            );
            layer.setLatLngs(newLatLngs);
          } else {
            const newLatLngs = latlngs.map((p) => L.latLng(p.lat + dy, p.lng + dx));
            layer.setLatLngs(newLatLngs);
          }
        }

        if (layer.setLatLng) {
          const p = layer.getLatLng();
          layer.setLatLng(L.latLng(p.lat + dy, p.lng + dx));
        }
      });
    }

    return true;
  }

  return {
    workspace, loading, selectedBlockId, setSelectedBlockId,
    selectedLayerKey, selectedLayerKind, activeTool, setActiveTool, drawingPoints, setDrawingPoints,
    poiName, setPoiName, poiTipo, setPoiTipo, poiGallery, setPoiGallery,
    poiAcessivel, setPoiAcessivel, poiLargura, setPoiLargura, savingMap,
    featureGroupRef, selectedLayerRef, selectLayerHandlerRef, selectLayer, clearPoiForm,
    applyPoiChanges, selectMappingTool, finishPolygonDraft, finishPathDraft,
    saveFeatures, handlePoiPhotoUpload, moveBlock,
  };
}