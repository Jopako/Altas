/**
 * dijkstra.js — menor caminho no grafo.
 */

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
