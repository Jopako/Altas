import { useEffect } from "react";
import { useMap } from "react-leaflet";

/** Ajusta a view do mapa quando muda de modo ou de bloco. */
export function FitBoundsOnMode({ bounds, trigger }) {
  const map = useMap();
  useEffect(() => {
    if (!bounds) return;
    const t = setTimeout(() => {
      try {
        map.fitBounds(bounds, { padding: [40, 40], animate: false });
      } catch (_) {}
    }, 50);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, trigger]);
  return null;
}
