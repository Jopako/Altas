/**
 * buildGraph.js — constrói o grafo de navegação a partir do FeatureCollection.
 */
import { densifyLine, keyOf } from './geoMath.js';
import { addEdge } from './graphUtils.js';

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
