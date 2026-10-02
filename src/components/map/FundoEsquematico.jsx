/**
 * FundoEsquematico — Grade esquemática de fundo para o visualizador de mapa.
 */
import { Polyline } from 'react-leaflet';

export function FundoEsquematico({ theme, size = 1000, step = 50 }) {
  const isDark = theme === 'dark';
  const color = isDark ? '#1e3a5f' : '#c7d5ea';
  const majorColor = isDark ? '#2a4a78' : '#9fb4d4';
  const lines = [];
  for (let i = 0; i <= size; i += step) {
    const isMajor = i % (step * 5) === 0;
    const style = {
      color: isMajor ? majorColor : color,
      weight: isMajor ? 1 : 0.5,
      opacity: isMajor ? 0.35 : 0.16,
      interactive: false,
    };
    lines.push(
      <Polyline key={`h${i}`} positions={[[i, 0], [i, size]]} pathOptions={style} />
    );
    lines.push(
      <Polyline key={`v${i}`} positions={[[0, i], [size, i]]} pathOptions={style} />
    );
  }
  return <>{lines}</>;
}
