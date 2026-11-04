import { Polygon, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { ORIGEM_STYLE, DESTINO_STYLE, DEFAULT_AREA_STYLE } from '../../../lib/mapConstants';
import { getFeatureCenter } from '../../../lib/geo';

export function MapAreas({ areas, navOrigem, navDestino, handlePoiClickRef, poiLayersRef }) {
  return areas.map((f, i) => {
    const poiId = f.properties?.id;
    return (
      <Polygon
        key={`area-${poiId || i}-${f.properties?.blockId}`}
        positions={f.geometry.coordinates[0].map(([x, y]) => [y, x])}
        pathOptions={navOrigem?.id === poiId ? ORIGEM_STYLE : navDestino?.id === poiId ? DESTINO_STYLE : DEFAULT_AREA_STYLE}
        eventHandlers={{
        // Em MapAreas.jsx ou MapPoints.jsx
        click: (e) => {
          console.log("1. CLIQUE CAPTURADO NA CAMADA LEAFLET!", f?.properties?.name);
          if (e.originalEvent) {
            L.DomEvent.stopPropagation(e.originalEvent);
            L.DomEvent.preventDefault(e.originalEvent);
          }

          const center = getFeatureCenter(f);
          console.log("2. REFS NO MOMENTO DO CLIQUE:", handlePoiClickRef.current);
          handlePoiClickRef.current?.({ id: poiId, name: f.properties?.name, lng: center?.lng, lat: center?.lat, feature: f });
        },
          add: (e) => { 
            poiLayersRef.current.set(poiId, e.target); 
          },
        }}
      >
        {f.properties?.name && (
          <Tooltip permanent direction="center" className="poi-label pointer-events-none">
            {f.properties.name}
          </Tooltip>
        )}
      </Polygon>
    );
  });
}