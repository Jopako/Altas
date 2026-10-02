/**
 * geo — Cálculos geométricos auxiliares para o mapa indoor.
 */

export function getFeatureCenter(feature) {
  if (!feature?.geometry) return null;
  const { type, coordinates } = feature.geometry;
  if (type === 'Point') {
    const [lng, lat] = coordinates;
    return { lng, lat };
  }
  if (type === 'Polygon') {
    const ring = coordinates[0] || [];
    if (!ring.length) return null;
    const points =
      ring.length > 1 &&
      ring[0][0] === ring[ring.length - 1][0] &&
      ring[0][1] === ring[ring.length - 1][1]
        ? ring.slice(0, -1)
        : ring;
    const sum = points.reduce(
      (acc, [lng, lat]) => ({ lng: acc.lng + lng, lat: acc.lat + lat }),
      { lng: 0, lat: 0 }
    );
    return { lng: sum.lng / points.length, lat: sum.lat / points.length };
  }
  return null;
}
