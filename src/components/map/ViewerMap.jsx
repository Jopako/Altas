/**
 * ViewerMap — Canvas Leaflet do visualizador indoor.
 * CRS Simple; origem das coordenadas é o FeatureCollection salvo no mapa.
 * Clique em sala/ponto alimenta origem ou destino conforme alvoAtivo (ref na page).
 */
import { Fragment, useEffect } from 'react';
import { MapContainer, GeoJSON, Polygon, Polyline, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MAP_BOUNDS, ORIGEM_STYLE, DESTINO_STYLE, DEFAULT_AREA_STYLE, DEFAULT_POINT_STYLE } from '../../lib/mapConstants';
import { lineStringToPolygon } from '../../lib/graph';
import { getFeatureCenter } from '../../lib/geo';
import { FundoEsquematico } from './FundoEsquematico';
import { RouteFocus } from './RouteFocus';
import { InvalidateMapSize } from './InvalidateMapSize';

/** Enquadra o piso inteiro depois que o container flex tem tamanho real. */
function FitOverview() {
  const map = useMap();
  useEffect(() => {
    let cancelled = false;
    const fit = () => {
      if (cancelled) return;
      map.invalidateSize();
      const size = map.getSize();
      if (size.x < 40 || size.y < 40) return;
      map.fitBounds(MAP_BOUNDS, { padding: [36, 36], animate: false });
    };
    fit();
    const soon = window.setTimeout(fit, 80);
    const later = window.setTimeout(fit, 320);
    return () => {
      cancelled = true;
      window.clearTimeout(soon);
      window.clearTimeout(later);
    };
  }, [map]);
  return null;
}

function FocusPoi({ poi }) {
  const map = useMap();
  useEffect(() => {
    if (!poi) return;

    // 👇 LOG DE DIAGNÓSTICO
    console.log('[FocusPoi] poi recebido:', {
      id: poi.properties?.id,
      name: poi.properties?.name,
      geometryType: poi.geometry?.type,
      coordinates: JSON.stringify(poi.geometry?.coordinates),
    });

    const center = getFeatureCenter(poi);
    console.log('[FocusPoi] center calculado:', center);
    // ... resto do código
  }, [poi, map]);
  return null;
}

/** Escala os labels conforme o zoom, via CSS var. */
function ZoomScaledLabels() {
  const map = useMap();
  useEffect(() => {
    const update = () => {
      const z = map.getZoom();
      // base: zoom 0 → 1x. Cada nível multiplica por 1.35 (ajusta ao gosto)
      const scale = Math.pow(1.35, z);
      map.getContainer().style.setProperty('--label-scale', scale);
    };
    update();
    map.on('zoomend', update);
    return () => map.off('zoomend', update);
  }, [map]);
  return null;
}

export function ViewerMap({
  theme,
  corredores,
  areas,
  pontos,
  navOrigem,
  navDestino,
  rotaPontos,
  poiLayersRef,
  handlePoiClickRef,
  poiSelecionado,
}) {
  const isDark = theme === 'dark';

  return (
    <div className="h-full w-full relative">
      <MapContainer
        crs={L.CRS.Simple}
        bounds={MAP_BOUNDS}
        minZoom={-4}
        maxZoom={3}
        zoomSnap={0.5}
        zoomDelta={0.5}
        className="h-full w-full rounded-2xl sm:rounded-[28px] overflow-hidden"
        style={{
          height: '100%',
          width: '100%',
          background:
            isDark
              ? 'radial-gradient(circle at 50% 40%, #0f2346 0%, #071427 70%, #050d1c 100%)'
              : 'radial-gradient(circle at 50% 40%, #eef4fb 0%, #dbe6f5 60%, #c7d5ea 100%)',
        }}
      >
        <InvalidateMapSize />
        <FitOverview /> <ZoomScaledLabels />
        <FocusPoi poi={poiSelecionado} />
        <FundoEsquematico theme={theme} />

        {/* Corredores: faixa visual + eixo tracejado */}
        {corredores.map((f) => {
          const coords =
            f.geometry?.type === 'Polygon'
              ? f.geometry.coordinates[0]
              : f.geometry?.coordinates;
          if (!coords || coords.length < 2) return null;

          const largura = f.properties?.largura || 60;
          const poly =
            f.geometry?.type === 'Polygon'
              ? f.geometry
              : lineStringToPolygon(coords, largura / 2);
          if (!poly) return null;

          return (
            <Fragment key={f.properties?.id || JSON.stringify(coords[0])}>
              <Polygon
                positions={poly.coordinates[0].map(([x, y]) => [y, x])}
                pathOptions={{
                  color: isDark ? '#4A7FD4' : '#3F64A6',
                  weight: 1.5,
                  opacity: 0.55,
                  fillColor: isDark ? '#4A7FD4' : '#3F64A6',
                  fillOpacity: 0.18,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              />
              {f.geometry?.type === 'LineString' && (
                <Polyline
                  positions={coords.map(([x, y]) => [y, x])}
                  pathOptions={{
                    color: isDark ? '#4A7FD4' : '#3F64A6',
                    weight: 1,
                    opacity: 0.45,
                    dashArray: '4 6',
                  }}
                />
              )}
            </Fragment>
          );
        })}

        {/* Áreas / salas */}
        {areas.map((f) => {
          const poiId = f.properties.id;
          return (
            <Polygon
              key={poiId}
              positions={f.geometry.coordinates[0].map(([x, y]) => [y, x])}
              pathOptions={
                navOrigem?.id === poiId
                  ? ORIGEM_STYLE
                  : navDestino?.id === poiId
                    ? DESTINO_STYLE
                    : DEFAULT_AREA_STYLE
              }
              eventHandlers={{
                click: () => {
                  const center = getFeatureCenter(f);
                  handlePoiClickRef.current?.({
                    id: poiId,
                    name: f.properties.name,
                    lng: center?.lng,
                    lat: center?.lat,
                    feature: f,
                  });
                },
                add: (e) => {
                  poiLayersRef.current.set(poiId, e.target);
                },
              }}
            >
              {f.properties.name && (
                <Tooltip
                  permanent
                  direction="center"
                  className="poi-label"
                >
                  {f.properties.name}
                </Tooltip>
              )}
            </Polygon>
          );
        })}

        {/* Pontos */}
        <GeoJSON
          data={{ type: 'FeatureCollection', features: pontos }}
          pointToLayer={(feature, latlng) => {
            const poiId = feature.properties.id;
            const isOrigem = navOrigem?.id === poiId;
            const isDestino = navDestino?.id === poiId;
            return L.circleMarker(latlng, {
              ...(isOrigem
                ? { ...ORIGEM_STYLE, radius: 9 }
                : isDestino
                  ? { ...DESTINO_STYLE, radius: 9 }
                  : DEFAULT_POINT_STYLE),
            });
          }}
          onEachFeature={(feature, layer) => {
            const poiId = feature.properties.id;
            poiLayersRef.current.set(poiId, layer);
            layer.on('click', () => {
              const center = getFeatureCenter(feature);
              handlePoiClickRef.current?.({
                id: poiId,
                name: feature.properties.name,
                lng: center?.lng,
                lat: center?.lat,
                feature,
              });
            });
            if (feature.properties.name) {
              layer.bindTooltip(feature.properties.name, {
                permanent: true,
                direction: 'top',
                className: 'poi-label',
                offset: [0, -8],
              });
            }
          }}
        />

        {rotaPontos && (
          <>
            <Polyline
              positions={rotaPontos}
              pathOptions={{
                color: '#f59e0b',
                weight: 5,
                opacity: 0.9,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
            <RouteFocus pontos={rotaPontos} />
          </>
        )}
      </MapContainer>
    </div>
  );
}