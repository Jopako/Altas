import L from 'leaflet';
import { trimRouteToSalas } from './routeUtils';

/** L.latLngBounds que engloba todos os blocos do workspace. */
export function computeWorkspaceBounds(blockMeta) {
  const allBounds = Object.values(blockMeta || {})
    .map((b) => b?.bounds)
    .filter((b) => Array.isArray(b) && b.length === 2 && Array.isArray(b[0]) && Array.isArray(b[1]));

  if (allBounds.length === 0) return L.latLngBounds([0, 0], [1000, 800]);

  let minLat = Infinity, minLng = Infinity, maxLat = -Infinity, maxLng = -Infinity;
  allBounds.forEach(([sw, ne]) => {
    if (sw[0] < minLat) minLat = sw[0];
    if (sw[1] < minLng) minLng = sw[1];
    if (ne[0] > maxLat) maxLat = ne[0];
    if (ne[1] > maxLng) maxLng = ne[1];
  });
  return L.latLngBounds([minLat, minLng], [maxLat, maxLng]);
}

/** Corta a rota nas bordas das salas de origem/destino e define os pinos. */
export function processRouteForDisplay(rotaPontos, navOrigem, navDestino) {
  let rotaAjustada = rotaPontos ? [...rotaPontos] : null;
  let pinoOrigem = null;
  let pinoDestino = null;

  if (rotaAjustada) {
    if (navOrigem?.feature) {
      const res = trimRouteToSalas(rotaAjustada, navOrigem.feature, true);
      rotaAjustada = res.route;
      pinoOrigem = res.edgePoint;
    }
    if (navDestino?.feature) {
      const res = trimRouteToSalas(rotaAjustada, navDestino.feature, false);
      rotaAjustada = res.route;
      pinoDestino = res.edgePoint;
    }
  }

  return {
    rotaAjustada,
    finalPinoOrigem: pinoOrigem || (rotaAjustada && rotaAjustada[0]),
    finalPinoDestino: pinoDestino || (rotaAjustada && rotaAjustada[rotaAjustada.length - 1]),
  };
}

/** Remove duplicadas (por id/geometria) e filtra pelo bloco ativo. */
export function filterByBlock(features, blocoAtivo) {
  const unique = Array.from(
    new Map(features.map((f) => [f.properties?.id || JSON.stringify(f.geometry), f])).values()
  );
  return blocoAtivo ? unique.filter((f) => f.properties?.blockId === blocoAtivo) : unique;
}
