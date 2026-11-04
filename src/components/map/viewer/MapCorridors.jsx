import { Fragment } from 'react';
import { Polygon, Polyline } from 'react-leaflet';
import { lineStringToPolygon } from '../../../lib/graph';

/** Corredores (polígono branco + eixo tracejado quando LineString). */
export function MapCorridors({ corredores }) {
  return corredores.map((f, i) => {
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
  });
}
