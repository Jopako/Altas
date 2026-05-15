import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Callback from './pages/Callback';
import PlantasPage from './pages/PlantasPage.jsx';
import EditPlantas from './pages/EditPlantas.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/callback" element={<Callback />} />
        <Route path="/plantas" element={<PlantasPage />} />
        <Route path="*" element={<Navigate to="/login" />} />
        <Route path="/edit-plantas" element={<EditPlantas />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
