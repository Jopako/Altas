import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

// Intercepta as respostas da API e troca "localhost:3000" pelo IP/host atual
axios.interceptors.response.use((response) => {
  if (response.data && typeof response.data === "object") {
    const raw = JSON.stringify(response.data);
    if (raw.includes("http://localhost:3000")) {
      const currentApi =
        import.meta.env.VITE_API_BASE || `http://${window.location.hostname}:3000`;
      response.data = JSON.parse(
        raw.replaceAll("http://localhost:3000", currentApi)
      );
    }
  }
  return response;
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)