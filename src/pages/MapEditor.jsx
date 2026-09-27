import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout, PageHeader, PageFooter, useTheme } from '../components/PageLayout';
import { AuthBackground } from '../components/AuthBackground';

const LS_KEY = 'altas_maps';

function loadMaps() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; }
}
function saveMaps(maps) {
  localStorage.setItem(LS_KEY, JSON.stringify(maps));
}

export default function MapEditor() {
  const navigate = useNavigate();
  const [theme, setTheme] = useTheme();
  const [mapList, setMapList] = useState([]);
  const [newName, setNewName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setMapList(loadMaps());
  }, []);

  function handleUpload(e) {
    e.preventDefault();
    if (!selectedFile) return alert("Selecione uma imagem primeiro!");

    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const novoMapa = {
        id: `map-${Date.now()}`,
        name: newName.trim() || "Mapa sem nome",
        imageUrl: reader.result, // dataURL — a imagem fica guardada no próprio localStorage
        features: { type: 'FeatureCollection', features: [] },
        createdAt: new Date().toISOString(),
      };
      const atualizado = [...loadMaps(), novoMapa];
      saveMaps(atualizado);
      setMapList(atualizado);
      setNewName("");
      setSelectedFile(null);
      setUploading(false);
      navigate(`/map-editor/${novoMapa.id}/pontos`);
    };
    reader.readAsDataURL(selectedFile);
  }

  function handleDelete(id, e) {
    e.stopPropagation();
    if (!confirm('Apagar este mapa e todos os pontos cadastrados nele?')) return;
    const atualizado = loadMaps().filter((m) => m.id !== id);
    saveMaps(atualizado);
    setMapList(atualizado);
  }

  const inputClasses = `w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors ${
    theme === 'dark'
      ? 'bg-[#0f2346] border border-white/10 text-white placeholder:text-white/30 focus:border-[#4A7FD4]'
      : 'bg-white border border-[#1B2F55]/15 text-[#1B2F55] placeholder:text-[#1B2F55]/35 focus:border-[#4A7FD4]'
  }`;

  const labelClasses = `block text-sm font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-[#1B2F55]'}`;

  return (
    <PageLayout theme={theme} background={<AuthBackground theme={theme} />}>
      <PageHeader theme={theme} setTheme={setTheme} isLoggedIn />

      <main className="relative z-10 flex-1 flex flex-col lg:flex-row gap-8 px-6 sm:px-10 lg:px-16 pb-8">
        {/* Lado esquerdo - Formulário */}
        <div className="w-full lg:w-[400px] flex-shrink-0">
          <h2 className={`text-2xl font-extrabold mb-6 ${theme === 'dark' ? 'text-white' : 'text-[#1B2F55]'}`}>
            Cadastrar novo mapa:
          </h2>

          <form onSubmit={handleUpload} className="flex flex-col gap-5">
            <div>
              <label className={labelClasses}>Nome do mapa:</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Digite o nome do mapa..."
                className={inputClasses}
                required
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
                {selectedFile ? selectedFile.name.substring(0, 20) : 'Fazer upload de imagem'}
              </label>

              <button
                type="submit"
                disabled={uploading}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#F59E0B] text-[#0B1B3B] rounded-lg text-sm font-semibold hover:bg-[#d97706] transition-colors cursor-pointer disabled:opacity-50"
              >
                {uploading ? "Processando..." : "Salvar novo mapa"}
              </button>
            </div>
            <p className={`text-xs ${theme === 'dark' ? 'text-white/40' : 'text-[#1B2F55]/40'}`}>
              Sem backend nesta versão: o mapa fica salvo só neste navegador (localStorage).
            </p>
          </form>
        </div>

        {/* Lado direito - Grid de mapas cadastrados */}
        <div className="flex-1 min-w-0">
          <h2 className={`text-2xl sm:text-3xl font-extrabold mb-6 ${theme === 'dark' ? 'text-white' : 'text-[#1B2F55]'}`}>
            Mapas cadastrados:
          </h2>

          <div className={`rounded-2xl p-5 sm:p-6 ${theme === 'dark' ? 'bg-[#0f2346]/80 border border-white/10' : 'bg-[#c0cfe6]/50 border border-[#1B2F55]/10'}`}>
            {mapList.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-4xl block mb-3">🗺️</span>
                <p className={`text-sm ${theme === 'dark' ? 'text-white/50' : 'text-[#1B2F55]/50'}`}>
                  Nenhum mapa criado ainda.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                {mapList.map((map) => (
                  <div
                    key={map.id}
                    onClick={() => navigate(`/map-editor/${map.id}/pontos`)}
                    className={`group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
                      theme === 'dark'
                        ? 'bg-[#0d203b] border border-white/10 hover:border-blue-400/40'
                        : 'bg-white border border-[#1B2F55]/10 hover:border-[#4A7FD4]/40'
                    }`}
                  >
                    <button
                      onClick={(e) => handleDelete(map.id, e)}
                      className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-black/50 text-white text-xs flex items-center justify-center hover:bg-red-500/80"
                      title="Apagar mapa"
                    >
                      ✕
                    </button>
                    <div className={`aspect-[4/3] flex items-center justify-center overflow-hidden ${
                      theme === 'dark' ? 'bg-[#1a3a6e]' : 'bg-[#6b8fc7]'
                    }`}>
                      <img
                        src={map.imageUrl}
                        alt={map.name}
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                    <div className="p-3">
                      <p className={`text-xs font-semibold truncate ${theme === 'dark' ? 'text-white' : 'text-[#1B2F55]'}`}>
                        {map.name}
                      </p>
                      <p className={`text-[10px] mt-0.5 ${theme === 'dark' ? 'text-white/50' : 'text-[#1B2F55]/50'}`}>
                        {(map.features?.features || []).length} elemento(s) mapeado(s)
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <PageFooter theme={theme} />
    </PageLayout>
  );
}
