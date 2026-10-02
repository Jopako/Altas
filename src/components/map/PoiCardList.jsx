/**
 * PoiCardList — Lista de cards clicáveis de todos os locais (POIs) do mapa.
 */
import { panelClasses } from '../../lib/mapUi';
import { AccentButton } from '../ui/AccentButton';
import { GhostButton } from '../ui/GhostButton';
import { SpeakIcon, LibrasIcon } from '../icons/Icons';

export function PoiCardList({ theme, pois, poiSelecionado, onSelectPoi, onOuvir, onLibras }) {
  const isDark = theme === 'dark';

  if (!pois || pois.length === 0) {
    return (
      <div className={`rounded-2xl border p-4 ${panelClasses(theme)}`}>
        <p className={`text-sm ${isDark ? 'text-white/50' : 'text-[#1B2F55]/50'}`}>
          Nenhum local cadastrado neste mapa.
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border p-3 sm:p-4 ${panelClasses(theme)}`}>
      <p className={`text-xs font-bold uppercase tracking-wide mb-3 ${isDark ? 'text-white/50' : 'text-[#1B2F55]/50'}`}>
        Locais ({pois.length})
      </p>
      <div className="flex flex-col gap-2">
        {pois.map((poi) => {
          const isSelected = poiSelecionado?.properties?.id === poi.properties?.id;
          const hasPhoto = !!poi.properties?.photoUrl;
          const kind = poi.geometry?.type === 'Polygon' ? 'Sala' : 'Ponto';

          const handleSelect = () => onSelectPoi(poi);
          const handleKey = (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleSelect();
            }
          };

          return (
            <div
              key={poi.properties?.id || poi.properties?.name}
              role="button"
              tabIndex={0}
              onClick={handleSelect}
              onKeyDown={handleKey}
              className={`w-full text-left rounded-xl flex flex-col transition-all cursor-pointer border overflow-hidden ${isSelected
                  ? isDark
                    ? 'bg-[#4A7FD4]/20 border-[#4A7FD4]/50 ring-1 ring-[#4A7FD4]/30'
                    : 'bg-[#3F64A6]/10 border-[#3F64A6]/40 ring-1 ring-[#3F64A6]/20'
                  : isDark
                    ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                    : 'bg-[#1B2F55]/5 border-[#1B2F55]/10 hover:bg-[#1B2F55]/10 hover:border-[#1B2F55]/20'
                }`}
            >
              <div className="p-3 flex items-center gap-3">
                {hasPhoto && (
                  <img
                    src={poi.properties.photoUrl}
                    alt={poi.properties.name || 'Local'}
                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-[#1B2F55]'}`}>
                    {poi.properties?.name || 'Sem nome'}
                  </p>
                  <p className={`text-[11px] ${isDark ? 'text-white/40' : 'text-[#1B2F55]/40'}`}>
                    {kind}
                  </p>
                </div>
              </div>

              {isSelected && (
                <div className="px-3 pb-3 flex flex-col gap-3">
                  {poi.properties?.description && (
                    <p className={`text-sm ${isDark ? 'text-white/80' : 'text-[#1B2F55]/80'}`}>
                      {poi.properties.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <AccentButton
                      onClick={(e) => { e.stopPropagation(); onOuvir(poi); }}
                      size="sm"
                      className="flex-1"
                    >
                      <SpeakIcon className="h-4 w-4 shrink-0" /> Ouvir
                    </AccentButton>
                    <GhostButton
                      theme={theme}
                      onClick={(e) => { e.stopPropagation(); onLibras(poi); }}
                      size="sm"
                      className="flex-1"
                    >
                      <LibrasIcon className="h-4 w-4 shrink-0" /> Libras
                    </GhostButton>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}