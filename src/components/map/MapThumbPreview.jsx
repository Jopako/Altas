/**
 * MapThumbPreview — Mini pré-visualização estática de um mapa para a galeria.
 */
import { useEffect, useMemo } from 'react';
import { MapContainer, GeoJSON, Polygon, Polyline, ImageOverlay, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { lineStringToPolygon } from '../../lib/graph';
import { MAP_BOUNDS, DEFAULT_AREA_STYLE } from '../../lib/mapConstants';

const coordsToLatLng = ([x, y]) => L.latLng(y, x);

function computeBounds(features) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const visit = (coords) => {
    if (!Array.isArray(coords)) return;
    if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
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

/** Força o mapa a recalcular o enquadramento depois que o card ganha tamanho */
function AutoFit({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (!bounds) return;
    const doFit = () => {
      map.invalidateSize();
      const size = map.getSize();
      if (size.x > 30 && size.y > 30) {
        map.fitBounds(bounds, { padding: [8, 8], animate: false, maxZoom: 0 });
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
  const isDark = theme === 'dark';
  const featuresList = map?.features?.features || [];
  
  const areas = featuresList.filter(
    (f) => f.geometry?.type === 'Polygon' && !(f.properties?.kind === 'edge' || f.properties?.tipo === 'corredor')
  );
  const corredores = featuresList.filter(
    (f) => f.properties?.kind === 'edge' || f.properties?.tipo === 'corredor'
  );
  const pontos = featuresList.filter((f) => f.geometry?.type === 'Point');

  const bounds = useMemo(() => computeBounds(map?.features), [map]);

  if (!featuresList.length && !map?.imageUrl) return null;

  return (
    <MapContainer
      key={theme}
      crs={L.CRS.Simple}
      center={[400, 500]} 
      zoom={-2}
      minZoom={-4}
      maxZoom={3}
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
      style={{ background: isDark ? '#071427' : '#edf3f9' }} 
    >
      <AutoFit bounds={bounds || MAP_BOUNDS} />
      {map?.imageUrl && (
        <ImageOverlay 
          url={map.imageUrl} 
          bounds={MAP_BOUNDS} 
          opacity={0.8} // Um pouco transparente pra não brigar com as cores de cima
        />
      )}

      {/* Corredores */}
      {corredores.map((f) => {
        const coords = f.geometry?.type === 'Polygon' ? f.geometry.coordinates[0] : f.geometry?.coordinates;
        if (!coords || coords.length < 2) return null;
        const largura = f.properties?.largura || 60;
        const poly = f.geometry?.type === 'Polygon' ? f.geometry : lineStringToPolygon(coords, largura / 2);
        if (!poly) return null;

        return (
          <div key={f.properties?.id || JSON.stringify(coords[0])}>
            <Polygon
              positions={poly.coordinates[0].map(([x, y]) => [y, x])}
              pathOptions={{ color: '#FFFFFF', weight: 1, fillColor: '#FFFFFF', fillOpacity: 1, lineCap: 'round', lineJoin: 'round' }}
            />
            {f.geometry?.type === 'LineString' && (
              <Polyline
                positions={coords.map(([x, y]) => [y, x])}
                pathOptions={{ color: '#6a81a5', weight: 2, opacity: 0.6, dashArray: '4 6' }}
              />
            )}
          </div>
        );
      })}

      {/* Áreas / salas */}
      {areas.map((f) => {
        return (
          <Polygon
            key={f.properties?.id}
            positions={f.geometry.coordinates[0].map(([x, y]) => [y, x])}
            pathOptions={{
              ...DEFAULT_AREA_STYLE,
              fillOpacity: 0.6 // Diminuímos um tiquinho a opacidade pra ver a planta embaixo das salas
            }}
          />
        );
      })}

      {/* Pontos */}
      {pontos.length > 0 && (
        <GeoJSON
          data={{ type: 'FeatureCollection', features: pontos }}
          coordsToLatLng={coordsToLatLng}
          pointToLayer={(_f, latlng) =>
            L.circleMarker(latlng, {
              radius: 3,
              color: '#3B82F6',
              weight: 2,
              fillColor: '#FFFFFF',
              fillOpacity: 1,
            })
          }
        />
      )}
    </MapContainer>
  );
}