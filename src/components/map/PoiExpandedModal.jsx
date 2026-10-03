/**
 * PoiExpandedModal — Modal expandido de um POI.
 * Mostra nome, tipo, galeria de fotos (múltiplas) e descrição completa.
 * Fecha no X, no backdrop ou com ESC.
 */
import { useEffect, useState } from 'react';
import { AccentButton } from '../ui/AccentButton';
import { GhostButton } from '../ui/GhostButton';
import { SpeakIcon, LibrasIcon, CloseIcon } from '../icons/Icons';

export function PoiExpandedModal({ theme, poi, onClose, onOuvir, onLibras }) {
  const isDark = theme === 'dark';
  const [imgIndex, setImgIndex] = useState(0);

  // Reset do índice ao trocar de POI
  useEffect(() => {
    setImgIndex(0);
  }, [poi?.properties?.id]);

  // ESC fecha
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Trava o scroll do body enquanto aberto
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  if (!poi) return null;

  const props = poi.properties || {};
  const photos = [
    ...(Array.isArray(props.photos) ? props.photos : []),
    ...(props.photoUrl ? [props.photoUrl] : []),
  ];
  const hasPhotos = photos.length > 0;
  const kind = poi.geometry?.type === 'Polygon' ? 'Sala' : 'Ponto';

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="poi-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Card */}
      <div
        className={`relative w-full max-w-3xl max-h-[92vh] sm:max-h-[85vh] flex flex-col rounded-2xl sm:rounded-[28px] border overflow-hidden shadow-2xl ${
          isDark ? 'bg-[#0d203b] border-white/10' : 'bg-white border-[#1B2F55]/10'
        }`}
      >
        {/* Header */}
        <div className={`flex items-start justify-between gap-3 px-5 sm:px-6 py-4 border-b ${isDark ? 'border-white/10' : 'border-[#1B2F55]/10'}`}>
          <div className="min-w-0 flex-1">
            <p className={`text-[11px] font-bold uppercase tracking-wide ${isDark ? 'text-white/50' : 'text-[#1B2F55]/50'}`}>
              {kind}
            </p>
            <h2
              id="poi-modal-title"
              className={`text-lg sm:text-2xl font-extrabold truncate ${isDark ? 'text-white' : 'text-[#1B2F55]'}`}
              title={props.name}
            >
              {props.name || 'Sem nome'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
              isDark
                ? 'bg-white/10 hover:bg-white/20 text-white'
                : 'bg-[#1B2F55]/10 hover:bg-[#1B2F55]/20 text-[#1B2F55]'
            }`}
            aria-label="Fechar"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Conteúdo com scroll */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {/* Galeria */}
          {hasPhotos && (
            <div className="px-5 sm:px-6 pt-4">
              <div className={`w-full aspect-video rounded-xl overflow-hidden ${isDark ? 'bg-white/5' : 'bg-[#1B2F55]/5'}`}>
                <img
                  src={photos[imgIndex]}
                  alt={props.name || 'Local'}
                  className="w-full h-full object-contain"
                />
              </div>

              {photos.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {photos.map((src, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setImgIndex(i)}
                      className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                        i === imgIndex
                          ? isDark ? 'border-[#4A7FD4]' : 'border-[#3F64A6]'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                      aria-label={`Foto ${i + 1}`}
                    >
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Descrição */}
          <div className="px-5 sm:px-6 py-5">
            {props.description ? (
              <p className={`text-sm sm:text-base leading-relaxed whitespace-pre-line ${isDark ? 'text-white/85' : 'text-[#1B2F55]/85'}`}>
                {props.description}
              </p>
            ) : (
              <p className={`text-sm italic ${isDark ? 'text-white/40' : 'text-[#1B2F55]/40'}`}>
                Sem descrição cadastrada.
              </p>
            )}
          </div>
        </div>

        {/* Footer com ações */}
        <div className={`px-5 sm:px-6 py-4 border-t flex flex-wrap gap-2 ${isDark ? 'border-white/10' : 'border-[#1B2F55]/10'}`}>
          <AccentButton onClick={() => onOuvir(poi)} size="sm" className="flex-1 min-w-[140px]">
            <SpeakIcon className="h-4 w-4 shrink-0" /> Ouvir descrição
          </AccentButton>
          <GhostButton theme={theme} onClick={() => onLibras(poi)} size="sm" className="flex-1 min-w-[140px]">
            <LibrasIcon className="h-4 w-4 shrink-0" /> Ver em Libras
          </GhostButton>
        </div>
      </div>
    </div>
  );
}