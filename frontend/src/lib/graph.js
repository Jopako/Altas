// src/lib/graph.js

/**
 * Constrói um grafo a partir de um GeoJSON FeatureCollection.
 * Considera apenas features do tipo LineString (corredores/arestas).
 *
 * Retorna:
 *   {
 *     "lng,lat": {
 *       vizinhos: { "lng2,lat2": { peso, acessivel } },
 *       coords: { lng, lat }
 *     },
 *     ...
 *   }
 */
export function buildGraph(geojson) {
  const graph = {};
  const features = geojson?.features || [];

  function keyOf(lng, lat) {
    return `${lng},${lat}`;
  }

  function ensureNode(lng, lat) {
    const key = keyOf(lng, lat);
    if (!graph[key]) {
      graph[key] = {
        vizinhos: {},
        coords: { lng, lat },
      };
    }
    return key;
  }

  function dist(a, b) {
    const dx = a.lng - b.lng;
    const dy = a.lat - b.lat;
    return Math.sqrt(dx * dx + dy * dy);
  }

  for (const feature of features) {
    const geom = feature?.geometry;
    if (!geom) continue;
    if (geom.type !== 'LineString') continue;

    const acessivel = feature.properties?.acessivel !== false;
    const coords = geom.coordinates || [];

    for (let i = 0; i < coords.length - 1; i++) {
      const [lng1, lat1] = coords[i];
      const [lng2, lat2] = coords[i + 1];

      const k1 = ensureNode(lng1, lat1);
      const k2 = ensureNode(lng2, lat2);

      const peso = dist({ lng: lng1, lat: lat1 }, { lng: lng2, lat: lat2 });

      graph[k1].vizinhos[k2] = { peso, acessivel };
      graph[k2].vizinhos[k1] = { peso, acessivel };
    }
  }

  return graph;
}

/**
 * Retorna a chave do nó mais próximo de um ponto {lng, lat}.
 */
export function nearestNode(graph, { lng, lat }) {
  let bestKey = null;
  let bestDist = Infinity;

  for (const key in graph) {
    const node = graph[key];
    const dx = node.coords.lng - lng;
    const dy = node.coords.lat - lat;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d < bestDist) {
      bestDist = d;
      bestKey = key;
    }
  }

  return bestKey;
}

/**
 * Dijkstra simples sobre o grafo.
 * Retorna { caminho: [chaves], distancia } ou null se não houver caminho.
 *
 * Opções:
 *   somenteAcessivel (bool) — ignora arestas com acessivel === false
 */
export function dijkstra(graph, origem, destino, { somenteAcessivel = false } = {}) {
  if (!origem || !destino) return null;
  if (!graph[origem] || !graph[destino]) return null;
  if (origem === destino) {
    return { caminho: [origem], distancia: 0 };
  }

  const distancias = {};
  const anteriores = {};
  const visitados = new Set();

  for (const key in graph) {
    distancias[key] = Infinity;
    anteriores[key] = null;
  }
  distancias[origem] = 0;

  while (true) {
    let atual = null;
    let menor = Infinity;

    for (const key in distancias) {
      if (visitados.has(key)) continue;
      if (distancias[key] < menor) {
        menor = distancias[key];
        atual = key;
      }
    }

    if (atual === null) break;
    if (atual === destino) break;
    if (menor === Infinity) break;

    visitados.add(atual);

    const vizinhos = graph[atual].vizinhos;
    for (const vizinhoKey in vizinhos) {
      const aresta = vizinhos[vizinhoKey];
      if (somenteAcessivel && aresta.acessivel === false) continue;

      const novaDist = distancias[atual] + aresta.peso;
      if (novaDist < distancias[vizinhoKey]) {
        distancias[vizinhoKey] = novaDist;
        anteriores[vizinhoKey] = atual;
      }
    }
  }

  if (distancias[destino] === Infinity) return null;

  // Reconstrói o caminho
  const caminho = [];
  let atual = destino;
  while (atual) {
    caminho.unshift(atual);
    atual = anteriores[atual];
  }

  return { caminho, distancia: distancias[destino] };
}