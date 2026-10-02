/**
 * MapCard — Card de exibição de mapa na galeria e na lista de administração.
 */
import { CloseIcon } from '../icons/Icons';
import { MapThumbPreview } from '../map/MapThumbPreview';

export function MapCard({
  map,
  theme,
  onClick,
  showDelete = false,
  onDelete,
  footer,
  variant = 'editor',
}) {
  const isDark = theme === 'dark';
  const cardBorderClass =
    variant === 'editor'
      ? isDark
        ? 'bg-[#0d203b] border border-white/10 hover:border-blue-400/40'
        : 'bg-white border border-[#1B2F55]/10 hover:border-[#4A7FD4]/40'
      : isDark
        ? 'bg-[#0d203b] border border-white/10'
        : 'bg-white border border-[#1B2F55]/10';

  const imgBgClass =
    variant === 'editor'
      ? isDark
        ? 'bg-[#1a3a6e]'
        : 'bg-[#6b8fc7]'
      : 'bg-[#1a3a6e]';

  return (
    <div
      onClick={onClick}
      className={`group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${cardBorderClass}`}
    >
      {showDelete && onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(map.id, e);
          }}
          className="absolute top-2 right-2 z-10 w-7 h-7 min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 rounded-full bg-black/50 text-white text-xs flex items-center justify-center hover:bg-red-500/80 cursor-pointer"
          title="Apagar mapa"
          aria-label="Apagar mapa"
        >
          <CloseIcon className="h-3.5 w-3.5" />
        </button>
      )}

      <div className={`aspect-[4/3] flex items-center justify-center overflow-hidden ${imgBgClass}`}>
        <MapThumbPreview map={map} theme={theme} />
      </div>

      <div className="p-3">
        <p className={`text-xs font-semibold truncate ${isDark ? 'text-white' : 'text-[#1B2F55]'}`}>
          {map.name}
        </p>
        {footer && (
          <div className={`text-[10px] mt-0.5 ${isDark ? 'text-white/50' : 'text-[#1B2F55]/50'}`}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}