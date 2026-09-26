import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ImageOverlay, MapContainer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";

// Patch Leaflet.Draw
if (typeof L !== "undefined" && L.Draw && L.Draw.Polyline) {
  const originalOnMouseDown = L.Draw.Polyline.prototype._onMouseDown;
  L.Draw.Polyline.prototype._onMouseDown = function (e) {
    if (this._lastTouchTime && Date.now() - this._lastTouchTime < 600) return;
    originalOnMouseDown.call(this, e);
  };
  const originalOnTouch = L.Draw.Polyline.prototype._onTouch;
  L.Draw.Polyline.prototype._onTouch = function (e) {
    this._lastTouchTime = Date.now();
    originalOnTouch.call(this, e);
  };
}

import { PageLayout, PageHeader, useTheme } from "../components/PageLayout";

const bounds = [
  [0, 0],
  [1000, 1000],
];

function decodeToken(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

// ----- Estilos das camadas -----
const areaShapeOptions = {
  color: "#00d4ff",
  weight: 3,
  opacity: 0.95,
  fillColor: "#00d4ff",
  fillOpacity: 0.22,
};

const selectedShapeOptions = {
  color: "#ffcc00",
  weight: 4,
  opacity: 1,
  fillColor: "#ffcc00",
  fillOpacity: 0.28,
};

const pathShapeOptions = {
  color: "#2563eb",
  weight: 4,
  opacity: 0.9,
  dashArray: "6 8",
};

const selectedPathShapeOptions = {
  color: "#ffcc00",
  weight: 5,
  opacity: 1,
  dashArray: "6 8",
};

const shellOuterClasses = (theme) =>
  theme === "dark"
    ? "bg-[radial-gradient(circle_at_top,rgba(74,127,212,0.14),transparent_42%),linear-gradient(180deg,#071427_0%,#0b1830_55%,#071427_100%)] text-white"
    : "bg-transparent text-[#1B2F55]";

const panelClasses = (theme) =>
  theme === "dark"
    ? "bg-[#0b1830]/85 border-white/10 shadow-[0_18px_50px_rgba(0,0,0,0.24)] backdrop-blur-xl"
    : "bg-[#f1f6fb] border-[#1B2F55]/10 shadow-[0_16px_40px_rgba(27,47,85,0.08)] backdrop-blur-xl";

const inputClasses = (theme) =>
  `w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors ${
    theme === "dark"
      ? "bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-[#4A7FD4]"
      : "bg-white border-[#1B2F55]/15 text-[#1B2F55] placeholder:text-[#1B2F55]/35 focus:border-[#4A7FD4]"
  }`;

// ----- Helpers de camada -----
function getLayerKind(layer) {
  if (layer instanceof L.Marker) return "point";
  if (layer.feature?.properties?.kind === "edge" || layer.feature?.geometry?.type === "LineString") {
    return "edge";
  }
  if (layer instanceof L.Polyline && !(layer instanceof L.Polygon)) {
    return "edge";
  }
  return "area";
}

function applyDefaultLayerStyle(layer) {
  if (typeof layer.setStyle === "function") {
    if (getLayerKind(layer) === "edge") layer.setStyle(pathShapeOptions);
    else layer.setStyle(areaShapeOptions);
  }
}

function applySelectedLayerStyle(layer) {
  if (typeof layer.setStyle === "function") {
    if (getLayerKind(layer) === "edge") layer.setStyle(selectedPathShapeOptions);
    else layer.setStyle(selectedShapeOptions);
  }
}

function findClosestSnapVertex(latlng, existingVertices, tolerance = 15) {
  if (!latlng || !existingVertices || existingVertices.length === 0) return null;
  let closestVertex = null;
  let minDistance = Infinity;
  for (const vertex of existingVertices) {
    const dx = latlng.lng - vertex.lng;
    const dy = latlng.lat - vertex.lat;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist <= tolerance && dist < minDistance) {
      minDistance = dist;
      closestVertex = vertex;
    }
  }
  return closestVertex ? L.latLng(closestVertex.lat, closestVertex.lng) : null;
}

function snapToNearby(latlng, existingVertices, tolerance = 15) {
  const closest = findClosestSnapVertex(latlng, existingVertices, tolerance);
  return closest || latlng;
}

function getExistingVertices(featureGroup, mapFeatures) {
  const vertices = [];
  const seen = new Set();
  function addVertex(lat, lng) {
    if (typeof lat !== "number" || typeof lng !== "number" || Number.isNaN(lat) || Number.isNaN(lng)) return;
    const key = `${lat.toFixed(6)},${lng.toFixed(6)}`;
    if (!seen.has(key)) {
      seen.add(key);
      vertices.push(L.latLng(lat, lng));
    }
  }
  if (mapFeatures?.features && Array.isArray(mapFeatures.features)) {
    mapFeatures.features.forEach((feat) => {
      const geom = feat?.geometry;
      if (!geom) return;
      if (geom.type === "Point" && Array.isArray(geom.coordinates)) {
        addVertex(geom.coordinates[1], geom.coordinates[0]);
      } else if (geom.type === "LineString" && Array.isArray(geom.coordinates)) {
        geom.coordinates.forEach((coord) => {
          if (Array.isArray(coord)) addVertex(coord[1], coord[0]);
        });
      }
    });
  }
  if (featureGroup && typeof featureGroup.eachLayer === "function") {
    function inspectLayer(layer) {
      if (typeof layer.eachLayer === "function") {
        layer.eachLayer(inspectLayer);
        return;
      }
      if (layer instanceof L.Marker) {
        const ll = layer.getLatLng();
        addVertex(ll.lat, ll.lng);
      } else if (layer instanceof L.Polyline && !(layer instanceof L.Polygon)) {
        const latlngs = layer.getLatLngs();
        const flat = Array.isArray(latlngs[0]) ? latlngs.flat(Infinity) : latlngs;
        flat.forEach((pt) => {
          if (pt && typeof pt.lat === "number" && typeof pt.lng === "number") {
            addVertex(pt.lat, pt.lng);
          }
        });
      }
    }
    featureGroup.eachLayer(inspectLayer);
  }
  return vertices;
}

// ----- Componente de setup do mapa -----
function MapSetup({
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
}) {
  const map = useMap();
  const tempPolygonRef = useRef(null);
  const tempPathRef = useRef(null);
  const tempMarkersRef = useRef([]);
  const snapMarkerRef = useRef(null);

  // -----------------------------------------------------------------
  // 1) Cria o L.FeatureGroup() imperativo, adiciona ao mapa e guarda no ref.
  //    Isso substitui o <FeatureGroup> do react-leaflet, que perdia os layers
  //    adicionados via .addLayer() a cada re-render.
  // -----------------------------------------------------------------
  useEffect(() => {
    if (!map || featureGroupRef.current) return;

    const group = L.featureGroup().addTo(map);
    featureGroupRef.current = group;

    return () => {
      if (featureGroupRef.current) {
        map.removeLayer(featureGroupRef.current);
        featureGroupRef.current = null;
      }
    };
  }, [map, featureGroupRef]);

  // -----------------------------------------------------------------
  // 2) Popula o featureGroup com as features do banco.
  //    Antes isso era um <GeoJSON> do react-leaflet dentro do <FeatureGroup>.
  //    Agora é feito imperativamente, com o mesmo handler de clique.
  // -----------------------------------------------------------------
  useEffect(() => {
    const group = featureGroupRef.current;
    if (!map || !group) return;

    // Limpa layers "do banco" antigos (marca com _fromBank pra não apagar os criados no editor)
    group.eachLayer((layer) => {
      if (layer._fromBank) group.removeLayer(layer);
    });

    if (!mapData?.features) return;

    const geoLayer = L.geoJSON(mapData.features, {
      onEachFeature: (_feature, layer) => {
        applyDefaultLayerStyle(layer);
        layer.on("click", (event) => {
          if (event.originalEvent) L.DomEvent.stopPropagation(event.originalEvent);
          selectLayerHandlerRef.current(layer);
        });
      },
    });

    // Marca cada sub-layer como vindo do banco
    geoLayer.eachLayer((layer) => {
      layer._fromBank = true;
    });

    group.addLayer(geoLayer);
  }, [map, mapData, featureGroupRef, selectLayerHandlerRef]);

  function clearSnapIndicator() {
    if (snapMarkerRef.current) {
      map.removeLayer(snapMarkerRef.current);
      snapMarkerRef.current = null;
    }
  }

  function updateSnapIndicator(targetLatLng) {
    if (!targetLatLng) {
      clearSnapIndicator();
      return;
    }
    if (!snapMarkerRef.current) {
      snapMarkerRef.current = L.circleMarker(targetLatLng, {
        radius: 8,
        color: "#f59e0b",
        weight: 2.5,
        fillColor: "#fbbf24",
        fillOpacity: 0.9,
        interactive: false,
      }).addTo(map);
    } else {
      snapMarkerRef.current.setLatLng(targetLatLng);
    }
  }

  function clearTempDraft() {
    if (tempPolygonRef.current) {
      map.removeLayer(tempPolygonRef.current);
      tempPolygonRef.current = null;
    }
    if (tempPathRef.current) {
      map.removeLayer(tempPathRef.current);
      tempPathRef.current = null;
    }
    tempMarkersRef.current.forEach((marker) => map.removeLayer(marker));
    tempMarkersRef.current = [];
  }

  function renderTempMarkers(points) {
    tempMarkersRef.current.forEach((marker) => map.removeLayer(marker));
    tempMarkersRef.current = points.map((point, index) =>
      L.marker(point, {
        interactive: false,
        keyboard: false,
        icon: L.divIcon({
          className: "",
          html: `
            <div style="
              width: 18px;
              height: 18px;
              border-radius: 999px;
              border: 2px solid #ffffff;
              background: #0ea5e9;
              box-shadow: 0 2px 10px rgba(0,0,0,0.35);
              display: grid;
              place-items: center;
              color: white;
              font-size: 10px;
              font-weight: 700;
              line-height: 1;
            ">${index + 1}</div>
          `,
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
    tempPolygonRef.current = L.polygon(points, {
      ...areaShapeOptions,
      fillOpacity: 0.12,
      dashArray: "6 8",
      interactive: false,
    }).addTo(map);
  }

  function renderTempPath(points) {
    clearTempDraft();
    if (points.length < 1) return;
    renderTempMarkers(points);
    if (points.length >= 2) {
      tempPathRef.current = L.polyline(points, {
        ...pathShapeOptions,
        interactive: false,
      }).addTo(map);
    }
  }

  // ----- Controle do Leaflet.Draw (edit + created + deleted) -----
  useEffect(() => {
    if (!map || !featureGroupRef.current) return;

    const drawnItems = featureGroupRef.current;

    const stopLayerClick = (event) => {
      if (event.originalEvent) L.DomEvent.stopPropagation(event.originalEvent);
    };

    const attachLayerSelection = (layer) => {
      layer.off("click");
      layer.on("click", (event) => {
        stopLayerClick(event);
        selectLayerHandlerRef.current(layer);
      });
    };

    const createMappedLayer = (layer) => {
      const poiId = `poi-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      applyDefaultLayerStyle(layer);
      layer.feature = {
        type: "Feature",
        properties: {
          id: poiId,
          kind: getLayerKind(layer),
          name: "",
          description: "",
          photoUrl: "",
        },
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
      setActiveTool("select");
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

  // ----- Ferramentas (point / polygon / path) -----
  useEffect(() => {
    if (!map || !featureGroupRef.current) return;

    const imageBounds = L.latLngBounds(bounds);
    const isSnappableTool = activeTool === "point" || activeTool === "path";

    map.getContainer().style.cursor = activeTool === "select" ? "" : "crosshair";

    const onMouseMove = (event) => {
      if (!isSnappableTool || !imageBounds.contains(event.latlng)) {
        clearSnapIndicator();
        return;
      }
      const existingVertices = getExistingVertices(featureGroupRef.current, mapData?.features);
      const snapped = findClosestSnapVertex(event.latlng, existingVertices, 15);
      updateSnapIndicator(snapped);
    };

    const onMouseOut = () => clearSnapIndicator();

    if (isSnappableTool) {
      map.on("mousemove", onMouseMove);
      map.on("mouseout", onMouseOut);
    }

    const createPointOnClick = (event) => {
      if (!imageBounds.contains(event.latlng)) return;
      const existingVertices = getExistingVertices(featureGroupRef.current, mapData?.features);
      const snappedLatLng = snapToNearby(event.latlng, existingVertices, 15);
      clearSnapIndicator();
      map.fire(L.Draw.Event.CREATED, {
        layer: L.marker(snappedLatLng),
        layerType: "marker",
      });
    };

    if (activeTool === "point") {
      map.on("click", createPointOnClick);
    }

    if (activeTool === "polygon") {
      const onPolygonClick = (event) => {
        if (!imageBounds.contains(event.latlng)) return;
        setDrawingPoints((prev) => [...prev, event.latlng]);
      };
      const onPolygonDoubleClick = () => finishPolygonDraft();

      map.on("click", onPolygonClick);
      map.on("dblclick", onPolygonDoubleClick);

      return () => {
        map.off("click", onPolygonClick);
        map.off("dblclick", onPolygonDoubleClick);
        if (isSnappableTool) {
          map.off("mousemove", onMouseMove);
          map.off("mouseout", onMouseOut);
        }
        clearSnapIndicator();
        clearTempDraft();
      };
    }

    if (activeTool === "path") {
      const onPathClick = (event) => {
        if (!imageBounds.contains(event.latlng)) return;
        const existingVertices = getExistingVertices(featureGroupRef.current, mapData?.features);
        const snappedLatLng = snapToNearby(event.latlng, existingVertices, 15);
        setDrawingPoints((prev) => [...prev, snappedLatLng]);
      };
      const onPathDoubleClick = () => {
        clearSnapIndicator();
        finishPathDraft();
      };

      map.on("click", onPathClick);
      map.on("dblclick", onPathDoubleClick);

      return () => {
        map.off("click", onPathClick);
        map.off("dblclick", onPathDoubleClick);
        if (isSnappableTool) {
          map.off("mousemove", onMouseMove);
          map.off("mouseout", onMouseOut);
        }
        clearSnapIndicator();
        clearTempDraft();
      };
    }

    return () => {
      map.off("click", createPointOnClick);
      if (isSnappableTool) {
        map.off("mousemove", onMouseMove);
        map.off("mouseout", onMouseOut);
      }
      clearSnapIndicator();
      map.getContainer().style.cursor = "";
    };
  }, [activeTool, featureGroupRef, finishPolygonDraft, finishPathDraft, map, mapData, setDrawingPoints]);

  useEffect(() => {
    if (activeTool === "polygon") renderTempPolygon(drawingPoints);
    else if (activeTool === "path") renderTempPath(drawingPoints);
    else clearTempDraft();
  }, [activeTool, drawingPoints, map]);

  useEffect(() => {
    if (activeTool !== "polygon" && activeTool !== "path") {
      clearTempDraft();
      setDrawingPoints([]);
    }
    if (activeTool !== "point" && activeTool !== "path") {
      clearSnapIndicator();
    }
  }, [activeTool, setDrawingPoints]);

  return null;
}

// ----- Página -----
export default function MapPoiEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [theme, setTheme] = useTheme();

  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  const [selectedLayerKey, setSelectedLayerKey] = useState(null);
  const [selectedLayerKind, setSelectedLayerKind] = useState(null);
  const [activeTool, setActiveTool] = useState("select");
  const [drawingPoints, setDrawingPoints] = useState([]);
  const drawingPointsRef = useRef([]);
  const [poiName, setPoiName] = useState("");
  const [poiDescription, setPoiDescription] = useState("");
  const [poiPhotoUrl, setPoiPhotoUrl] = useState("");
  const [edgeAccessible, setEdgeAccessible] = useState(true);
  const [uploadingPoiPhoto, setUploadingPoiPhoto] = useState(false);
  const [savingMap, setSavingMap] = useState(false);

  const featureGroupRef = useRef(null);
  const selectedLayerRef = useRef(null);
  const selectLayerHandlerRef = useRef(() => {});

  useEffect(() => {
    drawingPointsRef.current = drawingPoints;
  }, [drawingPoints]);

  useEffect(() => {
    const token = localStorage.getItem("jwt_token");
    if (!token) {
      navigate("/login");
      return;
    }
    const decoded = decodeToken(token);
    if (!decoded || decoded.role !== "admin") {
      alert("Acesso negado. Esta área é restrita a administradores.");
      navigate("/map-viewer");
      return;
    }
    setUser(decoded);
  }, [navigate]);

  useEffect(() => {
    if (!id) navigate("/map-editor");
  }, [id, navigate]);

  useEffect(() => {
    if (id) loadMap();
  }, [id]);

  async function loadMap() {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:3000/api/maps/${id}`);
      setMapData(res.data);
      setError(null);
    } catch (err) {
      console.error("Erro ao carregar o mapa:", err);
      setError("Não foi possível carregar este mapa.");
    } finally {
      setLoading(false);
    }
  }

  async function saveFeatures() {
    try {
      if (!featureGroupRef.current) return;
      setSavingMap(true);

      const layers = featureGroupRef.current.toGeoJSON();

      // Saneia id/kind em todas as features antes de enviar
      layers.features.forEach((f) => {
        if (!f.properties) f.properties = {};
        if (!f.properties.id) {
          f.properties.id = `${(f.geometry?.type || "feature").toLowerCase()}-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 8)}`;
        }
        if (!f.properties.kind) {
          if (f.geometry?.type === "LineString") f.properties.kind = "edge";
          else if (f.geometry?.type === "Polygon") f.properties.kind = "area";
          else if (f.geometry?.type === "Point") f.properties.kind = "point";
        }
      });

      console.log("📤 Enviando pro backend:", JSON.stringify(layers, null, 2));
      console.log("🔢 Total de features:", layers.features.length);
      console.log("📐 Tipos:", layers.features.map((f) => f.geometry?.type));
      console.log("🏷️ Kinds:", layers.features.map((f) => f.properties?.kind));

      const token = localStorage.getItem("jwt_token");
      await axios.put(`http://localhost:3000/api/maps/${id}/features`, layers, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await loadMap();
      alert("Mapa salvo com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar.");
    } finally {
      setSavingMap(false);
    }
  }

  async function handlePoiPhotoUpload(file) {
    if (!file) return;
    const token = localStorage.getItem("jwt_token");
    const formData = new FormData();
    formData.append("image", file);
    try {
      setUploadingPoiPhoto(true);
      const res = await axios.post("http://localhost:3000/api/maps/upload-poi-photo", formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      setPoiPhotoUrl(res.data.imageUrl);
    } catch {
      alert("Erro ao enviar foto do ponto.");
    } finally {
      setUploadingPoiPhoto(false);
    }
  }

  function selectLayer(layer) {
    if (selectedLayerRef.current && selectedLayerRef.current !== layer) {
      applyDefaultLayerStyle(selectedLayerRef.current);
    }
    selectedLayerRef.current = layer;
    applySelectedLayerStyle(layer);
    setSelectedLayerKey(layer.feature?.properties?.id || `layer-${L.stamp(layer)}`);
    setSelectedLayerKind(getLayerKind(layer));
    const props = layer.feature?.properties || {};
    setPoiName(props.name || "");
    setPoiDescription(props.description || "");
    setPoiPhotoUrl(props.photoUrl || "");
    setEdgeAccessible(props.acessivel !== false);
  }

  useEffect(() => {
    selectLayerHandlerRef.current = selectLayer;
  });

  function clearPoiForm() {
    if (selectedLayerRef.current) applyDefaultLayerStyle(selectedLayerRef.current);
    selectedLayerRef.current = null;
    setSelectedLayerKey(null);
    setSelectedLayerKind(null);
    setPoiName("");
    setPoiDescription("");
    setPoiPhotoUrl("");
    setEdgeAccessible(true);
  }

  function applyPoiChanges() {
    const layer = selectedLayerRef.current;
    if (!layer) return;
    const kind = getLayerKind(layer);
    if (kind === "edge") {
      const edgeId = layer.feature?.properties?.id || `edge-${Date.now()}`;
      layer.feature = {
        type: "Feature",
        geometry:
          layer.feature?.geometry ||
          (layer.getLatLngs
            ? {
                type: "LineString",
                coordinates: layer.getLatLngs().map((p) => [p.lng, p.lat]),
              }
            : undefined),
        properties: {
          ...(layer.feature?.properties || {}),
          id: edgeId,
          kind: "edge",
          acessivel: edgeAccessible,
        },
      };
    } else {
      const poiId = layer.feature?.properties?.id || `poi-${Date.now()}`;
      layer.feature = {
        type: "Feature",
        properties: {
          ...(layer.feature?.properties || {}),
          id: poiId,
          kind,
          name: poiName,
          description: poiDescription,
          photoUrl: poiPhotoUrl,
        },
      };
    }
    clearPoiForm();
  }

  function selectMappingTool(tool) {
    clearPoiForm();
    if (tool !== "polygon" && tool !== "path") setDrawingPoints([]);
    setActiveTool(tool);
  }

  function finishPolygonDraft() {
    const points = drawingPointsRef.current;
    if (!featureGroupRef.current || points.length < 3) return;

    const polygon = L.polygon(points, areaShapeOptions);
    const poiId = `poi-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    polygon.feature = {
      type: "Feature",
      properties: {
        id: poiId,
        kind: "area",
        name: "",
        description: "",
        photoUrl: "",
      },
    };

    featureGroupRef.current.addLayer(polygon);
    polygon.on("click", (event) => {
      if (event.originalEvent) L.DomEvent.stopPropagation(event.originalEvent);
      selectLayer(polygon);
    });
    selectLayer(polygon);
    setDrawingPoints([]);
    setActiveTool("select");
  }

  function finishPathDraft() {
    const points = drawingPointsRef.current;
    if (!featureGroupRef.current) return;

    const cleanedPoints = points.filter((pt, index) => {
      if (index === 0) return true;
      const prev = points[index - 1];
      return pt.lat !== prev.lat || pt.lng !== prev.lng;
    });

    if (cleanedPoints.length < 2) return;

    const polyline = L.polyline(cleanedPoints, pathShapeOptions);
    const edgeId = `edge-${Date.now()}`;

    polyline.feature = {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: cleanedPoints.map((p) => [p.lng, p.lat]),
      },
      properties: {
        id: edgeId,
        kind: "edge",
        acessivel: true,
      },
    };

    featureGroupRef.current.addLayer(polyline);
    polyline.on("click", (event) => {
      if (event.originalEvent) L.DomEvent.stopPropagation(event.originalEvent);
      selectLayer(polyline);
    });
    selectLayer(polyline);
    setDrawingPoints([]);
    setActiveTool("select");
  }

  function handleDeleteSelected() {
    const layer = selectedLayerRef.current;
    if (!layer || !featureGroupRef.current) return;
    if (!window.confirm("Remover esta camada?")) return;
    featureGroupRef.current.removeLayer(layer);
    clearPoiForm();
  }

  // ----- Render -----
  if (loading) {
    return (
      <PageLayout theme={theme}>
        <PageHeader theme={theme} setTheme={setTheme} isLoggedIn />
        <main className="relative z-10 flex-1 flex items-center justify-center">
          <p className={`text-lg font-semibold ${theme === "dark" ? "text-white/70" : "text-[#1B2F55]/70"}`}>
            Carregando mapa...
          </p>
        </main>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout theme={theme}>
        <PageHeader theme={theme} setTheme={setTheme} isLoggedIn />
        <main className="relative z-10 flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-red-400 text-lg font-semibold">Ops! {error}</p>
          <button
            onClick={() => navigate("/map-editor")}
            className="px-5 py-2 bg-[#F59E0B] text-[#0B1B3B] font-semibold rounded-lg hover:bg-[#d97706] transition-colors cursor-pointer"
          >
            Voltar para a lista
          </button>
        </main>
      </PageLayout>
    );
  }

  const isDark = theme === "dark";
  const toolButton = (tool, label, icon) => {
    const active = activeTool === tool;
    return (
      <button
        type="button"
        onClick={() => selectMappingTool(tool)}
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
          active
            ? "bg-[#4A7FD4] text-white shadow-lg"
            : isDark
            ? "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"
            : "bg-white text-[#1B2F55]/70 hover:bg-[#1B2F55]/5 border border-[#1B2F55]/10"
        }`}
      >
        <span>{icon}</span>
        {label}
      </button>
    );
  };

  return (
    <PageLayout theme={theme}>
      <PageHeader theme={theme} setTheme={setTheme} isLoggedIn />

      <main className="relative z-10 flex-1 flex flex-col gap-4 px-4 sm:px-6 lg:px-8 pb-6">
        {/* Topbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => navigate("/map-editor")}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
              isDark
                ? "bg-white/10 text-white border border-white/10 hover:bg-white/15"
                : "bg-white/90 text-[#1B2F55] border border-[#1B2F55]/10 hover:bg-white"
            }`}
          >
            ⬅ Voltar
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {toolButton("select", "Selecionar", "🖱️")}
            {toolButton("point", "Ponto", "📍")}
            {toolButton("polygon", "Área", "🔷")}
            {toolButton("path", "Corredor", "🛣️")}
          </div>

          <button
            onClick={saveFeatures}
            disabled={savingMap}
            className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold bg-[#F59E0B] text-[#0B1B3B] hover:bg-[#d97706] transition-all disabled:opacity-50"
          >
            {savingMap ? "Salvando..." : "💾 Salvar mapa"}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
          {/* Mapa */}
          <div className={`flex-1 min-w-0 rounded-2xl overflow-hidden border ${panelClasses(theme)}`}>
            <MapContainer
              crs={L.CRS.Simple}
              bounds={bounds}
              className="w-full h-full"
              style={{
                height: "calc(100svh - 180px)",
                background: isDark ? "#071427" : "#edf3f9",
              }}
            >
              <ImageOverlay url={`http://localhost:3000${mapData?.imageUrl}`} bounds={bounds} />
              {/* Sem <FeatureGroup> nem <GeoJSON> do react-leaflet.
                  Tudo é controlado pelo L.FeatureGroup() dentro do MapSetup. */}
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
              />
            </MapContainer>
          </div>

          {/* Painel lateral */}
          <aside className={`w-full lg:w-[340px] flex-shrink-0 rounded-2xl border p-4 ${panelClasses(theme)}`}>
            <h2 className={`text-lg font-bold mb-3 ${isDark ? "text-white" : "text-[#1B2F55]"}`}>
              {selectedLayerRef.current ? "Editar camada" : "Nenhuma camada selecionada"}
            </h2>

            {selectedLayerRef.current ? (
              <div className="flex flex-col gap-3">
                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? "text-white/70" : "text-[#1B2F55]/70"}`}>
                    Tipo
                  </label>
                  <p className={`text-sm ${isDark ? "text-white" : "text-[#1B2F55]"}`}>
                    {selectedLayerKind === "edge"
                      ? "🛣️ Corredor"
                      : selectedLayerKind === "point"
                      ? "📍 Ponto"
                      : "🔷 Área"}
                  </p>
                </div>

                {selectedLayerKind !== "edge" && (
                  <>
                    <div>
                      <label className={`block text-xs font-bold mb-1 ${isDark ? "text-white/70" : "text-[#1B2F55]/70"}`}>
                        Nome
                      </label>
                      <input
                        value={poiName}
                        onChange={(e) => setPoiName(e.target.value)}
                        className={inputClasses(theme)}
                        placeholder="Ex.: Sala 101"
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-bold mb-1 ${isDark ? "text-white/70" : "text-[#1B2F55]/70"}`}>
                        Descrição
                      </label>
                      <textarea
                        value={poiDescription}
                        onChange={(e) => setPoiDescription(e.target.value)}
                        rows={3}
                        className={inputClasses(theme)}
                        placeholder="Informações adicionais..."
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-bold mb-1 ${isDark ? "text-white/70" : "text-[#1B2F55]/70"}`}>
                        Foto
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handlePoiPhotoUpload(e.target.files?.[0])}
                        className={`text-xs ${isDark ? "text-white/70" : "text-[#1B2F55]/70"}`}
                      />
                      {uploadingPoiPhoto && (
                        <p className="text-xs mt-1 text-blue-400">Enviando foto...</p>
                      )}
                      {poiPhotoUrl && (
                        <img
                          src={`http://localhost:3000${poiPhotoUrl}`}
                          alt="Foto do POI"
                          className="mt-2 w-full h-28 object-cover rounded-lg"
                        />
                      )}
                    </div>
                  </>
                )}

                {selectedLayerKind === "edge" && (
                  <label className={`flex items-center gap-2 cursor-pointer select-none text-sm ${isDark ? "text-white/70" : "text-[#1B2F55]/70"}`}>
                    <input
                      type="checkbox"
                      checked={edgeAccessible}
                      onChange={(e) => setEdgeAccessible(e.target.checked)}
                      className="accent-[#f59e0b] w-4 h-4"
                    />
                    Acessível (sem escadas)
                  </label>
                )}

                <div className="flex gap-2 mt-2">
                  <button
                    onClick={applyPoiChanges}
                    className="flex-1 rounded-lg py-2 text-sm font-semibold bg-[#4A7FD4] text-white hover:bg-[#3F64A6] transition-colors"
                  >
                    Aplicar
                  </button>
                  <button
                    onClick={handleDeleteSelected}
                    className="rounded-lg px-3 py-2 text-sm font-semibold bg-red-500/90 text-white hover:bg-red-600 transition-colors"
                    title="Remover camada"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ) : (
              <p className={`text-sm ${isDark ? "text-white/50" : "text-[#1B2F55]/50"}`}>
                Clique numa camada do mapa para editar, ou use as ferramentas acima para criar
                pontos, áreas e corredores.
              </p>
            )}
          </aside>
        </div>
      </main>
    </PageLayout>
  );
}