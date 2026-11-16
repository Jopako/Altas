/**
 * smoothPath.js — suaviza o caminho evitando paredes e mantendo-se perto do eixo.
 */
import { keyOf, toPoint, segmentsProperlyIntersect } from './geoMath.js';

function crossesAnyWall(a, b, rooms) {
  if (!rooms?.length) return false;
  for (const r of rooms) {
    const ring = r.ring || r;
    for (let k = 0; k < ring.length - 1; k++) {
      const w1 = { x: ring[k][0], y: ring[k][1] };
      const w2 = { x: ring[k + 1][0], y: ring[k + 1][1] };
      if (segmentsProperlyIntersect(a, b, w1, w2)) return true;
    }
  }
  return false;
}

function segmentStaysNearAxis(a, b, corridorNodes, maxDist) {
  if (!corridorNodes?.length) return true;
  const SAMPLES = 15;
  for (let i = 0; i <= SAMPLES; i++) {
    const t = i / SAMPLES;
    const p = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    let minD = Infinity;
    for (const n of corridorNodes) {
      const d = Math.hypot(p.x - n.x, p.y - n.y);
      if (d < minD) minD = d;
    }
    if (minD > maxDist) return false;
  }
  return true;
}

export function smoothPath(caminho, rooms, corridorNodes = [], maxDistFromAxis = 40) {
  if (!caminho || caminho.length <= 3) return caminho || [];

  const points = caminho.map((k) => toPoint(k));
  const first = points[0];
  const last = points[points.length - 1];

  const inner = points.slice(1, -1);
  const smoothedInner = [inner[0]];
  let i = 0;

  while (i < inner.length - 1) {
    let j = inner.length - 1;
    for (; j > i + 1; j--) {
      const a = inner[i];
      const b = inner[j];

      if (crossesAnyWall(a, b, rooms)) continue;
      if (!segmentStaysNearAxis(a, b, corridorNodes, maxDistFromAxis)) continue;

      break;
    }
    smoothedInner.push(inner[j]);
    i = j;
  }

  return [first, ...smoothedInner, last].map((p) => keyOf(p));
}