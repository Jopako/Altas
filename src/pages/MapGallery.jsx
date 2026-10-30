import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { PageLayout } from "../components/layout/PageLayout";
import { PageHeader } from "../components/layout/PageHeader";
import { PageFooter } from "../components/layout/PageFooter";
import { MapCard } from "../components/ui/MapCard";
import { EmptyState } from "../components/ui/EmptyState";
import { useTheme } from "../hooks/useTheme";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

export function MapGallery() {
  const navigate = useNavigate();
  const [theme, setTheme] = useTheme();
  const isDark = theme === "dark";
  
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await axios.get(`${API_BASE}/api/workspaces/public`);
        setWorkspace(res.data);
      } catch (err) {
        console.error("Erro ao carregar workspace público:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <PageLayout theme={theme}>
      <PageHeader theme={theme} setTheme={setTheme} />
      <main className="relative z-10 flex-1 px-4 sm:px-10 lg:px-16 pb-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h2 className={`text-2xl sm:text-3xl font-extrabold ${isDark ? "text-white" : "text-[#1B2F55]"}`}>
            Blocos da Instituição
          </h2>
        </div>

        <div className={`rounded-2xl p-4 sm:p-8 ${isDark ? "bg-[#0f2346]/80 border border-white/10" : "bg-[#c0cfe6]/50 border border-[#1B2F55]/10"}`}>
          {loading ? (
            <p className={`text-sm ${isDark ? "text-white/50" : "text-[#1B2F55]/50"}`}>Carregando blocos...</p>
          ) : !workspace || Object.keys(workspace.blockMeta || {}).length === 0 ? (
            <EmptyState theme={theme} message="Nenhum bloco disponível ainda." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {Object.entries(workspace.blockMeta).map(([blockId, meta]) => (
                <MapCard
                  key={blockId}
                  map={{
                    id: blockId,
                    name: meta.name || blockId,
                    imageUrl: meta.imageUrl,
                    features: workspace.features,
                    blockId: blockId,
                  }}
                  theme={theme}
                  // Passando o blockId na URL
                  onClick={() => navigate(`/map-viewer?bloco=${blockId}`)}
                  variant="viewer"
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <PageFooter theme={theme} />
    </PageLayout>
  );
}