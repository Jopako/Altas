/**
 * PoiForm — Formulário para edição de ponto de interesse com galeria unificada e geração de QR Code.
 */
import { useState } from "react";
import QRCode from "react-qr-code";
import { inputClasses, labelClasses } from "../../../lib/mapUi";
import { AccentButton } from "../../ui/AccentButton";
import { GhostButton } from "../../ui/GhostButton";

export function PoiForm({
  theme,
  selectedLayerKind,
  selectedBlockId,
  poiId,
  poiName,
  setPoiName,
  poiTipo,
  setPoiTipo,
  poiGallery,
  setPoiGallery,
  onPhotoUpload,
  onSave,
  onCancel,
}) {
  const [showQrModal, setShowQrModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const inputStyle = inputClasses(theme);
  const labelStyle = labelClasses(theme);
  const isDark = theme === 'dark';

  // Monta a URL de destino do QR Code
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const qrUrl = `${baseUrl}/map-viewer?bloco=${encodeURIComponent(selectedBlockId || '')}&poi=${encodeURIComponent(poiId || '')}`;

  // Baixa o QR Code gerado em formato PNG
  const downloadQrCode = () => {
    const svg = document.getElementById("poi-qr-code-svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      const padding = 24;
      canvas.width = img.width + padding * 2;
      canvas.height = img.height + padding * 2;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, padding, padding);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      const safeName = (poiName || poiId || 'local').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
      downloadLink.download = `qrcode-${safeName}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(qrUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(false);
    }
  };

  // Remove uma foto inteira (e sua descrição) da lista
  const removeGalleryItem = (index) => {
    setPoiGallery(poiGallery.filter((_, i) => i !== index));
  };

  // Atualiza a descrição de uma foto específica
  const updateDescription = (index, text) => {
    const updated = [...poiGallery];
    updated[index].description = text;
    setPoiGallery(updated);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* NOME */}
      <div>
        <label className={labelStyle}>Nome:</label>
        <input
          type="text"
          value={poiName}
          onChange={(e) => setPoiName(e.target.value)}
          placeholder="Nome do local..."
          className={inputStyle}
        />
      </div>

      {/* TIPO */}
      {selectedLayerKind === 'area' && (
        <div>
          <label className={labelStyle}>Tipo:</label>
          <select value={poiTipo} onChange={(e) => setPoiTipo(e.target.value)} className={inputStyle}>
            <option value="sala">Sala</option>
            <option value="banheiro">Banheiro</option>
            <option value="escada">Escada</option>
            <option value="elevador">Elevador</option>
            <option value="outro">Outro</option>
          </select>
        </div>
      )}

      {/* GALERIA (Fotos + Descrições) */}
      <div className="border-t pt-4 border-white/10">
        <label className={labelStyle}>Galeria (Foto + Descrição):</label>
        
        <div className="flex flex-col gap-3 mt-2 mb-3">
          {poiGallery.map((item, i) => (
            <div key={i} className={`p-3 rounded-lg flex flex-col gap-2 border ${isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
              {/* Imagem e botão de remover */}
              <div className="flex justify-between items-start gap-2">
                <img
                  src={item.photo}
                  alt={`Galeria ${i + 1}`}
                  className="w-20 h-20 object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={() => removeGalleryItem(i)}
                  className="text-red-400 hover:text-red-500 text-xs font-bold px-1"
                >
                  ✕ Remover
                </button>
              </div>
              
              {/* Texto da foto específica */}
              <textarea
                value={item.description}
                onChange={(e) => updateDescription(i, e.target.value)}
                placeholder="Digite a descrição para esta foto..."
                rows={2}
                className={`${inputStyle} text-sm w-full resize-y`}
              />
            </div>
          ))}
        </div>

        {/* Botão de adicionar foto */}
        <label className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold cursor-pointer w-full border-2 border-dashed transition-colors ${
          isDark ? 'bg-white/5 border-white/20 text-white hover:bg-white/10' : 'bg-black/5 border-black/20 text-[#1B2F55] hover:bg-black/10'
        }`}>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onPhotoUpload(e.target.files[0])}
            className="hidden"
          />
          + Adicionar Nova Foto
        </label>
      </div>

      {/* BOTÕES */}
      <div className="flex flex-col gap-2 mt-2">
        <AccentButton onClick={onSave} className="w-full">
          Salvar ponto de interesse
        </AccentButton>

        <button
          type="button"
          onClick={() => setShowQrModal(true)}
          className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
            isDark
              ? 'bg-blue-600/20 border-blue-500/40 text-blue-300 hover:bg-blue-600/30'
              : 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100'
          }`}
        >
          Gerar QR Code
        </button>

        <GhostButton theme={theme} onClick={onCancel} className="w-full" size="sm">
          Cancelar
        </GhostButton>
      </div>

      {/* MODAL DO QR CODE */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div
            className={`w-full max-w-sm rounded-2xl p-6 shadow-2xl border flex flex-col items-center gap-4 ${
              isDark ? 'bg-[#15233e] border-white/15 text-white' : 'bg-white border-black/10 text-slate-800'
            }`}
          >
            <div className="w-full flex items-center justify-between">
              <h3 className="font-bold text-base">QR Code do Local</h3>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="text-gray-400 hover:text-gray-200 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-center text-gray-400">
              Escaneie para abrir o mapa diretamente em <strong className={isDark ? "text-white" : "text-slate-900"}>{poiName || "este local"}</strong>.
            </p>

            {/* Container branco para garantir contraste perfeito no scan */}
            <div className="bg-white p-4 rounded-xl shadow-inner border border-gray-200 flex items-center justify-center">
              <QRCode
                id="poi-qr-code-svg"
                value={qrUrl}
                size={180}
                level="M"
              />
            </div>

            <div className="w-full text-center">
              <span className="text-[11px] block truncate px-2 py-1 rounded bg-black/5 dark:bg-white/5 text-gray-400 font-mono">
                {qrUrl}
              </span>
            </div>

            <div className="w-full flex flex-col gap-2 mt-2">
              <AccentButton onClick={downloadQrCode} className="w-full text-xs">
                Baixar QR Code (PNG)
              </AccentButton>
              
              <button
                type="button"
                onClick={handleCopyUrl}
                className={`w-full py-2 px-3 rounded-xl text-xs font-semibold border transition-colors ${
                  isDark
                    ? 'border-white/15 bg-white/5 hover:bg-white/10 text-white'
                    : 'border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                {copied ? '✓ Link copiado!' : 'Copiar Link'}
              </button>

              <GhostButton theme={theme} onClick={() => setShowQrModal(false)} className="w-full" size="sm">
                Fechar
              </GhostButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
