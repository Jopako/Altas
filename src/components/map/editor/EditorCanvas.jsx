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
  activeBlockId,
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

  // Extrai as informações do bloco ativo
  const activeBlock = mapData?.blockMeta?.[activeBlockId];
  const imageUrl = activeBlock?.imageUrl;
  const blockBounds = activeBlock?.bounds;

  //  Define os limites do mapa dinamicamente: Se tiver bloco, usa o bounds dele. Se não, usa o MAP_BOUNDS.
  const currentBounds = blockBounds && Array.isArray(blockBounds) && blockBounds.length === 2 
    ? blockBounds 
    : MAP_BOUNDS;

  // Filtra as features para mostrar no editor apenas as do bloco ativo
  const allFeatures = mapData?.features?.features || [];
  const featuresToRender = activeBlockId
    ? allFeatures.filter(f => f.properties?.blockId === activeBlockId)
    : [];

  const featureCollection = {
    type: 'FeatureCollection',
    features: featuresToRender
  };

  return (
    <div className={`h-full w-full relative rounded-2xl sm:rounded-[28px] overflow-hidden border ${isDark ? 'border-white/10' : 'border-[#1B2F55]/15'}`}>
      <MapContainer
        //  Força o mapa a recriar quando troca de bloco (evita bugs de cache do Leaflet)
        key={`map-${activeBlockId || 'empty'}`}
        crs={L.CRS.Simple}
        bounds={currentBounds}       // Enquadra no tamanho do bloco
        maxBounds={currentBounds}    // rava o pan no tamanho do bloco
        maxBoundsViscosity={0.5}     
        doubleClickZoom={false}
        minZoom={-6}                 // Aumentado o zoom out pra ver blocos grandes
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
        
        {/* Renderiza a imagem do bloco ativo */}
        {imageUrl && currentBounds && (
          <ImageOverlay url={imageUrl} bounds={currentBounds} />
        )}

        <FeatureGroup ref={featureGroupRef}>
          <GeoJSON
            key={`geojson-${activeBlockId}-${featuresToRender.length}`}
            data={featureCollection}
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
          blockBounds={blockBounds} 
        />
      </MapContainer>
    </div>
  );
}