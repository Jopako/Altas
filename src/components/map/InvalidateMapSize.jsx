/**
 * InvalidateMapSize — Força o Leaflet a recalcular dimensões ao redimensionar ou rotacionar a tela.
 * Leaflet mede o container na montagem; no flex mobile a altura real pode ser resolvida após o layout.
 */
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

export function InvalidateMapSize() {
  const map = useMap();
  useEffect(() => {
    const kick = () => map.invalidateSize();
    kick();
    const ro = new ResizeObserver(kick);
    ro.observe(map.getContainer());
    window.addEventListener('orientationchange', kick);
    return () => {
      ro.disconnect();
      window.removeEventListener('orientationchange', kick);
    };
  }, [map]);
  return null;
}
