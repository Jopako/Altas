import { Polyline, CircleMarker } from 'react-leaflet';
import { ORIGEM_STYLE, DESTINO_STYLE } from '../../../lib/mapConstants';
import { RouteFocus } from '../RouteFocus';

/** Linha da rota, pinos de origem/destino, destaque de escada e foco da câmera. */
export function MapRoute({
  rotaAjustada,
  segmentosIndependentes,
  finalPinoOrigem,
  finalPinoDestino,
  escadaHighlight,
}) {
  if (!rotaAjustada && (!segmentosIndependentes || segmentosIndependentes.length === 0)) return null;

  return (
    <>
      {segmentosIndependentes && segmentosIndependentes.length > 0 ? (
        segmentosIndependentes.map((seg, idx) => (
          <Polyline
            key={seg.id || idx}
            positions={seg.pontos}
            pathOptions={{
              color: '#2563EB',
              weight: 4,
              opacity: 1,
              lineCap: 'round',
              lineJoin: 'round',
              dashArray: '6 6',
            }}
          />
        ))
      ) : (
        rotaAjustada && (
          <Polyline
            positions={rotaAjustada}
            pathOptions={{
              color: '#2563EB',
              weight: 4,
              opacity: 1,
              lineCap: 'round',
              lineJoin: 'round',
              dashArray: '6 6',
            }}
          />
        )
      )}

      {/* Destaque/indicação visual na escada de transição para o outro andar */}
      {escadaHighlight && (
        <CircleMarker
          center={escadaHighlight}
          pathOptions={{
            color: '#D97706',
            fillColor: '#F59E0B',
            fillOpacity: 0.9,
            weight: 3,
            radius: 12,
            dashArray: '3 3',
          }}
        />
      )}

      {finalPinoOrigem && <CircleMarker center={finalPinoOrigem} pathOptions={{ ...ORIGEM_STYLE, radius: 9 }} />}
      {finalPinoDestino && <CircleMarker center={finalPinoDestino} pathOptions={{ ...DESTINO_STYLE, radius: 9 }} />}
      <RouteFocus pontos={rotaAjustada || (segmentosIndependentes?.[0]?.pontos)} />
    </>
  );
}
