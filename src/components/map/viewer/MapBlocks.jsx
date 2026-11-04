import { Fragment } from 'react';
import { ImageOverlay, Rectangle } from 'react-leaflet';
import L from 'leaflet';

/** Imagens dos blocos + retângulos clicáveis (só com o painel de rotas fechado). */
export function MapBlocks({ blockMeta, blocoAtivo, isRoutePanelOpen, onBlocoClick }) {
  return Object.entries(blockMeta).map(([blockId, meta]) => {
    if (!meta?.bounds || !Array.isArray(meta.bounds) || meta.bounds.length !== 2) return null;
    const bounds = meta.bounds;
    if (!Array.isArray(bounds[0]) || !Array.isArray(bounds[1])) return null;

    const leafletBounds = L.latLngBounds([bounds[0][0], bounds[0][1]], [bounds[1][0], bounds[1][1]]);
    if (!leafletBounds.isValid()) return null;

    const isAtivo = blocoAtivo === blockId;
    const mostrarImagem = !blocoAtivo || isAtivo;

    return (
      <Fragment key={`bloco-${blockId}-${meta.name}`}>
        {/* Imagem só do bloco ativo (ou de todos se não tiver nenhum ativo) */}
        {meta.imageUrl && mostrarImagem && (
          <ImageOverlay url={meta.imageUrl} bounds={leafletBounds} opacity={1} />
        )}
        <Rectangle
          key={`rect-${blockId}-${isRoutePanelOpen}`} 
          bounds={leafletBounds}
          pathOptions={{
            color: 'transparent',
            fillColor: 'transparent',
            fillOpacity: 0.05,
            interactive: !isRoutePanelOpen,
          }}
          eventHandlers={{
            click: () => {
              // Trava de segurança: se o painel tiver aberto, aborta o clique
              if (isRoutePanelOpen) return;
              if (blockId !== blocoAtivo && onBlocoClick) onBlocoClick(blockId);
            },
          }}
        />
      </Fragment>
    );
  });
}