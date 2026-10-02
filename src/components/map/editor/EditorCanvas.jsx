/**
 * EditorCanvas — Canvas Leaflet para edição e desenho de pontos de interesse e corredores.
 */
import { FeatureGroup, GeoJSON, ImageOverlay, MapContainer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { MAP_BOUNDS } from "../../../lib/mapConstants";
import { applyDefaultLayerStyle } from "./layerStyles";
import { MapSetup } from "./MapSetup";
import { InvalidateMapSize } from "../InvalidateMapSize";

export function EditorCanvas({
  theme,
  mapData,
  id,
  activeTool,
  featureGroupRef,
  selectedLayerRef,
  selectLayerHandlerRef,
  setActiveTool,
  drawingPoints,
  setDrawingPoints,
  finishPolygonDraft,
  finishPathDraft,
  poiLargura,
  selectLayer,
}) {
  const isDark = theme === 'dark';

  return (
    <div className={`h-full w-full relative rounded-2xl sm:rounded-[28px] overflow-hidden border ${isDark ? 'border-white/10' : 'border-[#1B2F55]/15'}`}>
      <MapContainer
        crs={L.CRS.Simple}
        bounds={MAP_BOUNDS}
        maxBounds={MAP_BOUNDS}
        maxBoundsViscosity={0.8}
        doubleClickZoom={false}
        minZoom={-4}
        maxZoom={3}
        zoomSnap={0.5}
        zoomDelta={0.5}
        className="h-full w-full"
        style={{
          height: '100%',
          width: '100%',
          background: isDark ? '#071427' : '#edf3f9',
        }}
      >
        <InvalidateMapSize />
        <ImageOverlay url={mapData.imageUrl} bounds={MAP_BOUNDS} />
        <FeatureGroup ref={featureGroupRef}>
          <GeoJSON
            key={id}
            data={mapData.features}
            onEachFeature={(_f, layer) => {
              applyDefaultLayerStyle(layer);
              layer.on('click', (e) => {
                if (e.originalEvent) L.DomEvent.stopPropagation(e.originalEvent);
                selectLayer(layer);
              });
            }}
          />
        </FeatureGroup>
        <MapSetup
          activeTool={activeTool}
          featureGroupRef={featureGroupRef}
          selectedLayerRef={selectedLayerRef}
          selectLayerHandlerRef={selectLayerHandlerRef}
          setActiveTool={setActiveTool}
          drawingPoints={drawingPoints}
          setDrawingPoints={setDrawingPoints}
          finishPolygonDraft={finishPolygonDraft}
          finishPathDraft={finishPathDraft}
          mapData={mapData}
          previewLargura={poiLargura}
        />
      </MapContainer>
    </div>
  );
}
