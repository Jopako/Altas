import { useState, useRef, useEffect } from "react";
import L from "leaflet";
import { areaShapeOptions, pathShapeOptions } from "../../components/map/editor/layerStyles";

export function useDrawingTools(selectedBlockId, featureGroupRef, selectLayer) {
  const [activeTool, setActiveTool] = useState('select');
  const [drawingPoints, setDrawingPoints] = useState([]);
  const drawingPointsRef = useRef([]);

  useEffect(() => {
    drawingPointsRef.current = drawingPoints;
  }, [drawingPoints]);

  function selectMappingTool(tool) {
    if (tool !== 'polygon' && tool !== 'path') setDrawingPoints([]);
    setActiveTool(tool);
  }

  function finishPolygonDraft() {
    const points = drawingPointsRef.current;
    if (!featureGroupRef.current || points.length < 3 || !selectedBlockId) return;
    
    const polygon = L.polygon(points, areaShapeOptions);
    const poiId = `f-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    polygon.feature = {
      type: 'Feature',
      properties: { id: poiId, kind: 'area', blockId: selectedBlockId, tipo: 'sala', name: '', gallery: [], acessivel: true },
    };
    
    featureGroupRef.current.addLayer(polygon);
    polygon.on('click', (e) => {
      if (e.originalEvent) L.DomEvent.stopPropagation(e.originalEvent);
      selectLayer(polygon);
    });
    
    selectLayer(polygon);
    setDrawingPoints([]);
    setActiveTool('select');
  }

  function finishPathDraft() {
    const points = drawingPointsRef.current;
    if (!featureGroupRef.current || !selectedBlockId) return;
    
    const cleaned = points.filter(
      (pt, i) => i === 0 || pt.lat !== points[i - 1].lat || pt.lng !== points[i - 1].lng
    );
    if (cleaned.length < 2) return;
    
    const polyline = L.polyline(cleaned, pathShapeOptions);
    const edgeId = `edge-${Date.now()}`;
    polyline.feature = {
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: cleaned.map((p) => [p.lng, p.lat]) },
      properties: { id: edgeId, kind: 'edge', blockId: selectedBlockId, acessivel: true, largura: 60 },
    };
    
    featureGroupRef.current.addLayer(polyline);
    polyline.on('click', (e) => {
      if (e.originalEvent) L.DomEvent.stopPropagation(e.originalEvent);
      selectLayer(polyline);
    });
    
    selectLayer(polyline);
    setDrawingPoints([]);
    setActiveTool('select');
  }

  return {
    activeTool, setActiveTool,
    drawingPoints, setDrawingPoints,
    selectMappingTool, finishPolygonDraft, finishPathDraft
  };
}