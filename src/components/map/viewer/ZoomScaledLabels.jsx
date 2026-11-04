import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

export function ZoomScaledLabels() {
  const map = useMap();
  useEffect(() => {
    const update = () => {
      const z = map.getZoom();
      const scale = Math.pow(1.35, z);
      map.getContainer().style.setProperty('--label-scale', scale);
    };
    update();
    map.on('zoomend', update);
    return () => map.off('zoomend', update);
  }, [map]);
  return null;
}
