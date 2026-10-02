/**
 * DraftActions — Botões de ação para rascunhos em andamento de polígono ou corredor.
 */
import { AccentButton } from "../../ui/AccentButton";
import { GhostButton } from "../../ui/GhostButton";

export function DraftActions({
  theme,
  activeTool,
  drawingPoints,
  onFinishPolygon,
  onFinishPath,
  onClear,
}) {
  if (drawingPoints.length < 2) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {activeTool === 'polygon' && (
        <AccentButton onClick={onFinishPolygon} size="sm">
          Finalizar área
        </AccentButton>
      )}
      {activeTool === 'path' && (
        <AccentButton onClick={onFinishPath} size="sm">
          Finalizar corredor
        </AccentButton>
      )}
      <GhostButton theme={theme} onClick={onClear} size="sm">
        Limpar pontos
      </GhostButton>
    </div>
  );
}
