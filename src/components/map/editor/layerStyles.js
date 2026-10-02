/**
 * layerStyles — Configurações de estilo e identificação de tipo das camadas Leaflet no editor.
 */
import L from "leaflet";

export const areaShapeOptions = {
  color: '#00d4ff',
  weight: 3,
  opacity: 0.95,
  fillColor: '#00d4ff',
  fillOpacity: 0.22,
};

export const selectedShapeOptions = {
  color: '#ffcc00',
  weight: 4,
  opacity: 1,
  fillColor: '#ffcc00',
  fillOpacity: 0.28,
};

export const pathShapeOptions = {
  color: '#2563eb',
  weight: 4,
  opacity: 0.9,
  dashArray: '6 8',
};

export const selectedPathShapeOptions = {
  color: '#ffcc00',
  weight: 5,
  opacity: 1,
  dashArray: '6 8',
};

export function getLayerKind(layer) {
  if (layer instanceof L.Marker) return 'point';
  if (layer instanceof L.Polyline && !(layer instanceof L.Polygon)) return 'edge';
  return 'area';
}

export function applyDefaultLayerStyle(layer) {
  if (typeof layer.setStyle !== 'function') return;
  layer.setStyle(getLayerKind(layer) === 'edge' ? pathShapeOptions : areaShapeOptions);
}

export function applySelectedLayerStyle(layer) {
  if (typeof layer.setStyle !== 'function') return;
  layer.setStyle(getLayerKind(layer) === 'edge' ? selectedPathShapeOptions : selectedShapeOptions);
}
