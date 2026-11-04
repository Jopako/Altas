import { FeatureGroup, GeoJSON } from "react-leaflet";
import L from "leaflet";
import { applyDefaultLayerStyle } from "../layerStyles";

/** Renderiza as features (GeoJSON) e aplica as regras de clique por modo. */
export function MapFeatures({
  features,
  featureGroupRef,
  activeBlockId,
  onSelectLayer,
  isMovingBlock,
  isGlobalMode,
}) {
  const featureCollection = { type: "FeatureCollection", features };

  return (
    <FeatureGroup ref={featureGroupRef}>
      <GeoJSON
        key={`geojson-${isMovingBlock ? "all" : activeBlockId}-${features.length}`}
        data={featureCollection}
        onEachFeature={(feature, layer) => {
          applyDefaultLayerStyle(layer);
          if (isMovingBlock) return;

          layer.on("click", (e) => {
            if (e.originalEvent) L.DomEvent.stopPropagation(e.originalEvent);

            const featureBlockId = layer.feature?.properties?.blockId;

            // Modo global: só edita features globais
            if (isGlobalMode && featureBlockId !== "global") return;
            // Modo normal: só edita features do bloco ativo
            if (!isGlobalMode && featureBlockId !== activeBlockId) return;

            onSelectLayer(layer);
          });
        }}
      />
    </FeatureGroup>
  );
}
