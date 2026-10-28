/**
 * PoiForm — Formulário para edição de ponto de interesse com galeria unificada.
 */
import { inputClasses, labelClasses } from "../../../lib/mapUi";
import { AccentButton } from "../../ui/AccentButton";
import { GhostButton } from "../../ui/GhostButton";

export function PoiForm({
  theme,
  selectedLayerKind,
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
  const inputStyle = inputClasses(theme);
  const labelStyle = labelClasses(theme);
  const isDark = theme === 'dark';

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
        <GhostButton theme={theme} onClick={onCancel} className="w-full" size="sm">
          Cancelar
        </GhostButton>
      </div>
    </div>
  );
}