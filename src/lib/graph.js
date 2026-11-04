/**
 * graph.js — Navegação indoor por EIXO de corredor.
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

function keyOf(p) {
  return `${Math.round(p.x * 1000) / 1000},${Math.round(p.y * 1000) / 1000}`;
}

function segmentsProperlyIntersect(a, b, c, d) {
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

function pointInPolygon(px, py, ring) {
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

function densifyLine(coords, step = 15) {
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

/* ------------------------------------------------------------------ */
/*  Grafo                                                              */
/* ------------------------------------------------------------------ */

function addEdge(graph, u, v, weight, acessivel) {
  if (!graph[u]) graph[u] = [];
  const existing = graph[u].find((e) => e.to === v);
  if (!existing) {
    graph[u].push({ to: v, weight, acessivel });
  } else if (weight < existing.weight) {
    existing.weight = weight;
    existing.acessivel = acessivel;
  }
}

const DENSIFY_STEP = 15;
const SEW_DIST = 25;

export function buildGraph(featureCollection) {
  const features = Array.isArray(featureCollection)
    ? featureCollection
    : featureCollection?.features || [];

  const corridors = []; // { coords, acessivel }
  const rooms = [];     // { id, ring, acessivel }

  for (const f of features) {
    const geom = f?.geometry;
    if (!geom) continue;
    const props = f.properties || {};
    const isCorridor = props.kind === 'edge' || props.tipo === 'corredor';

    if (geom.type === 'LineString' && isCorridor) {
      corridors.push({
        coords: geom.coordinates,
        acessivel: props.acessivel !== false,
      });
    } else if (geom.type === 'Polygon' && !isCorridor) {
      rooms.push({
        id: props.id,
        ring: geom.coordinates[0],
        acessivel: props.acessivel !== false,
      });
    }
  }

  const graph = {};
  const corridorNodes = [];

  // 1. Densifica cada eixo e cria trilha linear
  for (let cIdx = 0; cIdx < corridors.length; cIdx++) {
    const corr = corridors[cIdx];
    const dense = densifyLine(corr.coords, DENSIFY_STEP);
    const chain = [];
    for (const [x, y] of dense) {
      const key = keyOf({ x, y });
      if (!graph[key]) graph[key] = [];
      // Adiciona o ID do corredor no nó
      chain.push({ x, y, key, corridorId: cIdx }); 
    }
    for (let i = 0; i < chain.length - 1; i++) {
      const a = chain[i];
      const b = chain[i + 1];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      addEdge(graph, a.key, b.key, d, corr.acessivel);
      addEdge(graph, b.key, a.key, d, corr.acessivel);
    }
    corridorNodes.push(...chain);
  }

  // 2. Costura corredores que se tocam (extremos próximos)
  for (let i = 0; i < corridorNodes.length; i++) {
    const a = corridorNodes[i];
    for (let j = i + 1; j < corridorNodes.length; j++) {
      const b = corridorNodes[j];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d > 0 && d <= SEW_DIST) {
        const jaTem = graph[a.key]?.some(e => e.to === b.key);
        if (!jaTem) {
          addEdge(graph, a.key, b.key, d, true);
          addEdge(graph, b.key, a.key, d, true);
        }
      }
    }
  }

  // 3. Conecta salas aos eixos mais próximos (MÁGICA DA TRAVESSIA AQUI)
  const roomCenterKey = new Map();
  for (const r of rooms) {
    const pts = r.ring.slice(0, -1);
    const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
    const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
    const centerKey = keyOf({ x: cx, y: cy });
    if (!graph[centerKey]) graph[centerKey] = [];
    roomCenterKey.set(r.id, centerKey);

    // Agrupa o nó mais próximo de cada corredor DIFERENTE
    const closestPerCorridor = new Map(); // corridorId -> { p, d }
    
    for (const p of corridorNodes) {
      const cId = p.corridorId ?? 0; // Fallback pra segurança
      const d = Math.hypot(p.x - cx, p.y - cy);
      const existing = closestPerCorridor.get(cId);
      if (!existing || d < existing.d) {
        closestPerCorridor.set(cId, { p, d });
      }
    }

    // Ordena do mais próximo pro mais longe
    const sortedCorridors = Array.from(closestPerCorridor.values()).sort((a, b) => a.d - b.d);

    let connections = 0;
    for (const item of sortedCorridors) {
      // Só conecta se o corredor estiver a uma distância razoável (ex: 150)
      if (item.d < 150) {
        addEdge(graph, centerKey, item.p.key, item.d, r.acessivel);
        addEdge(graph, item.p.key, centerKey, item.d, r.acessivel);
        connections++;
        if (connections >= 2) break; // Conecta no máximo aos 2 corredores mais próximos
      }
    }
  }

  return {
    graph,
    __meta: { roomCenterKey, vertices: [], corridorNodes },
  };
}

/* ------------------------------------------------------------------ */
/*  smoothPath — evita cortar curva                                   */
/* ------------------------------------------------------------------ */

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
  if (!caminho || caminho.length <= 2) return caminho || [];

  const points = caminho.map(k => toPoint(k));
  const result = [points[0]];
  let i = 0;

  while (i < points.length - 1) {
    let j = points.length - 1;
    for (; j > i + 1; j--) {
      const a = points[i];
      const b = points[j];

      if (crossesAnyWall(a, b, rooms)) continue;

      const aInRoom = isPointInsideAnyRoom(a, rooms);
      const bInRoom = isPointInsideAnyRoom(b, rooms);
      const isRoomTransition = aInRoom || bInRoom;

      if (!isRoomTransition && !segmentStaysNearAxis(a, b, corridorNodes, maxDistFromAxis)) {
        continue;
      }

      break;
    }
    result.push(points[j]);
    i = j;
  }

  return result.map(p => keyOf(p));
}

function isPointInsideAnyRoom(p, rooms) {
  if (!rooms?.length) return false;
  for (const r of rooms) {
    const ring = r.ring || r;
    if (pointInPolygon(p.x, p.y, ring)) return true;
  }
  return false;
}

/* ------------------------------------------------------------------ */
/*  Dijkstra                                                           */
/* ------------------------------------------------------------------ */

export function dijkstra(graph, origemKey, destinoKey, { somenteAcessivel = false } = {}) {
  if (!graph || !graph[origemKey] || !graph[destinoKey]) return null;
  if (origemKey === destinoKey) return { caminho: [origemKey], distancia: 0 };

  const dist = {};
  const prev = {};
  const visitados = new Set();
  Object.keys(graph).forEach((k) => { dist[k] = Infinity; });
  dist[origemKey] = 0;

  while (true) {
    let atual = null;
    let menor = Infinity;
    for (const k of Object.keys(dist)) {
      if (!visitados.has(k) && dist[k] < menor) {
        menor = dist[k];
        atual = k;
      }
    }
    if (atual === null || atual === destinoKey) break;
    visitados.add(atual);

    for (const e of graph[atual] || []) {
      if (somenteAcessivel && !e.acessivel) continue;
      const alt = dist[atual] + e.weight;
      if (alt < dist[e.to]) {
        dist[e.to] = alt;
        prev[e.to] = atual;
      }
    }
  }

  if (dist[destinoKey] === Infinity) return null;

  const caminho = [];
  let cur = destinoKey;
  while (cur) {
    caminho.unshift(cur);
    cur = prev[cur];
  }
  return { caminho, distancia: dist[destinoKey] };
}

/* ------------------------------------------------------------------ */
/*  Utilidades                                                         */
/* ------------------------------------------------------------------ */

export function nearestNode(graph, latlng) {
  if (!graph) return null;
  const point = toPoint(latlng);
  if (!point) return null;
  let closest = null;
  let minDist = Infinity;
  for (const node of Object.keys(graph)) {
    if (node === '__meta' || node === 'graph') continue;
    const p = toPoint(node);
    if (!p) continue;
    const d = Math.hypot(point.x - p.x, point.y - p.y);
    if (d < minDist) {
      minDist = d;
      closest = node;
    }
  }
  return closest;
}

export function getRoomCenterKey(graph, roomId) {
  const meta = graph?.__meta;
  if (!meta) return null;
  return meta.roomCenterKey.get(roomId) || null;
}

export function pathToLatLngs(caminho) {
  if (!caminho) return [];
  return caminho
    .map((k) => toPoint(k))
    .filter(Boolean)
    .map((p) => [p.y, p.x]);
}

export function snapAndAugment(graph, features, entryPoint) {
  const point = toPoint(entryPoint);
  if (!point) return null;
  const exactKey = keyOf(point);
  if (graph[exactKey]) return { key: exactKey, graph };

  let closestKey = null;
  let closestDist = Infinity;
  for (const k of Object.keys(graph)) {
    if (k === '__meta' || k === 'graph') continue;
    const p = toPoint(k);
    if (!p) continue;
    const d = Math.hypot(point.x - p.x, point.y - p.y);
    if (d < closestDist) {
      closestDist = d;
      closestKey = k;
    }
  }
  if (!closestKey) return null;

  const g = {};
  for (const k of Object.keys(graph)) g[k] = graph[k].map((e) => ({ ...e }));
  addEdge(g, exactKey, closestKey, closestDist, true);
  addEdge(g, closestKey, exactKey, closestDist, true);
  if (!g[exactKey]) g[exactKey] = [];
  return { key: exactKey, graph: g };
}

export function getEntryPoint(feature, corridorFeatures) {
  if (!feature?.geometry) return null;
  const { type, coordinates } = feature.geometry;
  if (type === 'Point') return { x: coordinates[0], y: coordinates[1] };
  if (type === 'Polygon') {
    const ring = coordinates[0] || [];
    if (ring.length < 2) return null;
    const cx = ring.reduce((s, p) => s + p[0], 0) / ring.length;
    const cy = ring.reduce((s, p) => s + p[1], 0) / ring.length;
    return { x: cx, y: cy };
  }
  return null;
}