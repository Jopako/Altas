import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { getFeatureCenter } from '../../../lib/geo';

export function FocusPoi({ poi }) {
  const map = useMap();
  useEffect(() => {
    if (!poi) return;
    let center;
    try { center = getFeatureCenter(poi); } catch (err) { return; }
    if (!center) return;
    const lat = Number(center.lat);
    const lng = Number(center.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    try {
      map.panTo([lat, lng], { animate: true, duration: 0.5 });
    } catch (err) {}
  }, [poi, map]);
  return null;
}
