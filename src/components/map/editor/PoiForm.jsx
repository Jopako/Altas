/**
 * PoiForm — Formulário para edição de ponto de interesse (área ou ponto específico).
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
  poiDescription,
  setPoiDescription,
  poiPhotoUrl,
  onPhotoUpload,
  onSave,
  onCancel,
}) {
  const inputStyle = inputClasses(theme);
  const labelStyle = labelClasses(theme);

  return (
    <div className="flex flex-col gap-4">
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

      {selectedLayerKind === 'area' && (
        <div>
          <label className={labelStyle}>Tipo:</label>
          <select
            value={poiTipo}
            onChange={(e) => setPoiTipo(e.target.value)}
            className={inputStyle}
          >
            <option value="sala">Sala</option>
            <option value="banheiro">Banheiro</option>
            <option value="escada">Escada</option>
            <option value="elevador">Elevador</option>
            <option value="outro">Outro</option>
          </select>
        </div>
      )}

      <div>
        <label className={labelStyle}>Descrição:</label>
        <textarea
          value={poiDescription}
          onChange={(e) => setPoiDescription(e.target.value)}
          placeholder="Descrição do local..."
          rows={4}
          className={`${inputStyle} resize-vertical`}
        />
      </div>

      {poiPhotoUrl && (
        <img
          src={poiPhotoUrl}
          alt="foto"
          className="w-full rounded-lg object-cover max-h-[140px] border border-white/10"
        />
      )}

      <label className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold cursor-pointer bg-[#4A7FD4] text-white w-fit min-h-11 min-w-11 sm:min-h-0 sm:min-w-0">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => onPhotoUpload(e.target.files[0])}
          className="hidden"
        />
        Adicionar foto
      </label>

      <AccentButton onClick={onSave} className="w-full">
        Salvar ponto de interesse
      </AccentButton>

      <GhostButton theme={theme} onClick={onCancel} className="w-full" size="sm">
        Cancelar
      </GhostButton>
    </div>
  );
}
