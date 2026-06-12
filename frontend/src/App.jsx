import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Callback from './pages/Callback';
import MapViewer from './pages/MapViewer.jsx';
import MapEditor from './pages/MapEditor.jsx';
import Home from './pages/Home.jsx';
import ConhecaAltas from './pages/ConhecaAltas.jsx';
import TeamPage from './pages/TeamPage.jsx';
import FaleConosco from './pages/FaleConosco.jsx';
import Instituicoes from './pages/Instituicoes.jsx';

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
        <Route path="/map-editor/:id" element={<MapEditor />} />
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