import { Rectangle } from "react-leaflet";

/** Retângulos tracejados dos OUTROS blocos (só no modo "Mover Bloco"). */
export function MapReferences({ blockMeta, activeBlockId, isMovingBlock }) {
  if (!isMovingBlock) return null;

  return Object.entries(blockMeta).map(([id, meta]) => {
    if (id === activeBlockId || !meta?.bounds) return null;
    return (
      <Rectangle
        key={`ref-${id}`}
        bounds={meta.bounds}
        pathOptions={{
          color: "#94a3b8",
          weight: 1,
          dashArray: "4 4",
          fillOpacity: 0.04,
          interactive: false,
        }}
      />
    );
  });
}
