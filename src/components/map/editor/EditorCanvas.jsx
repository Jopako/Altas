/**
 * EditorCanvas — orquestra o MapContainer do editor.
 * Modos: Normal (um bloco) | Mover Bloco (todos, arrasta o ativo) | Global (todos esmaecidos).
 */
import { MapContainer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { MapSetup } from "./MapSetup";
import { InvalidateMapSize } from "../InvalidateMapSize";
import { MapImages } from "./canvas/MapImages";
import { MapFeatures } from "./canvas/MapFeatures";
import { MapReferences } from "./canvas/MapReferences";
import { BlockMover } from "./canvas/BlockMover";
import { MapModeOverlays } from "./canvas/MapModeOverlays";
import { FitBoundsOnMode } from "./canvas/FitBoundsOnMode";
import { computeViewBounds, selectFeaturesToRender, buildImageOverlays } from "./canvas/canvasHelpers";

export function EditorCanvas({ theme, mapData, activeBlockId, poiLargura, selectLayer, isMovingBlock = false, setIsMovingBlock, onBlockMove, ...setupProps }) {
  const isDark = theme === "dark";
  const blockMeta = mapData?.blockMeta || {};
  const isGlobalMode = activeBlockId === "global";
  const activeBlock = !isGlobalMode ? blockMeta[activeBlockId] : null;
  const blockBounds = activeBlock?.bounds;
  const viewBounds = computeViewBounds({ isMovingBlock, isGlobalMode, blockMeta, blockBounds });
  const features = selectFeaturesToRender({ allFeatures: mapData?.features?.features || [], isMovingBlock, isGlobalMode, activeBlockId });
  const imageOverlays = buildImageOverlays({ blockMeta, activeBlockId, isMovingBlock, isGlobalMode, imageUrl: activeBlock?.imageUrl, blockBounds });
  const freeView = isMovingBlock || isGlobalMode;

  return (
    <div className={`h-full w-full relative rounded-2xl sm:rounded-[28px] overflow-hidden border ${isDark ? "border-white/10" : "border-[#1B2F55]/15"}`}>
      <MapModeOverlays isMovingBlock={isMovingBlock} isGlobalMode={isGlobalMode} />
      <MapContainer
        key={`map-${activeBlockId || "empty"}`}
        crs={L.CRS.Simple}
        bounds={viewBounds}
        maxBounds={freeView ? undefined : viewBounds}
        maxBoundsViscosity={0.5}
        doubleClickZoom={false}
        minZoom={-8}
        maxZoom={3}
        zoomSnap={0.25}
        zoomDelta={0.5}
        className="h-full w-full"
        style={{ height: "100%", width: "100%", background: isDark ? "#071427" : "#edf3f9" }}
      >
        <InvalidateMapSize />
        <FitBoundsOnMode bounds={viewBounds} trigger={`${isMovingBlock}-${isGlobalMode}-${activeBlockId}`} />
        <MapImages imageOverlays={imageOverlays} />
        <MapFeatures features={features} featureGroupRef={setupProps.featureGroupRef} activeBlockId={activeBlockId} onSelectLayer={selectLayer} isMovingBlock={isMovingBlock} isGlobalMode={isGlobalMode} />
        <MapReferences blockMeta={blockMeta} activeBlockId={activeBlockId} isMovingBlock={isMovingBlock} />
        {isMovingBlock && blockBounds && (
          <BlockMover blockBounds={blockBounds} activeBlockId={activeBlockId} onBlockMove={onBlockMove} setIsMovingBlock={setIsMovingBlock} />
        )}
        {!isMovingBlock && (
          <MapSetup {...setupProps} mapData={mapData} previewLargura={poiLargura} blockBounds={isGlobalMode ? viewBounds : blockBounds} />
        )}
      </MapContainer>
    </div>
  );
}
