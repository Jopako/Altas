/**
 * MapEditor — Página de listagem e cadastro de novos mapas (upload de imagem).
 * Modo de layout rolável. Persistência via mapsStorage.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout, PageHeader, PageFooter } from '../components/PageLayout';
import { useTheme } from '../hooks/useTheme';
import { AuthBackground } from '../components/AuthBackground';
import { loadMaps, createMap, deleteMap } from '../lib/mapsStorage';
import { inputClasses, labelClasses } from '../lib/mapUi';
import { MapCard } from '../components/ui/MapCard';
import { EmptyState } from '../components/ui/EmptyState';
import { MapEmptyIcon } from '../components/icons/Icons';

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
        imageUrl: reader.result,
        features: { type: 'FeatureCollection', features: [] },
        createdAt: new Date().toISOString(),
      };
      const atualizado = createMap(novoMapa);
      setMapList(atualizado);
      setNewName("");
      setSelectedFile(null);
      setUploading(false);
      navigate(`/map-editor/${novoMapa.id}/pontos`);
    };
    reader.readAsDataURL(selectedFile);
  }

  function handleDelete(id, e) {
    if (e?.stopPropagation) e.stopPropagation();
    if (!confirm('Apagar este mapa e todos os pontos cadastrados nele?')) return;
    const atualizado = deleteMap(id);
    setMapList(atualizado);
  }

  const isDark = theme === 'dark';

  return (
    <PageLayout theme={theme} background={<AuthBackground theme={theme} />}>
      <PageHeader theme={theme} setTheme={setTheme} isLoggedIn />

      <main className="relative z-10 flex-1 flex flex-col lg:flex-row gap-8 px-4 sm:px-10 lg:px-16 pb-8">
        {/* Lado esquerdo - Formulário */}
        <div className="w-full lg:w-[400px] flex-shrink-0">
          <h2 className={`text-2xl font-extrabold mb-6 ${isDark ? 'text-white' : 'text-[#1B2F55]'}`}>
            Cadastrar novo mapa:
          </h2>

          <form onSubmit={handleUpload} className="flex flex-col gap-5">
            <div>
              <label className={labelClasses(theme)}>Nome do mapa:</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Digite o nome do mapa..."
                className={inputClasses(theme)}
                required
              />
            </div>

            <div className="flex flex-wrap gap-3 mt-2">
              <label
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-colors max-w-full truncate ${
                  isDark
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
                <span className="truncate">
                  {selectedFile ? selectedFile.name.substring(0, 20) : 'Fazer upload de imagem'}
                </span>
              </label>

              <button
                type="submit"
                disabled={uploading}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#F59E0B] text-[#0B1B3B] rounded-lg text-sm font-semibold hover:bg-[#d97706] transition-colors cursor-pointer disabled:opacity-50"
              >
                {uploading ? "Processando..." : "Salvar novo mapa"}
              </button>
            </div>
            <p className={`text-xs ${isDark ? 'text-white/40' : 'text-[#1B2F55]/40'}`}>
              Sem backend nesta versão: o mapa fica salvo só neste navegador (localStorage).
            </p>
          </form>
        </div>

        {/* Lado direito - Grid de mapas cadastrados */}
        <div className="flex-1 min-w-0">
          <h2 className={`text-2xl sm:text-3xl font-extrabold mb-6 ${isDark ? 'text-white' : 'text-[#1B2F55]'}`}>
            Mapas cadastrados:
          </h2>

          <div className={`rounded-2xl p-4 sm:p-6 ${isDark ? 'bg-[#0f2346]/80 border border-white/10' : 'bg-[#c0cfe6]/50 border border-[#1B2F55]/10'}`}>
            {mapList.length === 0 ? (
              <EmptyState
                theme={theme}
                message="Nenhum mapa criado ainda."
                icon={<MapEmptyIcon className="h-10 w-10 mx-auto mb-3 opacity-50" />}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {mapList.map((map) => (
                  <MapCard
                    key={map.id}
                    map={map}
                    theme={theme}
                    onClick={() => navigate(`/map-editor/${map.id}/pontos`)}
                    showDelete
                    onDelete={handleDelete}
                    variant="editor"
                    footer={`${(map.features?.features || []).length} elemento(s) mapeado(s)`}
                  />
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
