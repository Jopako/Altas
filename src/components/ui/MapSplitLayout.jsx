/**
 * MapSplitLayout — Casca unificada de mapa + painel.
 * - Desktop (lg+): lado a lado (igual antes).
 * - Mobile (<lg): mapa em tela cheia + bottom sheet deslizável com o painel.
 */
import { shellOuterClasses } from "../../lib/mapUi";
import { MobileBottomSheet } from "../ui/MobileBottomSheet";

export function MapSplitLayout({
  theme,
  panel,
  map,
  panelWidth = 'viewer',
  panelPosition = 'left',
  overlay = null,
}) {
  const isViewer = panelWidth === 'viewer';
  const panelWidthClass = isViewer ? 'lg:w-[60%]' : 'lg:w-[400px]';
  const mapWidthClass = isViewer ? 'lg:w-[40%] lg:flex-none' : '';
  const isPanelLeft = panelPosition === 'left';

  return (
    <main className={`relative z-10 flex-1 min-h-0 overflow-hidden flex flex-col ${shellOuterClasses(theme)}`}>
      {overlay}

      {/* ===== MOBILE: mapa full + bottom sheet ===== */}
      <div className="lg:hidden relative flex-1 min-h-0">
        <div className="absolute inset-0 p-3 sm:p-4">
          {map}
        </div>
        <MobileBottomSheet theme={theme}>
          {panel}
        </MobileBottomSheet>
      </div>

      {/* ===== DESKTOP: layout original ===== */}
      <div className="hidden lg:flex mx-auto h-full w-full max-w-[1600px] lg:flex-row gap-3 sm:gap-4 p-3 sm:px-6 sm:pb-4 sm:pt-2 lg:px-10 lg:pb-6 lg:pt-4 min-h-0 flex-1">
        <div
          className={`w-full ${panelWidthClass} flex-shrink-0 ${isPanelLeft ? 'lg:order-1' : 'lg:order-2'
            } lg:h-full overflow-y-auto min-h-0 flex flex-col`}
        >
          {panel}
        </div>

        <div
          className={`flex-1 lg:min-h-0 relative ${isPanelLeft ? 'lg:order-2' : 'lg:order-1'
            } h-full ${mapWidthClass}`}
        >
          {map}
        </div>
      </div>
    </main>
  );
}