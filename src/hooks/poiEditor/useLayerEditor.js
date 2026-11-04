import { useState, useRef, useEffect } from "react";
import L from "leaflet";
import { getLayerKind, applyDefaultLayerStyle, applySelectedLayerStyle } from "../../components/map/editor/layerStyles";

export function useLayerEditor(selectedBlockId) {
  const [selectedLayerKey, setSelectedLayerKey] = useState(null);
  const [selectedLayerKind, setSelectedLayerKind] = useState(null);
  
  const [poiName, setPoiName] = useState("");
  const [poiTipo, setPoiTipo] = useState("sala");
  const [poiGallery, setPoiGallery] = useState([]);
  const [poiAcessivel, setPoiAcessivel] = useState(true);
  const [poiLargura, setPoiLargura] = useState(60);

  const selectedLayerRef = useRef(null);
  const selectLayerHandlerRef = useRef(() => {});

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
          description: poiGallery[0]?.description || '',
          photoUrl: poiGallery[0]?.photo || '',
          acessivel: poiAcessivel,
        },
      };
    }
    applyDefaultLayerStyle(layer);
    clearPoiForm();
  }

  return {
    selectedLayerKey, selectedLayerKind,
    poiName, setPoiName, poiTipo, setPoiTipo,
    poiGallery, setPoiGallery, poiAcessivel, setPoiAcessivel,
    poiLargura, setPoiLargura,
    selectedLayerRef, selectLayerHandlerRef, selectLayer, clearPoiForm, applyPoiChanges
  };
}