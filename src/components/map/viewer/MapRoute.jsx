import { Polyline, CircleMarker } from 'react-leaflet';
import { ORIGEM_STYLE, DESTINO_STYLE } from '../../../lib/mapConstants';
import { RouteFocus } from '../RouteFocus';

/** Linha da rota, pinos de origem/destino e foco da câmera. */
export function MapRoute({ rotaAjustada, finalPinoOrigem, finalPinoDestino }) {
  if (!rotaAjustada) return null;
  return (
    <>
      <Polyline positions={rotaAjustada} pathOptions={{ color: '#2563EB', weight: 4, opacity: 1, lineCap: 'round', lineJoin: 'round', dashArray: '6 6' }} />
      {finalPinoOrigem && <CircleMarker center={finalPinoOrigem} pathOptions={{ ...ORIGEM_STYLE, radius: 9 }} />}
      {finalPinoDestino && <CircleMarker center={finalPinoDestino} pathOptions={{ ...DESTINO_STYLE, radius: 9 }} />}
      <RouteFocus pontos={rotaAjustada} />
    </>
  );
}
