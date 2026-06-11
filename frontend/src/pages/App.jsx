import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./Home";
import EditorPage from "./EditorPage";
import VisitorPage from "./VisitorPage";
import RegisterPage from "./RegisterPage";
import TeamPage from "./TeamPage";
import Instituicoes from "./Instituicoes";
import Login from "./Login";
import FaleConosco from "./FaleConosco";
import ConhecaAltas from "./ConhecaAltas";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/VisitorPage" element={<EditorPage />} />
        <Route path="/TeamPage" element={<TeamPage />}></Route>
        <Route path="/Instituicoes" element={<Instituicoes />} />
        <Route path="/EditorPage" element={<VisitorPage />} />
        <Route path="/RegisterPage" element={<RegisterPage />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/FaleConosco" element={<FaleConosco />} />
        <Route path="/ConhecaAltas" element={<ConhecaAltas />} />
      </Routes>
    </BrowserRouter>
  );
}
