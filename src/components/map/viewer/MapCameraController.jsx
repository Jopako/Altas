import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

export function MapCameraController({ blocoAtivo, blockMeta, workspaceBounds }) {
  const map = useMap();
  const lastAction = useRef("");

  useEffect(() => {
    const executarAcao = () => {
      map.invalidateSize();
      if (map.getSize().x < 40) return;

      if (blocoAtivo) {
        const meta = blockMeta?.[blocoAtivo];
        if (meta && meta.bounds) {
          const b = meta.bounds;
          if (Array.isArray(b) && b.length === 2) {
            const lat1 = Number(b[0][0]), lng1 = Number(b[0][1]);
            const lat2 = Number(b[1][0]), lng2 = Number(b[1][1]);
            
            if ([lat1, lng1, lat2, lng2].every(Number.isFinite)) {
              const bounds = L.latLngBounds([lat1, lng1], [lat2, lng2]);
              if (bounds.isValid()) {
                const actionKey = `bloco-${blocoAtivo}`;
                if (lastAction.current !== actionKey) {
                  lastAction.current = actionKey;
                  map.flyToBounds(bounds, { padding: [20, 20], duration: 0.8 });
                }
              }
            }
          }
        }
        return;
      }

      if (!blocoAtivo && workspaceBounds && workspaceBounds.isValid()) {
        const actionKey = "workspace-overview";
        if (lastAction.current !== actionKey) {
          lastAction.current = actionKey;
          setTimeout(() => {
            map.fitBounds(workspaceBounds, { padding: [40, 40], animate: false });
          }, 100);
        }
      }
    };

    map.whenReady(() => {
      setTimeout(executarAcao, 150);
    });

  }, [map, blocoAtivo, blockMeta, workspaceBounds]);

  return null;
}
