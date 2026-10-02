/**
 * CorridorForm — Formulário para edição de propriedades do corredor (largura da faixa e acessibilidade).
 */
import { AccentButton } from "../../ui/AccentButton";
import { GhostButton } from "../../ui/GhostButton";

export function CorridorForm({
  theme,
  poiLargura,
  setPoiLargura,
  poiAcessivel,
  setPoiAcessivel,
  onSave,
  onCancel,
}) {
  const isDark = theme === 'dark';

  return (
    <div className="flex flex-col gap-4">
      <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#0f2346] border-white/10' : 'bg-white border-[#1B2F55]/15'}`}>
        <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-[#1B2F55]'}`}>
          Corredor
        </p>

        <div className="mt-4">
          <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-white' : 'text-[#1B2F55]'}`}>
            Largura da faixa: <span className="text-[#F59E0B]">{poiLargura}px</span>
          </label>
          <input
            type="range"
            min="20"
            max="200"
            step="5"
            value={poiLargura}
            onChange={(e) => setPoiLargura(Number(e.target.value))}
            className="w-full accent-[#F59E0B] cursor-pointer"
          />
          <div className="flex justify-between mt-1">
            <span className={`text-[10px] ${isDark ? 'text-white/40' : 'text-[#1B2F55]/40'}`}>20</span>
            <span className={`text-[10px] ${isDark ? 'text-white/40' : 'text-[#1B2F55]/40'}`}>200</span>
          </div>
          <p className={`text-[11px] mt-2 ${isDark ? 'text-white/40' : 'text-[#1B2F55]/40'}`}>
            A faixa aparece em tempo real no mapa. A rota sempre segue o eixo.
          </p>
        </div>

        <label className="flex items-center gap-2 mt-4 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={poiAcessivel}
            onChange={(e) => setPoiAcessivel(e.target.checked)}
          />
          <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-[#1B2F55]'}`}>
            Rota acessível (sem escadas)
          </span>
        </label>
      </div>

      <AccentButton onClick={onSave} className="w-full">
        Salvar corredor
      </AccentButton>
      <GhostButton theme={theme} onClick={onCancel} className="w-full" size="sm">
        Cancelar
      </GhostButton>
    </div>
  );
}
