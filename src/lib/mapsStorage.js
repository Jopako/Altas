/**
 * mapsStorage — Persistência local dos mapas (localStorage).
 * Único I/O dos mapas; pages não falam com localStorage.
 * Trocar o corpo destas funções por chamadas HTTP no futuro,
 * sem mudar o shape { id, name, imageUrl, features, createdAt }.
 */

export const LS_KEY = 'altas_maps';

export function loadMaps() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveMaps(maps) {
  localStorage.setItem(LS_KEY, JSON.stringify(maps));
}

export function getMapById(id) {
  return loadMaps().find((m) => m.id === id) || null;
}

export function createMap(novoMapa) {
  const atualizado = [...loadMaps(), novoMapa];
  saveMaps(atualizado);
  return atualizado;
}

export function deleteMap(id) {
  const atualizado = loadMaps().filter((m) => m.id !== id);
  saveMaps(atualizado);
  return atualizado;
}

export function updateMapFeatures(id, featureCollection) {
  const maps = loadMaps();
  const idx = maps.findIndex((m) => m.id === id);
  if (idx === -1) return null;
  maps[idx] = { ...maps[idx], features: featureCollection };
  saveMaps(maps);
  return maps[idx];
}
