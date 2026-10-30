/**
 * MapEditor — Página de listagem e cadastro de novos blocos no Workspace.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout, PageHeader, PageFooter } from '../components/PageLayout';
import { useTheme } from '../hooks/useTheme';
import { AuthBackground } from '../components/AuthBackground';
import { loadMyWorkspace, saveMyWorkspace, uploadBlockImage } from '../lib/workspacesStorage';
import { inputClasses, labelClasses } from '../lib/mapUi';
import { MapCard } from '../components/ui/MapCard';
import { EmptyState } from '../components/ui/EmptyState';
import { MapEmptyIcon } from '../components/icons/Icons';

export default function MapEditor() {
  const navigate = useNavigate();
  const [theme, setTheme] = useTheme();
  
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [newName, setNewName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        
        let ws = await loadMyWorkspace();
        
        if (!ws || typeof ws !== 'object') {
          ws = {
            name: "Workspace ALTAS",
            blockMeta: {},
            features: { type: "FeatureCollection", features: [] }
          };
        }
        
        setWorkspace(ws);
      } catch (err) {
        console.error("Erro ao carregar workspace:", err);
        setError("Não foi possível carregar o workspace. Verifique sua conexão ou refaça o login.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleUpload(e) {
    if (e) e.preventDefault();
    
    if (!selectedFile) return alert("Selecione uma imagem primeiro!");
    if (!workspace) return alert("Workspace não carregado ainda!");

    setUploading(true);
    
    try {
      const uploadRes = await uploadBlockImage(selectedFile);
      const imageUrl = uploadRes.imageUrl || uploadRes.url; 

      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
      const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${API_BASE}${imageUrl}`;

      const img = new Image();
      img.src = fullImageUrl;
      
      img.onload = async () => {
        const MAP_WIDTH = 1000;
        const scale = MAP_WIDTH / img.width;
        const MAP_HEIGHT = img.height * scale;
        
        // 👇 A MÁGICA ACONTECE AQUI: Espaçamento entre blocos
        const blockCount = Object.keys(workspace.blockMeta || {}).length;
        const offsetX = blockCount * 1500; 
        const bounds = [[500, 500 + offsetX], [500 + MAP_HEIGHT, 500 + offsetX + MAP_WIDTH]];
        
        const blockId = `bloco-${Date.now()}`;
        const newBlockMeta = {
          ...(workspace.blockMeta || {}),
          [blockId]: {
            name: newName.trim() || "Bloco sem nome",
            imageUrl: fullImageUrl,
            bounds,
          }
        };

        const payload = {
          name: workspace.name || "Workspace ALTAS",
          blockMeta: newBlockMeta,
          features: workspace.features,
        };

        try {
          const updatedResponse = await saveMyWorkspace(payload);
          const updatedWorkspace = updatedResponse.workspace || updatedResponse;
          
          setWorkspace(updatedWorkspace);
          setNewName("");
          setSelectedFile(null);
          navigate(`/map-editor/${blockId}`);
        } catch (saveErr) {
          console.error("Erro no saveMyWorkspace:", saveErr);
          alert("Erro ao salvar no backend: " + (saveErr.response?.data?.error || saveErr.message));
        } finally {
          setUploading(false);
        }
      };
      
      img.onerror = () => {
        alert("Erro ao processar a imagem.");
        setUploading(false);
      };

    } catch (err) {
      console.error("Erro no upload da imagem:", err);
      alert("Erro ao enviar a imagem: " + (err.response?.data?.error || err.message));
      setUploading(false);
    }
  }

  async function handleDelete(blockId, e) {
    if (e?.stopPropagation) e.stopPropagation();
    if (!confirm('Apagar este bloco e todos os pontos cadastrados nele?')) return;

    try {
      const newBlockMeta = { ...workspace.blockMeta };
      delete newBlockMeta[blockId];

      const newFeaturesList = (workspace.features?.features || []).filter(
        (f) => f.properties?.blockId !== blockId
      );

      const payload = {
        name: workspace.name || "Workspace ALTAS",
        blockMeta: newBlockMeta,
        features: { type: 'FeatureCollection', features: newFeaturesList },
      };

      const updatedResponse = await saveMyWorkspace(payload);
      const updatedWorkspace = updatedResponse.workspace || updatedResponse;
      setWorkspace(updatedWorkspace);
    } catch (err) {
      console.error("Erro ao deletar bloco:", err);
      alert("Erro ao deletar o bloco.");
    }
  }

  const isDark = theme === 'dark';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d203b] text-white">
        <p>Carregando Workspace...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0d203b] text-white gap-4 p-6">
        <p className="text-red-400 font-semibold">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-white/10 px-4 py-2 rounded-lg text-sm hover:bg-white/20"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  const blockList = Object.entries(workspace?.blockMeta || {});

  return (
    <PageLayout theme={theme} background={<AuthBackground theme={theme} />}>
      <PageHeader theme={theme} setTheme={setTheme} isLoggedIn />

      <main className="relative z-10 flex-1 flex flex-col lg:flex-row gap-8 px-4 sm:px-10 lg:px-16 pb-8">
        <div className="w-full lg:w-[400px] flex-shrink-0">
          <h2 className={`text-2xl font-extrabold mb-6 ${isDark ? 'text-white' : 'text-[#1B2F55]'}`}>
            Adicionar novo bloco:
          </h2>

          <div className="flex flex-col gap-5">
            <div>
              <label className={labelClasses(theme)}>Nome do bloco:</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: Bloco D - Térreo"
                className={inputClasses(theme)}
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
                />
                <span className="truncate">
                  {selectedFile ? selectedFile.name.substring(0, 20) : 'Fazer upload de imagem'}
                </span>
              </label>

              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading || !workspace}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#F59E0B] text-[#0B1B3B] rounded-lg text-sm font-semibold hover:bg-[#d97706] transition-colors cursor-pointer disabled:opacity-50"
              >
                {uploading ? "Processando..." : "Adicionar Bloco"}
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h2 className={`text-2xl sm:text-3xl font-extrabold mb-6 ${isDark ? 'text-white' : 'text-[#1B2F55]'}`}>
            Seus Blocos:
          </h2>

          <div className={`rounded-2xl p-4 sm:p-6 ${isDark ? 'bg-[#0f2346]/80 border border-white/10' : 'bg-[#c0cfe6]/50 border border-[#1B2F55]/10'}`}>
            {blockList.length === 0 ? (
              <EmptyState
                theme={theme}
                message="Nenhum bloco criado ainda."
                icon={<MapEmptyIcon className="h-10 w-10 mx-auto mb-3 opacity-50" />}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {blockList.map(([blockId, meta]) => {
                  const countFeatures = (workspace.features?.features || []).filter(
                    (f) => f.properties?.blockId === blockId
                  ).length;

                  return (
                    <MapCard
                      key={blockId}
                      map={{
                        id: blockId,
                        name: meta.name,
                        imageUrl: meta.imageUrl,
                        features: workspace.features,
                        blockId: blockId,
                      }}
                      theme={theme}
                      onClick={() => navigate(`/map-editor/${blockId}`)}
                      showDelete
                      onDelete={handleDelete}
                      variant="editor"
                      footer={`${countFeatures} elemento(s) mapeado(s)`}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
      <PageFooter theme={theme} />
    </PageLayout>
  );
}