import { MAP_BOUNDS } from "../../../../lib/mapConstants";

/** Calcula bounds que envolvem todos os blocos do workspace */
export function computeWorkspaceBounds(blockMeta) {
  if (!blockMeta) return null;
  let minY = Infinity, minX = Infinity, maxY = -Infinity, maxX = -Infinity;
  let hasAny = false;
  for (const meta of Object.values(blockMeta)) {
    const b = meta?.bounds;
    if (!b || !Array.isArray(b) || b.length !== 2) continue;
    hasAny = true;
    minY = Math.min(minY, b[0][0], b[1][0]);
    minX = Math.min(minX, b[0][1], b[1][1]);
    maxY = Math.max(maxY, b[0][0], b[1][0]);
    maxX = Math.max(maxX, b[0][1], b[1][1]);
  }
  if (!hasAny) return null;
  const pad = 200;
  return [
    [minY - pad, minX - pad],
    [maxY + pad, maxX + pad],
  ];
}

/** Bounds da view: em mover/global mostra tudo, senão só o bloco ativo */
export function computeViewBounds({ isMovingBlock, isGlobalMode, blockMeta, blockBounds }) {
  if (isMovingBlock || isGlobalMode) {
    return computeWorkspaceBounds(blockMeta) || blockBounds || MAP_BOUNDS;
  }
  return Array.isArray(blockBounds) && blockBounds.length === 2 ? blockBounds : MAP_BOUNDS;
}

/** Features a renderizar conforme o modo */
export function selectFeaturesToRender({ allFeatures, isMovingBlock, isGlobalMode, activeBlockId }) {
  if (isMovingBlock || isGlobalMode) return allFeatures;
  if (!activeBlockId) return [];
  return allFeatures.filter((f) => f.properties?.blockId === activeBlockId);
}

/** Lista de imagens de fundo (com opacidade/zIndex) conforme o modo */
export function buildImageOverlays({ blockMeta, activeBlockId, isMovingBlock, isGlobalMode, imageUrl, blockBounds }) {
  const withImage = () =>
    Object.entries(blockMeta).filter(([, meta]) => meta?.imageUrl && meta?.bounds);

  if (isMovingBlock) {
    return withImage().map(([id, meta]) => ({
      id,
      url: meta.imageUrl,
      bounds: meta.bounds,
      opacity: id === activeBlockId ? 1 : 0.55,
      zIndex: id === activeBlockId ? 200 : 100,
    }));
  }
  if (isGlobalMode) {
    return withImage().map(([id, meta]) => ({
      id,
      url: meta.imageUrl,
      bounds: meta.bounds,
      opacity: 0.25, // bem esmaecido, só referência
      zIndex: 100,
    }));
  }
  if (imageUrl && blockBounds) {
    return [{ id: activeBlockId, url: imageUrl, bounds: blockBounds, opacity: 1, zIndex: 200 }];
  }
  return [];
}
