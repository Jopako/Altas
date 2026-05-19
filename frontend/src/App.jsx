import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Callback from './pages/Callback';
import EditPlantas from './pages/EditPlantas.jsx';
import MapViewer from './pages/MapViewer.jsx';
import MapEditor from './pages/MapEditor.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas de Autenticação */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/callback" element={<Callback />} />
        
        {/* Rotas do Sistema */}
        <Route path="/edit-plantas" element={<EditPlantas />} />
        
        {/* Viewer: Aceita tanto a galeria (/map-viewer) quanto o mapa aberto (/map-viewer/123) */}
        <Route path="/map-viewer" element={<MapViewer />} />
        <Route path="/map-viewer/:id" element={<MapViewer />} />
        
        {/* Editor: Aceita tanto a lista/upload (/map-editor) quanto a edição (/map-editor/123) */}
        <Route path="/map-editor" element={<MapEditor />} />
        <Route path="/map-editor/:id" element={<MapEditor />} />

        {/* ROTA PEGA-TUDO: Sempre deve ser a ÚLTIMA rota do bloco <Routes> */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
