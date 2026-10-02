/**
 * MapGallery — Galeria institucional de mapas cadastrados para visualização.
 */
import { PageLayout } from '../layout/PageLayout';
import { PageHeader } from '../layout/PageHeader';
import { PageFooter } from '../layout/PageFooter';
import { MapCard } from '../ui/MapCard';
import { EmptyState } from '../ui/EmptyState';

export function MapGallery({ theme, setTheme, mapList, onOpenMap }) {
  const isDark = theme === 'dark';

  return (
    <PageLayout theme={theme}>
      <PageHeader theme={theme} setTheme={setTheme} />
      <main className="relative z-10 flex-1 px-4 sm:px-10 lg:px-16 pb-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h2 className={`text-2xl sm:text-3xl font-extrabold ${isDark ? 'text-white' : 'text-[#1B2F55]'}`}>
            Mapas da Instituição
          </h2>
        </div>

        <div className={`rounded-2xl p-4 sm:p-8 ${isDark ? 'bg-[#0f2346]/80 border border-white/10' : 'bg-[#c0cfe6]/50 border border-[#1B2F55]/10'}`}>
          {mapList.length === 0 ? (
            <EmptyState theme={theme} message="Nenhum mapa disponível ainda." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {mapList.map((map) => (
                <MapCard
                  key={map.id}
                  map={map}
                  theme={theme}
                  onClick={() => onOpenMap(map.id)}
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
