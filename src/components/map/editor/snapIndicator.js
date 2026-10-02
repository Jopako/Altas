/**
 * snapIndicator — Gerencia o marcador visual âmbar para feedback de snap de vértices.
 */
import L from "leaflet";

export function createSnapIndicatorManager(map) {
  let snapMarker = null;

  function clearSnapIndicator() {
    if (snapMarker) {
      map.removeLayer(snapMarker);
      snapMarker = null;
    }
  }

  function updateSnapIndicator(target) {
    if (!target) return clearSnapIndicator();
    if (!snapMarker) {
      snapMarker = L.circleMarker(target, {
        radius: 8,
        color: '#f59e0b',
        weight: 2.5,
        fillColor: '#fbbf24',
        fillOpacity: 0.9,
        interactive: false,
      }).addTo(map);
    } else {
      snapMarker.setLatLng(target);
    }
  }

  return { updateSnapIndicator, clearSnapIndicator };
}
