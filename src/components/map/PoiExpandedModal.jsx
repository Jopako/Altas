import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AccentButton } from '../ui/AccentButton';
import { SpeakIcon, CloseIcon } from '../icons/Icons';
import { playTextToSpeech, stopTextToSpeech } from '../../lib/tts';

export function PoiExpandedModal({ theme, poi, onClose }) {
  const isDark = theme === 'dark';
  const [imgIndex, setImgIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Guard de tempo usando ref para resistir ao ciclo do Leaflet sem atrasar a renderização
  const mountTimeRef = useRef(Date.now());

  const props = poi?.properties || {};
  
  const gallery = props.gallery?.length > 0 
    ? props.gallery 
    : (props.photoUrl ? [{ photo: props.photoUrl, description: props.description }] : []);

  const hasPhotos = gallery.length > 0;
  const tipoSalvo = props.tipo; 
  const kind = tipoSalvo 
    ? tipoSalvo.charAt(0).toUpperCase() + tipoSalvo.slice(1) 
    : (poi?.geometry?.type === 'Polygon' ? 'Sala' : 'Ponto');

  const [hasSpokenTitle, setHasSpokenTitle] = useState(false);

  useEffect(() => {
    mountTimeRef.current = Date.now();
  }, [poi?.properties?.id]);

  useEffect(() => {
    setImgIndex(0);
  }, [poi?.properties?.id]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (hasPhotos) {
        if (e.key === 'ArrowRight') setImgIndex((i) => (i + 1) % gallery.length);
        if (e.key === 'ArrowLeft') setImgIndex((i) => (i - 1 + gallery.length) % gallery.length);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, hasPhotos, gallery.length]);

  useEffect(() => {
    stopTextToSpeech();
    setIsPlaying(false);
  }, [imgIndex, poi?.properties?.id]);
  useEffect(() => () => stopTextToSpeech(), []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  useEffect(() => {
  setImgIndex(0);
  setHasSpokenTitle(false);
}, [poi?.properties?.id]);

   const handleOuvir = async () => {
    if (isPlaying) {
      stopTextToSpeech();
      setIsPlaying(false);
      return;
    }
    const nome = props.name?.trim() || '';
    const descricao = gallery[imgIndex]?.description?.trim() || '';

    if (!nome && !descricao) {
      return alert('Sem nome e sem descrição para ouvir.');
    }
    let textoParaFalar = '';
    if (!hasSpokenTitle) {
      textoParaFalar = descricao ? `${nome}. ${descricao}` : nome;
      setHasSpokenTitle(true); // Marca que o título já foi falado
    } else {
      textoParaFalar = descricao ? descricao : 'Sem descrição para esta foto.';
    }

    try {
      setIsPlaying(true);
      await playTextToSpeech(textoParaFalar);
    } catch {
      alert('Erro ao reproduzir áudio.');
    } finally {
      setIsPlaying(false);
    }
  };

  const nextImg = () => setImgIndex((i) => (i + 1) % gallery.length);
  const prevImg = () => setImgIndex((i) => (i - 1 + gallery.length) % gallery.length);

  if (!poi) return null;

  const handleBackdropClick = (e) => {
    e.stopPropagation();
    // Bloqueia tentativas de fechar ocorridas nos primeiros 250ms após a montagem do modal
    const elapsedTime = Date.now() - mountTimeRef.current;
    if (elapsedTime < 250) {
      return;
    }
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="poi-modal-title"
    >
      {/* Backdrop isolado contra mousedown/mouseup do Leaflet */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onMouseDown={(e) => e.stopPropagation()}
        onClick={handleBackdropClick} 
      />

      {/* Card com stopPropagation */}
      <div
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        className={`relative w-full max-w-3xl max-h-[92vh] sm:max-h-[85vh] flex flex-col rounded-2xl sm:rounded-[28px] border overflow-hidden shadow-2xl ${
          isDark ? 'bg-[#0d203b] border-white/10' : 'bg-white border-[#1B2F55]/10'
        }`}
      >
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
              isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-[#1B2F55]/10 hover:bg-[#1B2F55]/20 text-[#1B2F55]'
            }`}
            aria-label="Fechar"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          {hasPhotos && (
            <div className="relative px-5 sm:px-6 pt-4 pb-2">
              <div className={`w-full aspect-video rounded-xl overflow-hidden relative group ${isDark ? 'bg-[#071427]' : 'bg-[#edf3f9]'}`}>
                <img
                  src={gallery[imgIndex].photo}
                  alt={`${props.name || 'Local'} - Foto ${imgIndex + 1}`}
                  className="w-full h-full object-contain transition-opacity duration-300"
                />
                
                {gallery.length > 1 && (
                  <>
                    <button
                      onClick={prevImg}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={nextImg}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
              </div>

              {gallery.length > 1 && (
                <div className="flex justify-center gap-1.5 mt-3">
                  {gallery.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIndex(i)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        i === imgIndex
                          ? isDark ? 'bg-[#4A7FD4] w-4' : 'bg-[#3F64A6] w-4'
                          : isDark ? 'bg-white/20 hover:bg-white/40' : 'bg-[#1B2F55]/20 hover:bg-[#1B2F55]/40'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="px-5 sm:px-6 py-5">
            {hasPhotos && gallery[imgIndex]?.description ? (
              <p className={`text-sm sm:text-base leading-relaxed whitespace-pre-line ${isDark ? 'text-white/85' : 'text-[#1B2F55]/85'}`}>
                {gallery[imgIndex].description}
              </p>
            ) : (
              <p className={`text-sm italic ${isDark ? 'text-white/40' : 'text-[#1B2F55]/40'}`}>
                Sem descrição cadastrada.
              </p>
            )}
          </div>
        </div>

        <div className={`px-5 sm:px-6 py-4 border-t flex ${isDark ? 'border-white/10' : 'border-[#1B2F55]/10'}`}>
          <AccentButton onClick={handleOuvir} size="sm" className="w-full">
            <SpeakIcon className="h-4 w-4 shrink-0" /> {isPlaying ? 'Parar áudio' : 'Ouvir descrição'}
          </AccentButton>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}