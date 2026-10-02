/**
 * EditorSidebar — Container lateral do editor para abrigar formulários e ferramentas.
 */
import { panelClasses } from "../../../lib/mapUi";
import { GhostButton } from "../../ui/GhostButton";
import { BackIcon } from "../../icons/Icons";

export function EditorSidebar({ theme, mapName, onBack, children }) {
  const isDark = theme === 'dark';

  return (
    <div
      className={`w-full h-full overflow-y-auto px-4 sm:px-6 py-5 sm:py-6 flex flex-col relative z-20 rounded-2xl sm:rounded-[28px] border ${panelClasses(
        theme
      )}`}
    >
      <div className="mb-4 flex items-center justify-between gap-2 min-w-0">
        <h2
          className={`text-lg sm:text-xl font-extrabold truncate ${isDark ? 'text-white' : 'text-[#1B2F55]'
            }`}
          title={mapName}
        >
          {mapName}
        </h2>
        {onBack && (
          <GhostButton
            theme={theme}
            onClick={onBack}
            size="sm"
            className="shrink-0"
          >
            <BackIcon className="h-4 w-4 shrink-0" /> Voltar
          </GhostButton>
        )}
      </div>

      <div className="flex-1 flex flex-col min-h-0">{children}</div>
    </div>
  );
}