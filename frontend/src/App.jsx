import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/HomePage.jsx';
import Login from './pages/LoginPage.jsx';
import Register from './pages/RegisterPage.jsx';
import Callback from './pages/Callback.jsx';
import MapViewer from './pages/MapViewer.jsx';
import MapEditor from './pages/MapEditor.jsx';
import MapPoiEditor from './pages/MapPoiEditor.jsx';
import Favorites from './pages/Favorites.jsx';
import ConhecaAltas from './pages/ConhecaAltasPage.jsx';
import TeamPage from './pages/TeamPage.jsx';
import FaleConosco from './pages/FaleConoscoPage.jsx';
import Instituicoes from './pages/InstituicoesPage.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/callback" element={<Callback />} />
        <Route path="/map-viewer" element={<MapViewer />} />
        <Route path="/map-viewer/:id" element={<MapViewer />} />
        <Route path="/map-editor" element={<MapEditor />} />
        <Route path="/map-editor/:id" element={<MapPoiEditor />} />
        <Route path="/map-editor/:id/pontos" element={<MapPoiEditor />} />
        <Route path="/favoritos" element={<Favorites />} />
        <Route path="/ConhecaAltas" element={<ConhecaAltas />} />
        <Route path="/TeamPage" element={<TeamPage />} />
        <Route path="/FaleConosco" element={<FaleConosco />} />
        <Route path="/Instituicoes" element={<Instituicoes />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;