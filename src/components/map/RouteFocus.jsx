/**
 * RouteFocus — Enquadra a câmera do mapa Leaflet (fitBounds) nos limites da rota calculada.
 */
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

export function RouteFocus({ pontos }) {
  const map = useMap();
  useEffect(() => {
    if (!pontos || pontos.length < 2) return;
    const b = L.latLngBounds(pontos);
    map.fitBounds(b, { padding: [40, 40] });
  }, [pontos, map]);
  return null;
}
