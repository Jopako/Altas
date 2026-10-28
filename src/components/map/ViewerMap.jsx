/**
 * ViewerMap — Canvas Leaflet do visualizador indoor.
 */
import { Fragment, useEffect } from 'react';
import { MapContainer, GeoJSON, Polygon, Polyline, Tooltip, useMap, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MAP_BOUNDS, ORIGEM_STYLE, DESTINO_STYLE, DEFAULT_AREA_STYLE, DEFAULT_POINT_STYLE } from '../../lib/mapConstants';
import { lineStringToPolygon } from '../../lib/graph';
import { getFeatureCenter } from '../../lib/geo';
import { trimRouteToSalas } from '../../lib/routeUtils'; 
import { FundoEsquematico } from './FundoEsquematico';
import { RouteFocus } from './RouteFocus';
import { InvalidateMapSize } from './InvalidateMapSize';

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
    let center;
    try { center = getFeatureCenter(poi); } catch (err) { return; }
    if (!center) return;
    const lat = Number(center.lat);
    const lng = Number(center.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    try {
      const z = Number(map.getZoom());
      const targetZoom = Number.isFinite(z) ? Math.max(z, 1) : 1;
      map.setView([lat, lng], targetZoom, { animate: false });
    } catch (err) {}
  }, [poi, map]);
  return null;
}

function ZoomScaledLabels() {
  const map = useMap();
  useEffect(() => {
    const update = () => {
      const z = map.getZoom();
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

  // 🚀 Processa a rota de forma limpa usando a função externa
  let rotaAjustada = rotaPontos ? [...rotaPontos] : null;
  let pinoOrigem = null;
  let pinoDestino = null;

  if (rotaAjustada) {
    if (navOrigem?.feature) {
      const res = trimRouteToSalas(rotaAjustada, navOrigem.feature, true);
      rotaAjustada = res.route;
      pinoOrigem = res.edgePoint; // Ponto exato na parede
    }
    if (navDestino?.feature) {
      const res = trimRouteToSalas(rotaAjustada, navDestino.feature, false);
      rotaAjustada = res.route;
      pinoDestino = res.edgePoint; // Ponto exato na parede
    }
  }

  // Fallback: se não tiver parede (ou for um Ponto), pega o início/fim da linha
  const finalPinoOrigem = pinoOrigem || (rotaAjustada && rotaAjustada[0]);
  const finalPinoDestino = pinoDestino || (rotaAjustada && rotaAjustada[rotaAjustada.length - 1]);

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
        style={{ height: '100%', width: '100%', background: '#1f397581' }}
      >
        <InvalidateMapSize />
        <FitOverview /> <ZoomScaledLabels />
        <FocusPoi poi={poiSelecionado} />

        <FundoEsquematico theme={theme} />

        {/* Corredores */}
        {corredores.map((f) => {
          const coords = f.geometry?.type === 'Polygon' ? f.geometry.coordinates[0] : f.geometry?.coordinates;
          if (!coords || coords.length < 2) return null;
          const largura = f.properties?.largura || 60;
          const poly = f.geometry?.type === 'Polygon' ? f.geometry : lineStringToPolygon(coords, largura / 2);
          if (!poly) return null;

          return (
            <Fragment key={f.properties?.id || JSON.stringify(coords[0])}>
              <Polygon
                positions={poly.coordinates[0].map(([x, y]) => [y, x])}
                pathOptions={{ color: '#FFFFFF', weight: 2, fillColor: '#FFFFFF', fillOpacity: 1, lineCap: 'round', lineJoin: 'round' }}
              />
              {f.geometry?.type === 'LineString' && (
                <Polyline
                  positions={coords.map(([x, y]) => [y, x])}
                  pathOptions={{ color: '#6a81a5', weight: 3, opacity: .3, dashArray: '6 8' }}
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
              pathOptions={navOrigem?.id === poiId ? ORIGEM_STYLE : navDestino?.id === poiId ? DESTINO_STYLE : DEFAULT_AREA_STYLE}
              eventHandlers={{
                click: () => {
                  const center = getFeatureCenter(f);
                  handlePoiClickRef.current?.({ id: poiId, name: f.properties.name, lng: center?.lng, lat: center?.lat, feature: f });
                },
                add: (e) => { poiLayersRef.current.set(poiId, e.target); },
              }}
            >
              {f.properties.name && (
                <Tooltip permanent direction="center" className="poi-label">{f.properties.name}</Tooltip>
              )}
            </Polygon>
          );
        })}

        {/* Pontos */}
        <GeoJSON
          data={{ type: 'FeatureCollection', features: pontos }}
          pointToLayer={(feature, latlng) => {
            const poiId = feature.properties.id;
            return L.circleMarker(latlng, {
              ...(navOrigem?.id === poiId ? { ...ORIGEM_STYLE, radius: 9 } : navDestino?.id === poiId ? { ...DESTINO_STYLE, radius: 9 } : DEFAULT_POINT_STYLE),
            });
          }}
          onEachFeature={(feature, layer) => {
            const poiId = feature.properties.id;
            poiLayersRef.current.set(poiId, layer);
            layer.on('click', () => {
              const center = getFeatureCenter(feature);
              handlePoiClickRef.current?.({ id: poiId, name: feature.properties.name, lng: center?.lng, lat: center?.lat, feature });
            });
            if (feature.properties.name) {
              layer.bindTooltip(feature.properties.name, { permanent: true, direction: 'top', className: 'poi-label', offset: [0, -8] });
            }
          }}
        />

        {/* Rota e Pinos cortados na parede */}
        {rotaAjustada && (
          <>
            <Polyline
              positions={rotaAjustada}
              pathOptions={{ color: '#2563EB', weight: 4, opacity: 1, lineCap: 'round', lineJoin: 'round', dashArray: '6 6' }}
            />
            
            {finalPinoOrigem && (
              <CircleMarker center={finalPinoOrigem} pathOptions={{ ...ORIGEM_STYLE }} />
            )}

            {finalPinoDestino && (
              <CircleMarker center={finalPinoDestino} pathOptions={{ ...DESTINO_STYLE }} />
            )}

            <RouteFocus pontos={rotaAjustada} />
          </>
        )}
      </MapContainer>
    </div>
  );
}