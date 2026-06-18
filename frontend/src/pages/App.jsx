import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./HomePage";
import RegisterPage from "./RegisterPage";
import TeamPage from "./TeamPage";
import InstituicoesPage from "./InstituicoesPage";
import LoginPage from "./LoginPage";
import FaleConoscoPage from "./FaleConoscoPage";
import ConhecaAltasPage from "./ConhecaAltasPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/TeamPage" element={<TeamPage />}></Route>
        <Route path="/Instituicoes" element={<InstituicoesPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/RegisterPage" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/FaleConosco" element={<FaleConoscoPage />} />
        <Route path="/ConhecaAltas" element={<ConhecaAltasPage />} />
      </Routes>
    </BrowserRouter>
  );
}
