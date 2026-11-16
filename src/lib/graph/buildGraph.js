/**
 * buildGraph.js — constrói o grafo de navegação a partir do FeatureCollection.
 * Suporta corredores (LineString), salas (Polygon), pontos (Point) e conexões verticais (conectaPara).
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
  const pois = [];      // { id, name, tipo, conectaPara, x, y, acessivel, ring }

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
      const pts = geom.coordinates[0]?.slice(0, -1) || [];
      if (pts.length > 0) {
        const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
        const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
        pois.push({
          id: props.id,
          name: props.name,
          tipo: props.tipo,
          conectaPara: props.conectaPara,
          x: cx,
          y: cy,
          acessivel: props.acessivel !== false,
          ring: geom.coordinates[0],
        });
      }
    } else if (geom.type === 'Point') {
      const [px, py] = geom.coordinates;
      pois.push({
        id: props.id,
        name: props.name,
        tipo: props.tipo,
        conectaPara: props.conectaPara,
        x: px,
        y: py,
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
        const jaTem = graph[a.key]?.some((e) => e.to === b.key);
        if (!jaTem) {
          addEdge(graph, a.key, b.key, d, true);
          addEdge(graph, b.key, a.key, d, true);
        }
      }
    }
  }

  // 3. Conecta salas/POIs aos eixos mais próximos
  const roomCenterKey = new Map();
  for (const poi of pois) {
    const centerKey = keyOf({ x: poi.x, y: poi.y });
    if (!graph[centerKey]) graph[centerKey] = [];
    if (poi.id) roomCenterKey.set(poi.id, centerKey);
    poi.nodeKey = centerKey;

    if (corridorNodes.length === 0) continue;

    // Agrupa o nó mais próximo de cada corredor DIFERENTE
    const closestPerCorridor = new Map();
    
    for (const p of corridorNodes) {
      const cId = p.corridorId ?? 0;
      const d = Math.hypot(p.x - poi.x, p.y - poi.y);
      const existing = closestPerCorridor.get(cId);
      if (!existing || d < existing.d) {
        closestPerCorridor.set(cId, { p, d });
      }
    }

    const sortedCorridors = Array.from(closestPerCorridor.values()).sort((a, b) => a.d - b.d);

    let connections = 0;
    for (const item of sortedCorridors) {
      if (item.d < 150) {
        addEdge(graph, centerKey, item.p.key, item.d, poi.acessivel);
        addEdge(graph, item.p.key, centerKey, item.d, poi.acessivel);
        connections++;
        if (connections >= 2) break;
      }
    }
  }

  // 4. Arestas Verticais (Multi-piso: escadas e elevadores via conectaPara)
  const PESO_ARESTA_VERTICAL = 50; // Tempo / esforço para subir/descer andar
  for (const poi of pois) {
    if (!poi.conectaPara) continue;
    const target = pois.find(
      (p) => p.id === poi.conectaPara || (p.name && p.name.trim() === poi.conectaPara.trim())
    );
    if (!target) continue;

    const uKey = poi.nodeKey;
    const vKey = target.nodeKey;
    const ehAcessivel = poi.acessivel && target.acessivel && poi.tipo !== 'escada';

    addEdge(graph, uKey, vKey, PESO_ARESTA_VERTICAL, ehAcessivel, {
      tipo: 'vertical',
      fromId: poi.id,
      toId: target.id,
    });
    addEdge(graph, vKey, uKey, PESO_ARESTA_VERTICAL, ehAcessivel, {
      tipo: 'vertical',
      fromId: target.id,
      toId: poi.id,
    });
  }

  return {
    graph,
    __meta: { roomCenterKey, vertices: [], corridorNodes },
  };
}
