/**
 * graphUtils.js — utilidades de grafo (arestas, nó mais próximo, snap, pontos de entrada).
 */
import { keyOf, toPoint } from './geoMath.js';

export function addEdge(graph, u, v, weight, acessivel) {
  if (!graph[u]) graph[u] = [];
  const existing = graph[u].find((e) => e.to === v);
  if (!existing) {
    graph[u].push({ to: v, weight, acessivel });
  } else if (weight < existing.weight) {
    existing.weight = weight;
    existing.acessivel = acessivel;
  }
}

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
