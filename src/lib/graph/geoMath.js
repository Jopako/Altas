/**
 * geoMath.js — funções geométricas puras (sem dependência do grafo).
 */

export function toPoint(target) {
  if (!target) return null;
  if (typeof target === 'string') {
    const parts = target.split(',').map(Number);
    if (parts.length === 2 && !Number.isNaN(parts[0]) && !Number.isNaN(parts[1])) {
      return { x: parts[0], y: parts[1] };
    }
  }
  if (Array.isArray(target) && target.length >= 2) {
    const x = Number(target[0]);
    const y = Number(target[1]);
    if (!Number.isNaN(x) && !Number.isNaN(y)) return { x, y };
  }
  if (typeof target.x === 'number' && typeof target.y === 'number') {
    return { x: target.x, y: target.y };
  }
  if (typeof target.lng === 'number' && typeof target.lat === 'number') {
    return { x: target.lng, y: target.lat };
  }
  return null;
}

export function keyOf(p) {
  return `${Math.round(p.x * 1000) / 1000},${Math.round(p.y * 1000) / 1000}`;
}

export function segmentsProperlyIntersect(a, b, c, d) {
  const d1x = b.x - a.x;
  const d1y = b.y - a.y;
  const d2x = d.x - c.x;
  const d2y = d.y - c.y;
  const denom = d1x * d2y - d1y * d2x;
  if (Math.abs(denom) < 1e-12) return false;
  const t = ((c.x - a.x) * d2y - (c.y - a.y) * d2x) / denom;
  const u = ((c.x - a.x) * d1y - (c.y - a.y) * d1x) / denom;
  const EPS = 1e-9;
  return t > EPS && t < 1 - EPS && u > EPS && u < 1 - EPS;
}

export function pointInPolygon(px, py, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    const intersect = ((yi > py) !== (yj > py)) &&
      (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

export function lineStringToPolygon(coords, halfWidth = 30) {
  if (!coords || coords.length < 2) return null;

  const leftSide = [], rightSide = [];

  for (let i = 0; i < coords.length; i++) {
    const [x, y] = coords[i];
    let dx, dy;
    let localHalf = halfWidth;

    if (i === 0) {
      dx = coords[1][0] - x;
      dy = coords[1][1] - y;
    } else if (i === coords.length - 1) {
      dx = x - coords[i - 1][0];
      dy = y - coords[i - 1][1];
    } else {
      dx = coords[i + 1][0] - coords[i - 1][0];
      dy = coords[i + 1][1] - coords[i - 1][1];

      const v1x = x - coords[i - 1][0], v1y = y - coords[i - 1][1];
      const v2x = coords[i + 1][0] - x, v2y = coords[i + 1][1] - y;
      const len1 = Math.hypot(v1x, v1y) || 1;
      const len2 = Math.hypot(v2x, v2y) || 1;
      const dot = (v1x * v2x + v1y * v2y) / (len1 * len2);
      const angle = Math.acos(Math.max(-1, Math.min(1, dot)));

      if (angle > Math.PI / 3) {
        const factor = Math.max(0.3, 1 - (angle - Math.PI / 3) / Math.PI);
        localHalf = halfWidth * factor;
      }
    }

    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len;
    leftSide.push([x + nx * localHalf, y + ny * localHalf]);
    rightSide.push([x - nx * localHalf, y - ny * localHalf]);
  }

  const ring = [...leftSide, ...rightSide.reverse(), leftSide[0]];
  return { type: 'Polygon', coordinates: [ring] };
}

export function densifyLine(coords, step = 15) {
  if (!coords || coords.length < 2) return coords || [];
  const out = [];
  for (let i = 0; i < coords.length - 1; i++) {
    const [x1, y1] = coords[i];
    const [x2, y2] = coords[i + 1];
    const d = Math.hypot(x2 - x1, y2 - y1);
    const n = Math.max(1, Math.floor(d / step));
    for (let k = 0; k < n; k++) {
      const t = k / n;
      out.push([x1 + (x2 - x1) * t, y1 + (y2 - y1) * t]);
    }
  }
  out.push(coords[coords.length - 1]);
  return out;
}
