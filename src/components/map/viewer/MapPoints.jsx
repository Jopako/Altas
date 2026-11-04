import { GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import { ORIGEM_STYLE, DESTINO_STYLE, DEFAULT_POINT_STYLE } from '../../../lib/mapConstants';
import { getFeatureCenter } from '../../../lib/geo';

/** Pontos de interesse (circleMarker + tooltip permanente). */
export function MapPoints({ pontos, navOrigem, navDestino, handlePoiClickRef, poiLayersRef }) {
  return (
    <GeoJSON
      key={`pontos-${pontos.length}`}
      data={{ type: 'FeatureCollection', features: pontos }}
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
  );
}
