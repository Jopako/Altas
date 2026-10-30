import { Polyline } from 'react-leaflet';
import { useMap } from 'react-leaflet';

export function FundoEsquematico({ theme, bounds }) {
  const isDark = theme === 'dark';
  const color = isDark ? '#1e3a5f' : '#c7d5ea';
  const majorColor = isDark ? '#2a4a78' : '#9fb4d4';
  
  // Calcula os limites da grade. Se passar bounds, usa ele.
  let minX = 0, maxX = 1000, minY = 0, maxY = 1000;
  if (bounds && bounds.isValid()) {
    minX = bounds.getWest() - 500;
    maxX = bounds.getEast() + 500;
    minY = bounds.getSouth() - 500;
    maxY = bounds.getNorth() + 500;
  }

  const step = 50; // Tamanho de cada quadradinho da grade
  const lines = [];

  // Desenha linhas verticais
  for (let x = Math.floor(minX / step) * step; x <= maxX; x += step) {
    const isMajor = x % (step * 5) === 0;
    lines.push(
      <Polyline 
        key={`v${x}`} 
        positions={[[minY, x], [maxY, x]]} 
        pathOptions={{ 
          color: isMajor ? majorColor : color, 
          weight: isMajor ? 1 : 0.5, 
          opacity: isMajor ? 0.35 : 0.16, 
          interactive: false 
        }} 
      />
    );
  }

  // Desenha linhas horizontais
  for (let y = Math.floor(minY / step) * step; y <= maxY; y += step) {
    const isMajor = y % (step * 5) === 0;
    lines.push(
      <Polyline 
        key={`h${y}`} 
        positions={[[y, minX], [y, maxX]]} 
        pathOptions={{ 
          color: isMajor ? majorColor : color, 
          weight: isMajor ? 1 : 0.5, 
          opacity: isMajor ? 0.35 : 0.16, 
          interactive: false 
        }} 
      />
    );
  }

  return <>{lines}</>;
}