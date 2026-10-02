/**
 * draftRender — Gerencia a renderização de marcadores e pré-visualizações durante o desenho no mapa.
 */
import L from "leaflet";
import { areaShapeOptions, pathShapeOptions } from "./layerStyles";
import { lineStringToPolygon } from "../../../lib/graph";

export function createDraftRenderer(map) {
  let tempPolygon = null;
  let tempPath = null;
  let tempMarkers = [];
  let previewLayer = null;

  function clearTempDraft() {
    if (tempPolygon) {
      map.removeLayer(tempPolygon);
      tempPolygon = null;
    }
    if (tempPath) {
      map.removeLayer(tempPath);
      tempPath = null;
    }
    tempMarkers.forEach((m) => map.removeLayer(m));
    tempMarkers = [];
  }

  function renderTempMarkers(points) {
    tempMarkers.forEach((m) => map.removeLayer(m));
    tempMarkers = points.map((point, index) =>
      L.marker(point, {
        interactive: false,
        keyboard: false,
        icon: L.divIcon({
          className: '',
          html: `<div style="width:18px;height:18px;border-radius:999px;border:2px solid #fff;background:#0ea5e9;display:grid;place-items:center;color:#fff;font-size:10px;font-weight:700;">${index + 1}</div>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        }),
      }).addTo(map)
    );
  }

  function renderTempPolygon(points) {
    clearTempDraft();
    if (points.length < 2) {
      if (points.length === 1) renderTempMarkers(points);
      return;
    }
    renderTempMarkers(points);
    tempPolygon = L.polygon(points, {
      ...areaShapeOptions,
      fillOpacity: 0.12,
      dashArray: '6 8',
      interactive: false,
    }).addTo(map);
  }

  function renderTempPath(points) {
    clearTempDraft();
    if (points.length < 1) return;
    renderTempMarkers(points);
    if (points.length >= 2) {
      tempPath = L.polyline(points, {
        ...pathShapeOptions,
        interactive: false,
      }).addTo(map);
    }
  }

  function updatePreview(layer, largura) {
    if (previewLayer) {
      map.removeLayer(previewLayer);
      previewLayer = null;
    }
    if (!layer || !largura) return;

    const latlngs = layer.getLatLngs();
    if (!latlngs || latlngs.length < 2) return;

    const coords = latlngs.map((p) => [p.lng, p.lat]);
    const poly = lineStringToPolygon(coords, largura / 2);
    if (!poly) return;

    previewLayer = L.polygon(
      poly.coordinates[0].map(([x, y]) => [y, x]),
      {
        color: '#2563eb',
        weight: 1.5,
        opacity: 0.6,
        fillColor: '#2563eb',
        fillOpacity: 0.18,
        interactive: false,
      }
    ).addTo(map);
  }

  function cleanup() {
    clearTempDraft();
    if (previewLayer) {
      map.removeLayer(previewLayer);
      previewLayer = null;
    }
  }

  return {
    clearTempDraft,
    renderTempMarkers,
    renderTempPolygon,
    renderTempPath,
    updatePreview,
    cleanup,
  };
}
