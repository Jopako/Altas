export const MAP_BOUNDS = [
  [0, 0],
  [1000, 800] 
]; 

// Salas: Fundo cinza claro, borda um pouco mais escura (parece um card)
export const DEFAULT_AREA_STYLE = {
  color: '#64748B',       // Borda cinza
  weight: 1,
  fillColor: '#CBD5E1',   // Fundo cinza claro
  fillOpacity: 1,         
};

// Pontos comuns
export const DEFAULT_POINT_STYLE = {
  radius: 6,
  color: '#3B82F6',
  weight: 2,
  fillColor: '#FFFFFF',
  fillOpacity: 1,
};

// Origem: Borda vermelha, miolo branco
export const ORIGEM_STYLE = {
  radius: 9,
  color: '#EF4444',       
  weight: 3,
  fillColor: '#FFFFFF',   
  fillOpacity: 1,
};

// Destino: Borda azul, miolo branco
export const DESTINO_STYLE = {
  radius: 9,
  color: '#3B82F6',       
  weight: 3,
  fillColor: '#FFFFFF',   
  fillOpacity: 1,
};