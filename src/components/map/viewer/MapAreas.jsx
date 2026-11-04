import { Polygon, Tooltip } from 'react-leaflet';
import { ORIGEM_STYLE, DESTINO_STYLE, DEFAULT_AREA_STYLE } from '../../../lib/mapConstants';
import { getFeatureCenter } from '../../../lib/geo';

/** Salas/áreas com tooltip permanente e clique para selecionar POI. */
export function MapAreas({ areas, navOrigem, navDestino, handlePoiClickRef, poiLayersRef }) {
  return areas.map((f, i) => {
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
  });
}
