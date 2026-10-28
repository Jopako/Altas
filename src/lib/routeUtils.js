import { getFeatureCenter } from './geo';

function isPointInPolygon(x, y, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

export function trimRouteToSalas(route, feature, isOrigem) {
  if (!route || route.length < 2 || !feature || feature.geometry?.type !== 'Polygon') {
    return { route, edgePoint: null };
  }
  
  const ring = feature.geometry.coordinates[0];
  const getXY = (p) => Array.isArray(p) ? { x: p[1], y: p[0] } : { x: p.lng, y: p.lat };

  // Passo 1: Achar o ÚLTIMO ponto que está FORA da sala
  // (Se for origem, varre do começo pro fim. Se for destino, varre do fim pro começo)
  let indexFora = -1;
  
  if (isOrigem) {
    for (let i = 0; i < route.length; i++) {
      const pt = getXY(route[i]);
      if (!isPointInPolygon(pt.x, pt.y, ring)) {
        indexFora = i;
        break; // Achou o primeiro ponto fora
      }
    }
  } else {
    for (let i = route.length - 1; i >= 0; i--) {
      const pt = getXY(route[i]);
      if (!isPointInPolygon(pt.x, pt.y, ring)) {
        indexFora = i;
        break; // Achou o último ponto fora
      }
    }
  }

  // Se não achou nenhum ponto fora (rota toda dentro), ignora
  if (indexFora === -1) return { route, edgePoint: null };

  const pFora = getXY(route[indexFora]);
  const pCentro = getXY(route[isOrigem ? 0 : route.length - 1]);

  // Passo 2: Projetar o ponto do corredor na parede da sala
  let closestEdge = null;
  let minDist = Infinity;

  for (let i = 0; i < ring.length; i++) {
    const p1 = { x: ring[i][0], y: ring[i][1] };
    const p2 = { x: ring[(i + 1) % ring.length][0], y: ring[(i + 1) % ring.length][1] };
    
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len2 = dx * dx + dy * dy;
    if (len2 === 0) continue;
    
    let t = ((pFora.x - p1.x) * dx + (pFora.y - p1.y) * dy) / len2;
    t = Math.max(0, Math.min(1, t));
    
    const closestX = p1.x + t * dx;
    const closestY = p1.y + t * dy;
    const dist = Math.sqrt((closestX - pFora.x)**2 + (closestY - pFora.y)**2);
    
    if (dist < minDist) {
      minDist = dist;
      closestEdge = { lat: closestY, lng: closestX };
    }
  }

  if (!closestEdge) return { route, edgePoint: null };

  // Passo 3: Montar a nova rota (cortando tudo que tá dentro)
  let newRoute = [];

  if (isOrigem) {
    // Bota a bolinha na parede + o resto da rota do corredor pra frente
    newRoute = [closestEdge, ...route.slice(indexFora)];
  } else {
    // Pega a rota do começo até o corredor + bota a bolinha na parede no final
    newRoute = [...route.slice(0, indexFora + 1), closestEdge];
  }

  return { route: newRoute, edgePoint: closestEdge };
}