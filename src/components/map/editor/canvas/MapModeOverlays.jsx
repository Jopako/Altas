/** Avisos flutuantes no topo do mapa conforme o modo ativo. */
export function MapModeOverlays({ isMovingBlock, isGlobalMode }) {
  return (
    <>
      {isMovingBlock && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] px-3 py-1.5 rounded-full bg-[#F59E0B] text-white text-xs font-semibold shadow-lg pointer-events-none">
          Arraste o retângulo laranja do bloco selecionado
        </div>
      )}
      {isGlobalMode && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] px-3 py-1.5 rounded-full bg-blue-600 text-white text-xs font-semibold shadow-lg pointer-events-none">
          Modo Global — Desenhando conexões entre blocos
        </div>
      )}
    </>
  );
}
