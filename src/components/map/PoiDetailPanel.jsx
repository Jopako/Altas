/**
 * PoiDetailPanel — Exibe detalhes do ponto de interesse selecionado (nome, foto, descrição, audiodescrição e Libras).
 */
import { panelClasses } from '../../lib/mapUi';
import { AccentButton } from '../ui/AccentButton';
import { GhostButton } from '../ui/GhostButton';
import { SpeakIcon, LibrasIcon } from '../icons/Icons';

export function PoiDetailPanel({ theme, poiSelecionado, onOuvir, onLibras }) {
  const isDark = theme === 'dark';

  return (
    <div className={`rounded-2xl border p-4 ${panelClasses(theme)}`}>
      {poiSelecionado ? (
        <>
          <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${isDark ? 'text-white/50' : 'text-[#1B2F55]/50'}`}>
            Local selecionado
          </p>
          <p className={`text-lg font-extrabold mb-2 ${isDark ? 'text-white' : 'text-[#1B2F55]'}`}>
            {poiSelecionado.properties.name}
          </p>
          {poiSelecionado.properties.photoUrl && (
            <img
              src={poiSelecionado.properties.photoUrl}
              alt={poiSelecionado.properties.name || "Foto do local"}
              className="w-full rounded-lg object-cover max-h-[140px] mb-2"
            />
          )}
          <p className={`text-sm mb-3 ${isDark ? 'text-white/70' : 'text-[#1B2F55]/70'}`}>
            {poiSelecionado.properties.description || 'Sem descrição cadastrada.'}
          </p>
          <div className="flex gap-2">
            <AccentButton
              onClick={onOuvir}
              className="flex-1"
              size="sm"
            >
              <SpeakIcon className="h-4 w-4 shrink-0" /> Ouvir
            </AccentButton>
            <GhostButton
              theme={theme}
              onClick={onLibras}
              className="flex-1"
              size="sm"
            >
              <LibrasIcon className="h-4 w-4 shrink-0" /> Libras
            </GhostButton>
          </div>
        </>
      ) : (
        <p className={`text-sm ${isDark ? 'text-white/50' : 'text-[#1B2F55]/50'}`}>
          Toque numa sala ou ponto do mapa para ver a descrição.
        </p>
      )}
    </div>
  );
}
