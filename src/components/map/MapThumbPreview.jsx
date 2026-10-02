/**
 * MapThumbPreview — Mini pré-visualização estática de um mapa para a galeria.
 */
import { useEffect, useMemo } from 'react';
import { MapContainer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/** Inverte [x, y] → Leaflet [lat=y, lng=x]. */
const coordsToLatLng = ([x, y]) => L.latLng(y, x);

/** Calcula bounds manualmente percorrendo todas as coordenadas. */
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

/** Refaz fitBounds após o container ter tamanho, e sempre que ele mudar. */
function AutoFit({ bounds }) {
    const map = useMap();

    useEffect(() => {
        if (!bounds) return;

        const doFit = () => {
            map.invalidateSize();
            const size = map.getSize();
            if (size.x < 40 || size.y < 40) return;

            map.fitBounds(bounds, { padding: [6, 6], animate: false });

            // 🔍 log pra diagnosticar
            console.log('[thumb] pós-fit', {
                alvo: bounds.toBBoxString(),
                visivel: map.getBounds().toBBoxString(),
                zoom: map.getZoom(),
                centro: map.getCenter(),
                tamanho: size,
            });
        };

        doFit();
        const ts = [60, 200, 500, 1000, 2000].map((d) => setTimeout(doFit, d));
        const ro = new ResizeObserver(doFit);
        ro.observe(map.getContainer());

        return () => {
            ts.forEach(clearTimeout);
            ro.disconnect();
        };
    }, [map, bounds]);

    return null;
}

export function MapThumbPreview({ map, theme }) {
    const isDark = theme === 'dark';
    const features = map?.features;
    const bounds = useMemo(() => computeBounds(features), [features]);

    if (!features || !features.features?.length) {
        return map?.imageUrl ? (
            <img src={map.imageUrl} alt={map.name} className="w-full h-full object-cover" />
        ) : null;
    }

    return (
        <MapContainer
            key={theme}
            crs={L.CRS.Simple}
            center={[0, 0]}
            zoom={-2}
            minZoom={-4}
            maxZoom={3}
            zoomSnap={0.1}
            zoomDelta={0.1}
            zoomControl={false}
            attributionControl={false}
            dragging={false}
            scrollWheelZoom={false}
            doubleClickZoom={false}
            touchZoom={false}
            keyboard={false}
            boxZoom={false}
            className="h-full w-full pointer-events-none"
            style={{ background: isDark ? '#0a1a33' : '#edf3f9' }}
        >
            <AutoFit bounds={bounds} />
            <GeoJSON
                key={`geojson-${theme}`}
                data={features}
                coordsToLatLng={coordsToLatLng}
                style={() => ({
                    color: isDark ? '#4A7FD4' : '#3F64A6',
                    weight: 1.2,
                    opacity: 0.85,
                    fillColor: isDark ? '#4A7FD4' : '#3F64A6',
                    fillOpacity: 0.28,
                })}
                pointToLayer={(_f, latlng) =>
                    L.circleMarker(latlng, {
                        radius: 3.5,
                        color: isDark ? '#4A7FD4' : '#3F64A6',
                        fillColor: isDark ? '#4A7FD4' : '#3F64A6',
                        fillOpacity: 0.9,
                        weight: 1,
                    })
                }
            />
        </MapContainer>
    );
}