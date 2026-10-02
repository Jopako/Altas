/**
 * snap — Snap de vértice para encaixar corredores; distância em unidades do CRS Simple.
 * Tolerância default 15 no CRS da planta.
 */
import L from "leaflet";

export function findClosestSnapVertex(latlng, existingVertices, tolerance = 15) {
  if (!latlng || !existingVertices?.length) return null;
  let closest = null;
  let minDistance = Infinity;
  for (const v of existingVertices) {
    const d = Math.hypot(latlng.lng - v.lng, latlng.lat - v.lat);
    if (d <= tolerance && d < minDistance) {
      minDistance = d;
      closest = v;
    }
  }
  return closest ? L.latLng(closest.lat, closest.lng) : null;
}

export function snapToNearby(latlng, existingVertices, tolerance = 15) {
  return findClosestSnapVertex(latlng, existingVertices, tolerance) || latlng;
}

export function getExistingVertices(featureGroup, mapFeatures) {
  const vertices = [];
  const seen = new Set();

  const addVertex = (lat, lng) => {
    if (
      typeof lat !== 'number' ||
      typeof lng !== 'number' ||
      Number.isNaN(lat) ||
      Number.isNaN(lng)
    ) {
      return;
    }
    const key = `${lat.toFixed(6)},${lng.toFixed(6)}`;
    if (!seen.has(key)) {
      seen.add(key);
      vertices.push(L.latLng(lat, lng));
    }
  };

  if (mapFeatures?.features) {
    mapFeatures.features.forEach((feat) => {
      const geom = feat?.geometry;
      if (!geom) return;
      if (geom.type === 'Point') {
        addVertex(geom.coordinates[1], geom.coordinates[0]);
      } else if (geom.type === 'LineString') {
        geom.coordinates.forEach((c) => addVertex(c[1], c[0]));
      }
    });
  }

  if (featureGroup?.eachLayer) {
    const inspect = (layer) => {
      if (layer.eachLayer) {
        layer.eachLayer(inspect);
        return;
      }
      if (layer instanceof L.Marker) {
        const ll = layer.getLatLng();
        addVertex(ll.lat, ll.lng);
      } else if (layer instanceof L.Polyline && !(layer instanceof L.Polygon)) {
        const flat = layer.getLatLngs().flat(Infinity);
        flat.forEach((p) => addVertex(p.lat, p.lng));
      }
    };
    featureGroup.eachLayer(inspect);
  }

  return vertices;
}
