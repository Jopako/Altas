/**
 * EditorCanvas — Canvas Leaflet para edição e desenho de pontos de interesse e corredores.
 * Modos:
 *   - Normal: foca em um bloco (imagem + features do bloco)
 *   - Mover Bloco: mostra todos os blocos e permite arrastar o selecionado
 *   - Global: mostra todos os blocos esmaecidos + permite desenhar entre eles
 */
import { useEffect, useRef } from "react";
import { FeatureGroup, GeoJSON, ImageOverlay, MapContainer, Rectangle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { MAP_BOUNDS } from "../../../lib/mapConstants";
import { applyDefaultLayerStyle } from "./layerStyles";
import { MapSetup } from "./MapSetup";
import { InvalidateMapSize } from "../InvalidateMapSize";

/** Calcula bounds que envolvem todos os blocos do workspace */
function computeWorkspaceBounds(blockMeta) {
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

/** Retângulo arrastável do bloco ativo. */
function BlockMover({ blockBounds, activeBlockId, onBlockMove, setIsMovingBlock }) {
  const map = useMap();
  const rectRef = useRef(null);
  const dragState = useRef(null);

  useEffect(() => {
    if (!blockBounds || !rectRef.current) return;

    const layer = rectRef.current;
    const el = layer.getElement?.() || layer._path;
    if (el) {
      el.style.cursor = "move";
      el.style.pointerEvents = "all";
    }

    const onDown = (e) => {
      L.DomEvent.stopPropagation(e);
      L.DomEvent.preventDefault(e);

      map.dragging.disable();
      if (map.scrollWheelZoom) map.scrollWheelZoom.disable();

      const latlng = e.latlng;
      if (!latlng) return;

      dragState.current = {
        startLat: latlng.lat,
        startLng: latlng.lng,
        initialBounds: [
          [blockBounds[0][0], blockBounds[0][1]],
          [blockBounds[1][0], blockBounds[1][1]],
        ],
      };
    };

    const onMove = (e) => {
      if (!dragState.current) return;
      const latlng = e.latlng;
      if (!latlng) return;

      const { startLat, startLng, initialBounds } = dragState.current;
      const dy = latlng.lat - startLat;
      const dx = latlng.lng - startLng;

      layer.setBounds([
        [initialBounds[0][0] + dy, initialBounds[0][1] + dx],
        [initialBounds[1][0] + dy, initialBounds[1][1] + dx],
      ]);
    };

    const onUp = (e) => {
      if (!dragState.current) return;

      const latlng = e.latlng;
      const { startLat, startLng, initialBounds } = dragState.current;
      dragState.current = null;

      map.dragging.enable();
      if (map.scrollWheelZoom) map.scrollWheelZoom.enable();

      if (!latlng) {
        layer.setBounds(initialBounds);
        return;
      }

      const dy = latlng.lat - startLat;
      const dx = latlng.lng - startLng;

      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) {
        layer.setBounds(initialBounds);
        return;
      }

      const success = onBlockMove?.(activeBlockId, dx, dy);
      if (success) {
        setIsMovingBlock?.(false);
      } else {
        layer.setBounds(initialBounds);
      }
    };

    layer.on("mousedown", onDown);
    map.on("mousemove", onMove);
    map.on("mouseup", onUp);

    return () => {
      layer.off("mousedown", onDown);
      map.off("mousemove", onMove);
      map.off("mouseup", onUp);
      map.dragging.enable();
    };
  }, [map, blockBounds, activeBlockId, onBlockMove, setIsMovingBlock]);

  if (!blockBounds) return null;

  return (
    <Rectangle
      ref={rectRef}
      bounds={blockBounds}
      pathOptions={{
        color: "#F59E0B",
        weight: 3,
        dashArray: "10 6",
        fillColor: "#F59E0B",
        fillOpacity: 0.12,
      }}
    />
  );
}

/** Ajusta a view do mapa quando muda de modo ou de bloco */
function FitBoundsOnMode({ bounds, trigger }) {
  const map = useMap();
  useEffect(() => {
    if (!bounds) return;
    const t = setTimeout(() => {
      try {
        map.fitBounds(bounds, { padding: [40, 40], animate: false });
      } catch (_) {}
    }, 50);
    return () => clearTimeout(t);
  }, [map, trigger]);
  return null;
}

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
  isMovingBlock = false,
  setIsMovingBlock,
  onBlockMove,
}) {
  const isDark = theme === "dark";
  const blockMeta = mapData?.blockMeta || {};

  // Três modos: Normal, Mover Bloco, Global
  const isGlobalMode = activeBlockId === "global";
  const activeBlock = !isGlobalMode ? blockMeta[activeBlockId] : null;
  const imageUrl = activeBlock?.imageUrl;
  const blockBounds = activeBlock?.bounds;

  const workspaceBounds = computeWorkspaceBounds(blockMeta);

  // Bounds da view: em mover/global mostra tudo, senão mostra só o bloco
  const viewBounds =
    isMovingBlock || isGlobalMode
      ? workspaceBounds || blockBounds || MAP_BOUNDS
      : blockBounds && Array.isArray(blockBounds) && blockBounds.length === 2
        ? blockBounds
        : MAP_BOUNDS;

  const allFeatures = mapData?.features?.features || [];

  // Features a renderizar
  const featuresToRender =
    isMovingBlock || isGlobalMode
      ? allFeatures // Mover e Global: renderiza TUDO
      : activeBlockId
        ? allFeatures.filter((f) => f.properties?.blockId === activeBlockId)
        : [];

  const featureCollection = {
    type: "FeatureCollection",
    features: featuresToRender,
  };

  // Imagens de fundo a renderizar
  let imageOverlays = [];
  if (isMovingBlock) {
    imageOverlays = Object.entries(blockMeta)
      .filter(([, meta]) => meta?.imageUrl && meta?.bounds)
      .map(([id, meta]) => ({
        id,
        url: meta.imageUrl,
        bounds: meta.bounds,
        opacity: id === activeBlockId ? 1 : 0.55,
        zIndex: id === activeBlockId ? 200 : 100,
      }));
  } else if (isGlobalMode) {
    imageOverlays = Object.entries(blockMeta)
      .filter(([, meta]) => meta?.imageUrl && meta?.bounds)
      .map(([id, meta]) => ({
        id,
        url: meta.imageUrl,
        bounds: meta.bounds,
        opacity: 0.25, // Bem esmaecido, só pra referência
        zIndex: 100,
      }));
  } else if (imageUrl && blockBounds) {
    imageOverlays = [
      {
        id: activeBlockId,
        url: imageUrl,
        bounds: blockBounds,
        opacity: 1,
        zIndex: 200,
      },
    ];
  }

  return (
    <div
      className={`h-full w-full relative rounded-2xl sm:rounded-[28px] overflow-hidden border ${
        isDark ? "border-white/10" : "border-[#1B2F55]/15"
      }`}
    >
      {isMovingBlock && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] px-3 py-1.5 rounded-full bg-[#F59E0B] text-white text-xs font-semibold shadow-lg pointer-events-none">
          Arraste o retângulo laranja do bloco selecionado
        </div>
      )}

      {isGlobalMode && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] px-3 py-1.5 rounded-full bg-blue-600 text-white text-xs font-semibold shadow-lg pointer-events-none">
          Modo Global — Desenhando conexões entre blocos
        </div>
      )}

      <MapContainer
        key={`map-${activeBlockId || "empty"}`}
        crs={L.CRS.Simple}
        bounds={viewBounds}
        maxBounds={isMovingBlock || isGlobalMode ? undefined : viewBounds}
        maxBoundsViscosity={0.5}
        doubleClickZoom={false}
        minZoom={-8}
        maxZoom={3}
        zoomSnap={0.25}
        zoomDelta={0.5}
        className="h-full w-full"
        style={{
          height: "100%",
          width: "100%",
          background: isDark ? "#071427" : "#edf3f9",
        }}
      >
        <InvalidateMapSize />
        <FitBoundsOnMode
          bounds={viewBounds}
          trigger={`${isMovingBlock}-${isGlobalMode}-${activeBlockId}`}
        />

        {imageOverlays.map((img) => (
          <ImageOverlay
            key={`img-${img.id}`}
            url={img.url}
            bounds={img.bounds}
            opacity={img.opacity}
            zIndex={img.zIndex}
          />
        ))}

        <FeatureGroup ref={featureGroupRef}>
          <GeoJSON
            key={`geojson-${isMovingBlock ? "all" : activeBlockId}-${featuresToRender.length}`}
            data={featureCollection}
            onEachFeature={(feature, layer) => {
              applyDefaultLayerStyle(layer);
              if (!isMovingBlock) {
                layer.on("click", (e) => {
                  if (e.originalEvent) L.DomEvent.stopPropagation(e.originalEvent);

                  const featureBlockId = layer.feature?.properties?.blockId;

                  // Em modo global, só deixa editar features globais
                  if (isGlobalMode && featureBlockId !== "global") return;
                  // Em modo normal, só deixa editar features do bloco ativo
                  if (!isGlobalMode && featureBlockId !== activeBlockId) return;

                  selectLayer(layer);
                });
              }
            }}
          />
        </FeatureGroup>

        {/* Referências dos outros blocos ao mover */}
        {isMovingBlock &&
          Object.entries(blockMeta).map(([id, meta]) => {
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
          })}

        {isMovingBlock && blockBounds && (
          <BlockMover
            blockBounds={blockBounds}
            activeBlockId={activeBlockId}
            onBlockMove={onBlockMove}
            setIsMovingBlock={setIsMovingBlock}
          />
        )}

        {!isMovingBlock && (
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
            blockBounds={isGlobalMode ? viewBounds : blockBounds}
          />
        )}
      </MapContainer>
    </div>
  );
}