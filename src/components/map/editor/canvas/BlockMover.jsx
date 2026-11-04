import { useEffect, useRef } from "react";
import { Rectangle, useMap } from "react-leaflet";
import L from "leaflet";

/** Retângulo arrastável do bloco ativo. */
export function BlockMover({ blockBounds, activeBlockId, onBlockMove, setIsMovingBlock }) {
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
