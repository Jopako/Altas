import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { PageLayout, PageHeader, PageFooter, useTheme } from '../components/PageLayout';
import { AuthBackground } from '../components/AuthBackground';

function decodeToken(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export default function MapEditor() {
  const navigate = useNavigate();
  const [theme, setTheme] = useTheme();
  const [mapList, setMapList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [newName, setNewName] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newFloor, setNewFloor] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      navigate('/login');
      return;
    }

    const decoded = decodeToken(token);
    if (!decoded || decoded.role !== 'admin') {
      alert("Acesso negado. Esta área é restrita a administradores.");
      navigate('/map-viewer');
      return;
    }

    setUser(decoded);
  }, [navigate]);

  async function fetchMaps() {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:3000/api/maps");
      setMapList(res.data);
      setError(null);
    } catch (err) {
      console.error("Erro ao listar mapas:", err);
      setError("Erro ao carregar a lista de mapas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMaps();
  }, []);

  async function handleUpload(e) {
    e.preventDefault();
    if (!selectedFile) return alert("Selecione uma imagem primeiro!");

    try {
      setUploading(true);
      const token = localStorage.getItem('jwt_token');
      const formData = new FormData();
      const fullName = [newName, newLocation, newFloor].filter(Boolean).join(' - ');
      formData.append("name", fullName || "Mapa sem nome");
      formData.append("image", selectedFile);

      await axios.post("http://localhost:3000/api/maps/upload-image", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      alert("Mapa criado com sucesso!");
      setNewName("");
      setNewLocation("");
      setNewFloor("");
      setSelectedFile(null);
      fetchMaps();
    } catch (err) {
      console.error("Erro no upload:", err);
      alert(err.response?.data?.error || "Erro ao fazer upload. Você está logado como Admin?");
    } finally {
      setUploading(false);
    }
  }

  const myMaps = mapList.filter((map) => user && map.creatorEmail === user.email);

  const inputClasses = `w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors ${
    theme === 'dark'
      ? 'bg-[#0f2346] border border-white/10 text-white placeholder:text-white/30 focus:border-[#4A7FD4]'
      : 'bg-white border border-[#1B2F55]/15 text-[#1B2F55] placeholder:text-[#1B2F55]/35 focus:border-[#4A7FD4]'
  }`;

  const labelClasses = `block text-sm font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-[#1B2F55]'}`;

  if (loading) {
    return (
      <PageLayout theme={theme} background={<AuthBackground theme={theme} />}>
        <PageHeader theme={theme} setTheme={setTheme} isLoggedIn />
        <main className="relative z-10 flex-1 flex items-center justify-center">
          <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white/70' : 'text-[#1B2F55]/70'}`}>
            Carregando...
          </p>
        </main>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout theme={theme} background={<AuthBackground theme={theme} />}>
        <PageHeader theme={theme} setTheme={setTheme} isLoggedIn />
        <main className="relative z-10 flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-red-400 text-lg font-semibold">Ops! {error}</p>
          <button
            onClick={fetchMaps}
            className="px-5 py-2 bg-[#F59E0B] text-[#0B1B3B] font-semibold rounded-lg hover:bg-[#d97706] transition-colors cursor-pointer"
          >
            Tentar novamente
          </button>
        </main>
      </PageLayout>
    );
  }

  return (
    <PageLayout theme={theme} background={<AuthBackground theme={theme} />}>
      <PageHeader theme={theme} setTheme={setTheme} isLoggedIn />

      <main className="relative z-10 flex-1 flex flex-col lg:flex-row gap-8 px-6 sm:px-10 lg:px-16 pb-8">
        {/* Lado esquerdo - Formulário */}
        <div className="w-full lg:w-[400px] flex-shrink-0">
          {/* Info do usuário */}
          <div className="mb-6">
            <p className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-[#1B2F55]'}`}>
              {user?.name || user?.email || 'Administrador'}
            </p>
            <p className={`text-xs ${theme === 'dark' ? 'text-white/60' : 'text-[#1B2F55]/60'}`}>
              Perfil: Administrador
            </p>
          </div>

          <h2 className={`text-2xl font-extrabold mb-6 ${theme === 'dark' ? 'text-white' : 'text-[#1B2F55]'}`}>
            Cadastrar novo mapa:
          </h2>

          <form onSubmit={handleUpload} className="flex flex-col gap-5">
            <div>
              <label className={labelClasses}>Instituição:</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Selecione o nome da instituição..."
                className={inputClasses}
                required
              />
            </div>

            <div>
              <label className={labelClasses}>Local da instituição:</label>
              <input
                type="text"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="Digite o nome do local..."
                className={inputClasses}
              />
            </div>

            <div>
              <label className={labelClasses}>Pavimento:</label>
              <input
                type="text"
                value={newFloor}
                onChange={(e) => setNewFloor(e.target.value)}
                placeholder="Digite qual o pavimento..."
                className={inputClasses}
              />
            </div>

            <div className="flex flex-wrap gap-3 mt-2">
              <label
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-colors ${
                  theme === 'dark'
                    ? 'bg-[#2563EB] hover:bg-[#1d4ed8] text-white'
                    : 'bg-[#3F64A6] hover:bg-[#2F5EA8] text-white'
                }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="hidden"
                  required
                />
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                {selectedFile ? selectedFile.name.substring(0, 20) : 'Fazer upload de imagem'}
              </label>

              <button
                type="submit"
                disabled={uploading}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#F59E0B] text-[#0B1B3B] rounded-lg text-sm font-semibold hover:bg-[#d97706] transition-colors cursor-pointer disabled:opacity-50"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                {uploading ? "Enviando..." : "Salvar novo mapa"}
              </button>
            </div>
          </form>
        </div>

        {/* Lado direito - Grid de mapas cadastrados */}
        <div className="flex-1 min-w-0">
          <h2 className={`text-2xl sm:text-3xl font-extrabold mb-6 ${theme === 'dark' ? 'text-white' : 'text-[#1B2F55]'}`}>
            Mapas cadastrados:
          </h2>

          <div className={`rounded-2xl p-5 sm:p-6 ${theme === 'dark' ? 'bg-[#0f2346]/80 border border-white/10' : 'bg-[#c0cfe6]/50 border border-[#1B2F55]/10'}`}>
            {myMaps.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-4xl block mb-3">🗺️</span>
                <p className={`text-sm ${theme === 'dark' ? 'text-white/50' : 'text-[#1B2F55]/50'}`}>
                  Você ainda não criou nenhum mapa.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                {myMaps.map((map) => (
                  <div
                    key={map.id}
                    onClick={() => navigate(`/map-editor/${map.id}/pontos`)}
                    className={`group rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
                      theme === 'dark'
                        ? 'bg-[#0d203b] border border-white/10 hover:border-blue-400/40'
                        : 'bg-white border border-[#1B2F55]/10 hover:border-[#4A7FD4]/40'
                    }`}
                  >
                    <div className={`aspect-[4/3] flex items-center justify-center overflow-hidden ${
                      theme === 'dark' ? 'bg-[#1a3a6e]' : 'bg-[#6b8fc7]'
                    }`}>
                      <img
                        src={`http://localhost:3000${map.imageUrl}`}
                        alt={map.name}
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                    <div className="p-3">
                      <p className={`text-xs font-semibold truncate ${theme === 'dark' ? 'text-white' : 'text-[#1B2F55]'}`}>
                        {map.name}
                      </p>
                      <p className={`text-[10px] mt-0.5 ${theme === 'dark' ? 'text-white/50' : 'text-[#1B2F55]/50'}`}>
                        {map.creatorName || 'Administrador'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </PageLayout>
  );
}
