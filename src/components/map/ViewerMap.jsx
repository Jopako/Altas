/**
 * ViewerMap — Canvas Leaflet do visualizador indoor (Workspace).
 */
import { Fragment, useEffect, useRef } from 'react';
import { MapContainer, GeoJSON, Polygon, Polyline, Tooltip, useMap, ImageOverlay, Rectangle, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ORIGEM_STYLE, DESTINO_STYLE, DEFAULT_AREA_STYLE, DEFAULT_POINT_STYLE } from '../../lib/mapConstants';
import { lineStringToPolygon } from '../../lib/graph';
import { getFeatureCenter } from '../../lib/geo';
import { trimRouteToSalas } from '../../lib/routeUtils';
import { FundoEsquematico } from './FundoEsquematico'; // 👈 Import de volta
import { RouteFocus } from './RouteFocus';
import { InvalidateMapSize } from './InvalidateMapSize';

function MapCameraController({ blocoAtivo, blockMeta, workspaceBounds }) {
  const map = useMap();
  const lastAction = useRef("");

  useEffect(() => {
    const executarAcao = () => {
      map.invalidateSize();
      if (map.getSize().x < 40) return;

      if (blocoAtivo) {
        const meta = blockMeta?.[blocoAtivo];
        if (meta && meta.bounds) {
          const b = meta.bounds;
          if (Array.isArray(b) && b.length === 2) {
            const lat1 = Number(b[0][0]), lng1 = Number(b[0][1]);
            const lat2 = Number(b[1][0]), lng2 = Number(b[1][1]);
            
            if ([lat1, lng1, lat2, lng2].every(Number.isFinite)) {
              const bounds = L.latLngBounds([lat1, lng1], [lat2, lng2]);
              if (bounds.isValid()) {
                const actionKey = `bloco-${blocoAtivo}`;
                if (lastAction.current !== actionKey) {
                  lastAction.current = actionKey;
                  map.flyToBounds(bounds, { padding: [20, 20], duration: 0.8 });
                }
              }
            }
          }
        }
        return;
      }

      if (!blocoAtivo && workspaceBounds && workspaceBounds.isValid()) {
        const actionKey = "workspace-overview";
        if (lastAction.current !== actionKey) {
          lastAction.current = actionKey;
          map.fitBounds(workspaceBounds, { padding: [40, 40], animate: false });
        }
      }
    };

    map.whenReady(() => {
      setTimeout(executarAcao, 150);
    });

  }, [map, blocoAtivo, blockMeta, workspaceBounds]);

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
      map.panTo([lat, lng], { animate: true, duration: 0.5 });
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
  workspace,
  blocoAtivo,
  onBlocoClick,
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
  const blockMeta = workspace?.blockMeta || {};

  const workspaceBounds = (() => {
    const allBounds = Object.values(blockMeta)
      .map(b => b?.bounds)
      .filter(b => Array.isArray(b) && b.length === 2 && Array.isArray(b[0]) && Array.isArray(b[1]));
      
    if (allBounds.length === 0) return L.latLngBounds([0, 0], [1000, 800]);
    
    let minLat = Infinity, minLng = Infinity, maxLat = -Infinity, maxLng = -Infinity;
    allBounds.forEach(([sw, ne]) => {
      if (sw[0] < minLat) minLat = sw[0];
      if (sw[1] < minLng) minLng = sw[1];
      if (ne[0] > maxLat) maxLat = ne[0];
      if (ne[1] > maxLng) maxLng = ne[1];
    });
    return L.latLngBounds([minLat, minLng], [maxLat, maxLng]);
  })();

  let rotaAjustada = rotaPontos ? [...rotaPontos] : null;
  let pinoOrigem = null;
  let pinoDestino = null;

  if (rotaAjustada) {
    if (navOrigem?.feature) {
      const res = trimRouteToSalas(rotaAjustada, navOrigem.feature, true);
      rotaAjustada = res.route;
      pinoOrigem = res.edgePoint;
    }
    if (navDestino?.feature) {
      const res = trimRouteToSalas(rotaAjustada, navDestino.feature, false);
      rotaAjustada = res.route;
      pinoDestino = res.edgePoint;
    }
  }

  const finalPinoOrigem = pinoOrigem || (rotaAjustada && rotaAjustada[0]);
  const finalPinoDestino = pinoDestino || (rotaAjustada && rotaAjustada[rotaAjustada.length - 1]);

  const filterByBlock = (features) => {
    const unique = Array.from(new Map(features.map(f => [f.properties?.id || JSON.stringify(f.geometry), f])).values());
    if (!blocoAtivo) return unique;
    return unique.filter(f => f.properties?.blockId === blocoAtivo);
  };

  const uniqueCorredores = filterByBlock(corredores);
  const uniqueAreas = filterByBlock(areas);
  const uniquePontos = filterByBlock(pontos);

  const activeBlocks = blocoAtivo
    ? [[blocoAtivo, blockMeta[blocoAtivo]]].filter(([_, meta]) => meta)
    : Object.entries(blockMeta);

  return (
    <div className="h-full w-full relative">
      <MapContainer
        crs={L.CRS.Simple}
        center={[0, 0]}
        zoom={-2}
        minZoom={-8}
        maxZoom={4}
        zoomSnap={0.5}
        zoomDelta={0.5}
        className="h-full w-full rounded-2xl sm:rounded-[28px] overflow-hidden"
        style={{ height: '100%', width: '100%', background: '#1f3975' }}
      >
        <InvalidateMapSize />
        
        <FundoEsquematico theme={theme} bounds={workspaceBounds} />

        <MapCameraController 
          blocoAtivo={blocoAtivo} 
          blockMeta={blockMeta} 
          workspaceBounds={workspaceBounds} 
        />
        
        <ZoomScaledLabels />
        <FocusPoi poi={poiSelecionado} />

        {activeBlocks.map(([blockId, meta]) => {
          if (!meta?.bounds || !Array.isArray(meta.bounds) || meta.bounds.length !== 2) return null;
          const bounds = meta.bounds;
          if (!Array.isArray(bounds[0]) || !Array.isArray(bounds[1])) return null;
          
          const leafletBounds = L.latLngBounds([bounds[0][0], bounds[0][1]], [bounds[1][0], bounds[1][1]]);
          if (!leafletBounds.isValid()) return null;

          return (
            <Fragment key={`bloco-${blockId}-${meta.name}`}>
              {meta.imageUrl && (
                <ImageOverlay url={meta.imageUrl} bounds={leafletBounds} opacity={1} />
              )}
              {!blocoAtivo && (
                <Rectangle
                  bounds={leafletBounds}
                  pathOptions={{ color: 'transparent', fillColor: 'transparent', fillOpacity: 0.05 }}
                  eventHandlers={{ click: () => { if (onBlocoClick) onBlocoClick(blockId); } }}
                />
              )}
            </Fragment>
          );
        })}

        {uniqueCorredores.map((f, i) => {
          const coords = f.geometry?.type === 'Polygon' ? f.geometry.coordinates[0] : f.geometry?.coordinates;
          if (!coords || coords.length < 2) return null;
          const largura = f.properties?.largura || 60;
          const poly = f.geometry?.type === 'Polygon' ? f.geometry : lineStringToPolygon(coords, largura / 2);
          if (!poly) return null;

          return (
            <Fragment key={`corr-${f.properties?.id || i}-${f.properties?.blockId}`}>
              <Polygon positions={poly.coordinates[0].map(([x, y]) => [y, x])} pathOptions={{ color: '#FFFFFF', weight: 1, fillColor: '#FFFFFF', fillOpacity: 1, lineCap: 'round', lineJoin: 'round' }} />
              {f.geometry?.type === 'LineString' && (
                <Polyline positions={coords.map(([x, y]) => [y, x])} pathOptions={{ color: '#6a81a5', weight: 2, opacity: 0.6, dashArray: '6 8' }} />
              )}
            </Fragment>
          );
        })}

        {uniqueAreas.map((f, i) => {
          const poiId = f.properties?.id;
          return (
            <Polygon
              key={`area-${poiId || i}-${f.properties?.blockId}`}
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
                <Tooltip permanent direction="center" className="poi-label">
                  {f.properties.name}
                </Tooltip>
              )}
            </Polygon>
          );
        })}

        <GeoJSON
          key={`pontos-${uniquePontos.length}`}
          data={{ type: 'FeatureCollection', features: uniquePontos }}
          pointToLayer={(feature, latlng) => {
            const poiId = feature.properties?.id;
            return L.circleMarker(latlng, {
              ...(navOrigem?.id === poiId ? { ...ORIGEM_STYLE, radius: 9 } : navDestino?.id === poiId ? { ...DESTINO_STYLE, radius: 9 } : DEFAULT_POINT_STYLE),
            });
          }}
          onEachFeature={(feature, layer) => {
            const poiId = feature.properties?.id;
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

        {rotaAjustada && (
          <>
            <Polyline positions={rotaAjustada} pathOptions={{ color: '#2563EB', weight: 4, opacity: 1, lineCap: 'round', lineJoin: 'round', dashArray: '6 6' }} />
            {finalPinoOrigem && <CircleMarker center={finalPinoOrigem} pathOptions={{ ...ORIGEM_STYLE, radius: 9 }} />}
            {finalPinoDestino && <CircleMarker center={finalPinoDestino} pathOptions={{ ...DESTINO_STYLE, radius: 9 }} />}
            <RouteFocus pontos={rotaAjustada} />
          </>
        )}
      </MapContainer>
    </div>
  );
}