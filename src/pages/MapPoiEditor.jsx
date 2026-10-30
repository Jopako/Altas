import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from '../hooks/useTheme';
import { usePoiEditor } from '../hooks/usePoiEditor';
import { PageLayout, PageHeader } from '../components/PageLayout';
import { MapSplitLayout } from '../components/ui/MapSplitLayout';
import { GhostButton } from '../components/ui/GhostButton';
import { AccentButton } from '../components/ui/AccentButton';
import { BackIcon, SaveIcon } from '../components/icons/Icons';
import { EditorSidebar } from '../components/map/editor/EditorSidebar';
import { EditorCanvas } from '../components/map/editor/EditorCanvas';
import { ToolPicker } from '../components/map/editor/ToolPicker';
import { DraftActions } from '../components/map/editor/DraftActions';
import { CorridorForm } from '../components/map/editor/CorridorForm';
import { PoiForm } from '../components/map/editor/PoiForm';

export default function MapPoiEditor() {
  const { blockId } = useParams(); 
  const navigate = useNavigate();
  const [theme, setTheme] = useTheme();
  const [mapData, setMapData] = useState(null);

  const {
    workspace, loading, selectedBlockId, setSelectedBlockId,
    selectedLayerKey, selectedLayerKind, activeTool, setActiveTool,
    drawingPoints, setDrawingPoints, poiName, setPoiName, poiTipo, setPoiTipo,
    poiGallery, setPoiGallery, poiAcessivel, setPoiAcessivel,
    poiLargura, setPoiLargura, savingMap, featureGroupRef, selectedLayerRef,
    selectLayerHandlerRef, selectLayer, clearPoiForm, applyPoiChanges,
    selectMappingTool, finishPolygonDraft, finishPathDraft, saveFeatures, handlePoiPhotoUpload,
  } = usePoiEditor(setMapData);

  // 
  useEffect(() => {
    if (blockId && blockId !== selectedBlockId) {
      setSelectedBlockId(blockId);
    }
  }, [blockId, selectedBlockId, setSelectedBlockId]);

  if (loading || !workspace) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d203b] text-white">
        <p>Carregando editor...</p>
      </div>
    );
  }

  const blocksList = Object.entries(workspace.blockMeta || {});

  return (
    <PageLayout theme={theme} fullBleed>
      <PageHeader theme={theme} setTheme={setTheme} />
      
      <div className="relative z-10 px-4 sm:px-10 pt-4 sm:pt-3 pb-4 sm:pb-4">
        <GhostButton theme={theme} variant="overlay" size="sm" onClick={() => navigate("/map-editor")}>
          <BackIcon className="h-4 w-4 shrink-0" /> Voltar
        </GhostButton>
      </div>

      <MapSplitLayout
        theme={theme}
        panelPosition="left"
        panelWidth="editor"
        panel={
          <EditorSidebar theme={theme} mapName={workspace.name || "Workspace"}>
            {/* Seletor de Bloco Ativo */}
            <div className="mb-4">
              <label className="text-xs font-semibold mb-1 block text-white/70">Bloco em Edição:</label>
              <select
                value={selectedBlockId || ""}
                onChange={(e) => {
                  const newId = e.target.value || null;
                  setSelectedBlockId(newId);
                  // Atualiza a URL quando o usuário troca o bloco pelo select
                  if (newId) navigate(`/map-editor/${newId}`);
                  else navigate('/map-editor');
                }}
                className="w-full p-2 rounded-lg bg-black/20 text-white border border-white/10 text-sm outline-none"
              >
                <option value="">Selecione um bloco...</option>
                {blocksList.map(([id, meta]) => (
                  <option key={id} value={id}>{meta.name || id}</option>
                ))}
              </select>
            </div>

            {!selectedBlockId ? (
              <p className="text-sm text-white/50 italic">Selecione um bloco acima para começar a editar.</p>
            ) : selectedLayerKey ? (
              selectedLayerKind === 'edge' ? (
                <CorridorForm
                  theme={theme}
                  poiLargura={poiLargura}
                  setPoiLargura={setPoiLargura}
                  poiAcessivel={poiAcessivel}
                  setPoiAcessivel={setPoiAcessivel}
                  onSave={applyPoiChanges}
                  onCancel={clearPoiForm}
                />
              ) : (
                <PoiForm
                  theme={theme}
                  selectedLayerKind={selectedLayerKind}
                  poiName={poiName}
                  setPoiName={setPoiName}
                  poiTipo={poiTipo}
                  setPoiTipo={setPoiTipo}
                  poiGallery={poiGallery}
                  setPoiGallery={setPoiGallery}
                  onPhotoUpload={handlePoiPhotoUpload}
                  onSave={applyPoiChanges}
                  onCancel={clearPoiForm}
                />
              )
            ) : (
              <div className="flex-1 flex flex-col gap-4">
                <p className={`text-sm ${theme === 'dark' ? 'text-white/50' : 'text-[#1B2F55]/50'}`}>
                  Use as ferramentas abaixo para criar um ponto, uma área ou um corredor no bloco selecionado.
                </p>
                <ToolPicker theme={theme} activeTool={activeTool} onSelectTool={selectMappingTool} />
                <DraftActions
                  theme={theme}
                  activeTool={activeTool}
                  drawingPoints={drawingPoints}
                  onFinishPolygon={finishPolygonDraft}
                  onFinishPath={finishPathDraft}
                  onClear={() => setDrawingPoints([])}
                />
                <AccentButton onClick={saveFeatures} disabled={savingMap} className="w-full mt-auto">
                  {savingMap ? 'Salvando...' : <><SaveIcon className="h-4 w-4 shrink-0" /> Salvar Workspace</>}
                </AccentButton>
              </div>
            )}
          </EditorSidebar>
        }
        map={
          <EditorCanvas
            theme={theme}
            mapData={workspace}
            activeBlockId={selectedBlockId}
            activeTool={activeTool}
            featureGroupRef={featureGroupRef}
            selectedLayerRef={selectedLayerRef}
            selectLayerHandlerRef={selectLayerHandlerRef}
            setActiveTool={setActiveTool}
            drawingPoints={drawingPoints}
            setDrawingPoints={setDrawingPoints}
            finishPolygonDraft={finishPolygonDraft}
            finishPathDraft={finishPathDraft}
            poiLargura={poiLargura}
            selectLayer={selectLayer}
          />
        }
      />
    </PageLayout>
  );
}