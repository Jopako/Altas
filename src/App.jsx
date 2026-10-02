import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MapEditor from './pages/MapEditor';       
import MapPoiEditor from './pages/MapPoiEditor'; 
import MapViewer from './pages/MapViewer';     

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. Tela Inicial: Galeria de Mapas */}
        <Route path="/" element={<MapViewer />} />
        <Route path="/map-editor" element={<MapEditor />} />

        {/* 2. Tela do Editor: Onde você desenha os pontos sobre a imagem */}
        <Route path="/map-editor/:id/pontos" element={<MapPoiEditor />} />

        {/* 3. Tela do Visualizador: Onde você vê o mapa e navega */}
        <Route path="/map-viewer/" element={<MapViewer />} />

        <Route path="/map-viewer/:id" element={<MapViewer />} />

        {/* Rota de Fallback para links quebrados */}
        <Route path="*" element={
          <div className="flex h-screen items-center justify-center bg-[#0b1a30] text-white">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-2">404 - Página não encontrada</h1>
              <a href="/" className="text-blue-400 hover:underline">Voltar para o Início</a>
            </div>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
