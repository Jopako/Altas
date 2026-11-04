import { Fragment } from 'react';
import { ImageOverlay, Rectangle } from 'react-leaflet';
import L from 'leaflet';

export function MapBlocks({ blockMeta, blocoAtivo, isRoutePanelOpen, onBlocoClick }) {
  return Object.entries(blockMeta).map(([blockId, meta]) => {
    if (!meta?.bounds || !Array.isArray(meta.bounds) || meta.bounds.length !== 2) return null;
    const bounds = meta.bounds;
    if (!Array.isArray(bounds[0]) || !Array.isArray(bounds[1])) return null;

    const leafletBounds = L.latLngBounds([bounds[0][0], bounds[0][1]], [bounds[1][0], bounds[1][1]]);
    if (!leafletBounds.isValid()) return null;

    const isAtivo = blocoAtivo === blockId;
    const mostrarImagem = !blocoAtivo || isAtivo;
    const isInteractive = !isRoutePanelOpen && blocoAtivo !== blockId;

    return (
      <Fragment key={`bloco-${blockId}-${meta.name}`}>
        {meta.imageUrl && mostrarImagem && (
          <ImageOverlay url={meta.imageUrl} bounds={leafletBounds} opacity={1} />
        )}

        {isInteractive && (
          <Rectangle
            key={`rect-${blockId}-${isRoutePanelOpen}-${blocoAtivo}`} 
            bounds={leafletBounds}
            pathOptions={{
              color: 'transparent',
              fillColor: 'transparent',
              fillOpacity: 0,
              interactive: true,
            }}
            eventHandlers={{
              click: (e) => {
                if (e.originalEvent) {
                  L.DomEvent.stopPropagation(e.originalEvent);
                }
                if (onBlocoClick) onBlocoClick(blockId);
              },
            }}
          />
        )}
      </Fragment>
    );
  });
}