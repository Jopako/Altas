import { useEffect, useMemo } from "react";
import { MapContainer, GeoJSON, Polygon, Polyline, ImageOverlay, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { lineStringToPolygon } from "../../lib/graph";
import { DEFAULT_AREA_STYLE } from "../../lib/mapConstants";

const coordsToLatLng = ([x, y]) => L.latLng(y, x);

function computeBounds(features) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const visit = (coords) => {
    if (!Array.isArray(coords)) return;
    if (typeof coords[0] === "number" && typeof coords[1] === "number") {
      const [x, y] = coords;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    } else coords.forEach(visit);
  };
  (features?.features || []).forEach((f) => {
    if (f?.geometry?.coordinates) visit(f.geometry.coordinates);
  });
  if (!isFinite(minX)) return null;
  return L.latLngBounds([minY, minX], [maxY, maxX]);
}

function AutoFit({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (!bounds) return;
    const doFit = () => {
      map.invalidateSize();
      const size = map.getSize();
      if (size.x > 30 && size.y > 30) {
        map.fitBounds(bounds, { padding: [8, 8], animate: false, maxZoom: 1 });
      }
    };
    doFit();
    const t1 = setTimeout(doFit, 100);
    const t2 = setTimeout(doFit, 500);
    const observer = new ResizeObserver(doFit);
    observer.observe(map.getContainer());
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      observer.disconnect();
    };
  }, [map, bounds]);
  return null;
}

export function MapThumbPreview({ map, theme }) {
  const isDark = theme === "dark";
  
  // 1. Filtra features do bloco específico
  const rawFeatures = (map?.features?.features || []).filter(
    (f) => !map.blockId || f.properties?.blockId === map.blockId
  );

  // 2. Remove features duplicadas por ID
  const featuresList = Array.from(
    new Map(rawFeatures.map(f => [f.properties?.id || JSON.stringify(f.geometry), f])).values()
  );
  
  const areas = featuresList.filter(
    (f) => f.geometry?.type === "Polygon" && !(f.properties?.kind === "edge" || f.properties?.tipo === "corredor")
  );
  const corredores = featuresList.filter(
    (f) => f.properties?.kind === "edge" || f.properties?.tipo === "corredor"
  );
  const pontos = featuresList.filter((f) => f.geometry?.type === "Point");

  const featureCollection = { type: "FeatureCollection", features: featuresList };
  const bounds = useMemo(() => computeBounds(featureCollection), [featureCollection]);

  if (!featuresList.length && !map?.imageUrl) return null;

  return (
    <MapContainer
      key={theme}
      crs={L.CRS.Simple}
      center={[0, 0]} 
      zoom={0}
      minZoom={-4}
      maxZoom={4}
      zoomSnap={0.1}
      zoomControl={false}
      attributionControl={false}
      dragging={false}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      touchZoom={false}
      keyboard={false}
      boxZoom={false}
      className="h-full w-full pointer-events-none"
      style={{ background: isDark ? "#071427" : "#edf3f9" }} 
    >
      <AutoFit bounds={bounds} />

      {/* Só desenha a imagem se o bounds calculado for válido */}
      {map?.imageUrl && bounds && bounds.isValid() && (
        <ImageOverlay url={map.imageUrl} bounds={bounds} opacity={1} />
      )}

      {corredores.map((f, i) => {
        const coords = f.geometry?.type === "Polygon" ? f.geometry.coordinates[0] : f.geometry?.coordinates;
        if (!coords || coords.length < 2) return null;
        const largura = f.properties?.largura || 60;
        const poly = f.geometry?.type === "Polygon" ? f.geometry : lineStringToPolygon(coords, largura / 2);
        if (!poly) return null;

        return (
          <div key={`corr-${f.properties?.id || i}`}>
            <Polygon
              positions={poly.coordinates[0].map(([x, y]) => [y, x])}
              pathOptions={{ color: "#FFFFFF", weight: 1, fillColor: "#FFFFFF", fillOpacity: 1, lineCap: "round", lineJoin: "round" }}
            />
            {f.geometry?.type === "LineString" && (
              <Polyline
                positions={coords.map(([x, y]) => [y, x])}
                pathOptions={{ color: "#6a81a5", weight: 2, opacity: 0.6, dashArray: "4 6" }}
              />
            )}
          </div>
        );
      })}

      {areas.map((f, i) => (
        <Polygon
          key={`area-${f.properties?.id || i}`}
          positions={f.geometry.coordinates[0].map(([x, y]) => [y, x])}
          pathOptions={{ ...DEFAULT_AREA_STYLE, fillOpacity: 0.8 }}
        />
      ))}

      {pontos.length > 0 && (
        <GeoJSON
          data={{ type: "FeatureCollection", features: pontos }}
          coordsToLatLng={coordsToLatLng}
          pointToLayer={(_f, latlng) =>
            L.circleMarker(latlng, {
              radius: 3, color: "#3B82F6", weight: 2, fillColor: "#FFFFFF", fillOpacity: 1,
            })
          }
        />
      )}
    </MapContainer>
  );
}