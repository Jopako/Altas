/**
 * MapSetup — Configura controles Leaflet Draw e manipuladores de desenho no mapa.
 * Draw Control usado apenas para edit/delete; desenho de ponto, área e corredor é manual.
 */
import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-draw";
import { getLayerKind, applyDefaultLayerStyle } from "./layerStyles";
import { findClosestSnapVertex, snapToNearby, getExistingVertices } from "./snap";
import { MAP_BOUNDS } from "../../../lib/mapConstants";
import { createSnapIndicatorManager } from "./snapIndicator";
import { createDraftRenderer } from "./draftRender";

export function MapSetup({
  activeTool,
  featureGroupRef,
  selectedLayerRef,
  selectLayerHandlerRef,
  setActiveTool,
  drawingPoints,
  setDrawingPoints,
  finishPolygonDraft,
  finishPathDraft,
  mapData,
  previewLargura,
}) {
  const map = useMap();
  const snapManagerRef = useRef(null);
  const draftRendererRef = useRef(null);

  if (!snapManagerRef.current && map) {
    snapManagerRef.current = createSnapIndicatorManager(map);
  }
  if (!draftRendererRef.current && map) {
    draftRendererRef.current = createDraftRenderer(map);
  }

  useEffect(() => {
    if (!map || !featureGroupRef.current) return;
    const drawnItems = featureGroupRef.current;
    const stopLayerClick = (event) => {
      if (event.originalEvent) L.DomEvent.stopPropagation(event.originalEvent);
    };
    const attachLayerSelection = (layer) => {
      layer.off('click');
      layer.on('click', (event) => {
        stopLayerClick(event);
        selectLayerHandlerRef.current(layer);
      });
    };
    const createMappedLayer = (layer) => {
      const poiId = `poi-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      applyDefaultLayerStyle(layer);
      layer.feature = {
        type: 'Feature',
        properties: { id: poiId, kind: getLayerKind(layer), tipo: 'sala', name: '', description: '', photoUrl: '', acessivel: true },
      };
      drawnItems.addLayer(layer);
      attachLayerSelection(layer);
      selectLayerHandlerRef.current(layer);
    };
    const editControl = new L.Control.Draw({
      edit: { featureGroup: drawnItems },
      draw: false,
    });
    map.addControl(editControl);
    const onCreated = (event) => {
      createMappedLayer(event.layer);
      setActiveTool('select');
    };
    const onDeleted = (event) => {
      event.layers.eachLayer((layer) => {
        if (selectedLayerRef.current === layer) selectedLayerRef.current = null;
      });
    };
    map.on(L.Draw.Event.CREATED, onCreated);
    map.on(L.Draw.Event.DELETED, onDeleted);
    return () => {
      map.off(L.Draw.Event.CREATED, onCreated);
      map.off(L.Draw.Event.DELETED, onDeleted);
      map.removeControl(editControl);
    };
  }, [map, featureGroupRef, selectedLayerRef, selectLayerHandlerRef, setActiveTool]);

  useEffect(() => {
    if (!map || !featureGroupRef.current) return;
    const imageBounds = L.latLngBounds(MAP_BOUNDS);
    const isSnappable = activeTool === 'point' || activeTool === 'path';
    map.getContainer().style.cursor = activeTool === 'select' ? '' : 'crosshair';

    const snap = snapManagerRef.current;
    const draft = draftRendererRef.current;

    const onMouseMove = (event) => {
      if (!isSnappable || !imageBounds.contains(event.latlng)) return snap.clearSnapIndicator();
      const existing = getExistingVertices(featureGroupRef.current, mapData?.features);
      snap.updateSnapIndicator(findClosestSnapVertex(event.latlng, existing, 15));
    };
    if (isSnappable) {
      map.on('mousemove', onMouseMove);
      map.on('mouseout', snap.clearSnapIndicator);
    }

    const createPointOnClick = (event) => {
      if (!imageBounds.contains(event.latlng)) return;
      const existing = getExistingVertices(featureGroupRef.current, mapData?.features);
      const snapped = snapToNearby(event.latlng, existing, 15);
      snap.clearSnapIndicator();
      map.fire(L.Draw.Event.CREATED, { layer: L.marker(snapped), layerType: 'marker' });
    };
    if (activeTool === 'point') map.on('click', createPointOnClick);

    if (activeTool === 'polygon') {
      const onClick = (e) => {
        if (imageBounds.contains(e.latlng)) setDrawingPoints((prev) => [...prev, e.latlng]);
      };
      const onDblClick = () => finishPolygonDraft();
      map.on('click', onClick);
      map.on('dblclick', onDblClick);
      return () => {
        map.off('click', onClick);
        map.off('dblclick', onDblClick);
        if (isSnappable) {
          map.off('mousemove', onMouseMove);
          map.off('mouseout', snap.clearSnapIndicator);
        }
        snap.clearSnapIndicator();
        draft.clearTempDraft();
      };
    }

    if (activeTool === 'path') {
      const onClick = (e) => {
        if (!imageBounds.contains(e.latlng)) return;
        const existing = getExistingVertices(featureGroupRef.current, mapData?.features);
        setDrawingPoints((prev) => [...prev, snapToNearby(e.latlng, existing, 15)]);
      };
      const onDblClick = () => {
        snap.clearSnapIndicator();
        finishPathDraft();
      };
      map.on('click', onClick);
      map.on('dblclick', onDblClick);
      return () => {
        map.off('click', onClick);
        map.off('dblclick', onDblClick);
        if (isSnappable) {
          map.off('mousemove', onMouseMove);
          map.off('mouseout', snap.clearSnapIndicator);
        }
        snap.clearSnapIndicator();
        draft.clearTempDraft();
      };
    }

    return () => {
      map.off('click', createPointOnClick);
      if (isSnappable) {
        map.off('mousemove', onMouseMove);
        map.off('mouseout', snap.clearSnapIndicator);
      }
      snap.clearSnapIndicator();
      map.getContainer().style.cursor = '';
    };
  }, [activeTool, featureGroupRef, finishPolygonDraft, finishPathDraft, map, mapData, setDrawingPoints]);

  useEffect(() => {
    const draft = draftRendererRef.current;
    if (!draft) return;
    if (activeTool === 'polygon') draft.renderTempPolygon(drawingPoints);
    else if (activeTool === 'path') draft.renderTempPath(drawingPoints);
    else draft.clearTempDraft();
  }, [activeTool, drawingPoints, map]);

  useEffect(() => {
    const snap = snapManagerRef.current;
    const draft = draftRendererRef.current;
    if (activeTool !== 'polygon' && activeTool !== 'path') {
      draft?.clearTempDraft();
      setDrawingPoints([]);
    }
    if (activeTool !== 'point' && activeTool !== 'path') snap?.clearSnapIndicator();
  }, [activeTool, setDrawingPoints]);

  useEffect(() => {
    const layer = selectedLayerRef.current;
    const draft = draftRendererRef.current;
    if (!layer || getLayerKind(layer) !== 'edge') {
      draft?.updatePreview(null, null);
      return;
    }
    draft?.updatePreview(layer, previewLargura);
  }, [previewLargura, map, selectedLayerRef]);

  return null;
}
