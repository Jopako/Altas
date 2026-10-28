/**
 * RoutePanel — Painel para busca e traçado de rotas, com modo minimizado.
 */
import { useState, useEffect } from 'react';
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
  rotaPontos,
  rotaErro,
  rotaTexto,
  onOuvirRota,
  onLimpar,
  isOpen,     
  setIsOpen,  
}) {
  const isDark = theme === 'dark';
  const baseInput = inputClasses(theme, { size: 'sm' });

  // Se o usuário traçar uma rota pelo mapa, abre o painel sozinho
  useEffect(() => {
    if (navOrigem || navDestino) {
      setIsOpen(true);
    }
  }, [navOrigem, navDestino, setIsOpen]);

  // Função pra minimizar o painel e limpar a rota
  const handleClose = () => {
    setIsOpen(false);
    onLimpar(); 
  };

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

  // SE ESTIVER FECHADO: Mostra só o botão de abrir
  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`w-full rounded-2xl border p-4 flex items-center gap-2 transition-colors group cursor-pointer ${panelClasses(theme)} hover:border-blue-500/50`}
      >
        <RouteIcon className={`h-5 w-5 shrink-0 ${isDark ? 'text-white/70' : 'text-[#1B2F55]/70'}`} />
        <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-[#1B2F55]'}`}>
          Traçar Rota
        </span>
      </button>
    );
  }

  // SE ESTIVER ABERTO: Mostra o painel completo
  return (
    <div className={`rounded-2xl border p-4 transition-all duration-300 ${panelClasses(theme)}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className={`text-sm font-bold mb-1 flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-[#1B2F55]'}`}>
            <RouteIcon className="h-4 w-4 shrink-0" /> Traçar rota
          </p>
          <p className={`text-[11px] ${isDark ? 'text-white/50' : 'text-[#1B2F55]/50'}`}>
            Clique numa caixa abaixo e depois em um local.
          </p>
        </div>
        
        {/* Botão de minimizar (traço) */}
        <button
          onClick={handleClose}
          className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
            isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-[#1B2F55]/10 hover:bg-[#1B2F55]/20 text-[#1B2F55]'
          }`}
          title="Minimizar e limpar rota"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
      </div>

      <datalist id="poi-list-nav">
        {listaPois.map((f) => (
          <option key={f.properties.id} value={f.properties.name} />
        ))}
      </datalist>

      <div className="flex flex-col gap-3">
        {/* ORIGEM */}
        <label className="flex flex-col gap-1">
          <span className={`font-semibold flex items-center gap-1.5 text-xs ${isDark ? 'text-white/70' : 'text-[#1B2F55]/70'}`}>
            Origem
            {alvoAtivo === 'origem' && (
              <span className="ml-auto text-[10px] font-bold text-[#EF4444]">← clique no local</span>
            )}
          </span>
          <input
            list="poi-list-nav"
            value={navOrigem?.name || ''}
            onClick={() => setAlvoAtivo('origem')}
            onChange={(e) => handlePoiSelect(e.target.value, setNavOrigem)}
            placeholder="Clique aqui e depois em um local…"
            className={`${baseInput} border-2 ${
              alvoAtivo === 'origem' ? 'border-[#EF4444] ring-2 ring-[#EF4444]/30' : ''
            }`}
          />
        </label>

        {/* DESTINO */}
        <label className="flex flex-col gap-1">
          <span className={`font-semibold flex items-center gap-1.5 text-xs ${isDark ? 'text-white/70' : 'text-[#1B2F55]/70'}`}>
            Destino
            {alvoAtivo === 'destino' && (
              <span className="ml-auto text-[10px] font-bold text-[#3B82F6]">← clique no local</span>
            )}
          </span>
          <input
            list="poi-list-nav"
            value={navDestino?.name || ''}
            onClick={() => setAlvoAtivo('destino')}
            onChange={(e) => handlePoiSelect(e.target.value, setNavDestino)}
            placeholder="Clique aqui e depois em um local…"
            className={`${baseInput} border-2 ${
              alvoAtivo === 'destino' ? 'border-[#3B82F6] ring-2 ring-[#3B82F6]/30' : ''
            }`}
          />
        </label>

        {/* ERRO E SUCESSO */}
        {rotaErro && <p className="text-xs text-[#EF4444] font-medium">{rotaErro}</p>}
        
        {rotaTexto && !rotaErro && (
          <div>
            <p className="text-xs text-[#3B82F6] font-medium flex items-center gap-1.5">
              <SuccessIcon className="h-4 w-4 text-[#3B82F6] shrink-0" />
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

        {/* BOTÃO LIMPAR */}
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