/**
 * RoutePanel — Painel para busca e traçado de rotas acessíveis entre pontos do mapa.
 */
import { panelClasses, inputClasses } from '../../lib/mapUi';
import { getFeatureCenter } from '../../lib/geo';
import { AccentButton } from '../ui/AccentButton';
import { RouteIcon, SuccessIcon, SpeakIcon } from '../icons/Icons';

export function RoutePanel({
  theme,
  listaPois,
  alvoAtivo,
  setAlvoAtivo,
  navOrigem,
  navDestino,
  setNavOrigem,
  setNavDestino,
  setPoiSelecionado,
  somenteAcessivel,
  setSomenteAcessivel,
  rotaPontos,
  rotaErro,
  rotaTexto,
  onOuvirRota,
  onLimpar,
}) {
  const isDark = theme === 'dark';
  const baseInput = inputClasses(theme, { size: 'sm' });

  function handlePoiSelect(nome, setTarget) {
    const f = listaPois.find((p) => p.properties.name === nome);
    if (f) {
      const center = getFeatureCenter(f);
      setTarget({
        id: f.properties.id,
        name: f.properties.name,
        lng: center?.lng,
        lat: center?.lat,
        feature: f,
      });
      setPoiSelecionado(f);
    } else {
      setTarget(nome ? { id: null, name: nome, lng: null, lat: null } : null);
    }
  }

  return (
    <div className={`rounded-2xl border p-4 ${panelClasses(theme)}`}>
      <p className={`text-sm font-bold mb-1 flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-[#1B2F55]'}`}>
        <RouteIcon className="h-4 w-4 shrink-0" /> Traçar rota
      </p>
      <p className={`text-[11px] mb-3 ${isDark ? 'text-white/50' : 'text-[#1B2F55]/50'}`}>
        Clique numa caixa abaixo e depois clique num local do mapa.
      </p>

      <datalist id="poi-list-nav">
        {listaPois.map((f) => (
          <option key={f.properties.id} value={f.properties.name} />
        ))}
      </datalist>

      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1">
          <span className={`font-semibold flex items-center gap-1.5 text-xs ${isDark ? 'text-white/70' : 'text-[#1B2F55]/70'}`}>
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500" />
            Origem
            {alvoAtivo === 'origem' && (
              <span className="ml-auto text-[10px] font-bold text-green-500">← clique no mapa</span>
            )}
          </span>
          <input
            list="poi-list-nav"
            value={navOrigem?.name || ''}
            onClick={() => setAlvoAtivo('origem')}
            onChange={(e) => handlePoiSelect(e.target.value, setNavOrigem)}
            placeholder="Clique aqui e depois no mapa…"
            className={`${baseInput} border-2 ${
              alvoAtivo === 'origem' ? 'border-green-500 ring-2 ring-green-500/30' : ''
            }`}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className={`font-semibold flex items-center gap-1.5 text-xs ${isDark ? 'text-white/70' : 'text-[#1B2F55]/70'}`}>
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500" />
            Destino
            {alvoAtivo === 'destino' && (
              <span className="ml-auto text-[10px] font-bold text-red-500">← clique no mapa</span>
            )}
          </span>
          <input
            list="poi-list-nav"
            value={navDestino?.name || ''}
            onClick={() => setAlvoAtivo('destino')}
            onChange={(e) => handlePoiSelect(e.target.value, setNavDestino)}
            placeholder="Clique aqui e depois no mapa…"
            className={`${baseInput} border-2 ${
              alvoAtivo === 'destino' ? 'border-red-500 ring-2 ring-red-500/30' : ''
            }`}
          />
        </label>

        <label
          className={`flex items-center gap-2 text-xs font-semibold cursor-pointer ${
            isDark ? 'text-white/70' : 'text-[#1B2F55]/70'
          }`}
        >
          <input
            type="checkbox"
            checked={somenteAcessivel}
            onChange={(e) => setSomenteAcessivel(e.target.checked)}
          />
          Somente rota acessível (sem escadas)
        </label>

        {rotaErro && <p className="text-xs text-red-400 font-medium">{rotaErro}</p>}
        {rotaTexto && !rotaErro && (
          <div>
            <p className="text-xs text-[#22c55e] font-medium flex items-center gap-1.5">
              <SuccessIcon className="h-4 w-4 text-[#22c55e] shrink-0" />
              <span>{rotaTexto}</span>
            </p>
            <AccentButton
              onClick={onOuvirRota}
              className="mt-2 w-full"
              size="sm"
            >
              <SpeakIcon className="h-4 w-4 shrink-0" /> Ouvir
            </AccentButton>
          </div>
        )}

        {(navOrigem || navDestino || rotaPontos) && (
          <button
            type="button"
            onClick={onLimpar}
            className={`w-full rounded-lg py-1.5 text-xs font-semibold min-h-11 min-w-11 lg:min-h-0 cursor-pointer ${
              isDark
                ? 'bg-white/10 text-white/80 hover:bg-white/15'
                : 'bg-[#1B2F55]/10 text-[#1B2F55] hover:bg-[#1B2F55]/15'
            }`}
          >
            Limpar rota
          </button>
        )}
      </div>
    </div>
  );
}
