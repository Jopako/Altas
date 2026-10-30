import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MapEditor from './pages/MapEditor';       
import MapPoiEditor from './pages/MapPoiEditor'; 
import MapViewer from './pages/MapViewer';    
import LoginPage from './pages/LoginPage';
import AuthCallback from './pages/AuthCallback';
import { MapGallery } from './pages/MapGallery';
import HomePage from './pages/HomePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home */}
        <Route path="/" element={<HomePage />} />

        {/* Galeria de Blocos */}
        <Route path="/map-gallery" element={<MapGallery />} />

        {/* Editor de Mapas */}
        <Route path="/map-editor" element={<MapEditor />} />
        
        {/* 👇 AQUI ESTÁ A CORREÇÃO: de :id/pontos para :blockId */}
        <Route path="/map-editor/:blockId" element={<MapPoiEditor />} />

        {/* Visualizador do Workspace */}
        <Route path="/map-viewer" element={<MapViewer />} />

        {/* Login e Callback */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        <Route path="/admin/maps" element={<Navigate to="/map-editor" replace />} />

        {/* Fallback 404 */}
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