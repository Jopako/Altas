/**
 * MapPoiEditor — Orquestração do editor de pontos de interesse, áreas e corredores da planta.
 * Utiliza MapSplitLayout para responsividade mobile/desktop e persiste via mapsStorage.
 */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from '../hooks/useTheme';
import { getMapById } from '../lib/mapsStorage';
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
  const { id } = useParams();
  const navigate = useNavigate();
  const [theme, setTheme] = useTheme();

  const [mapData, setMapData] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const {
    selectedLayerKey,
    selectedLayerKind,
    activeTool,
    setActiveTool,
    drawingPoints,
    setDrawingPoints,
    poiName,
    setPoiName,
    poiTipo,
    setPoiTipo,
    poiDescription,
    setPoiDescription,
    poiPhotoUrl,
    poiAcessivel,
    setPoiAcessivel,
    poiLargura,
    setPoiLargura,
    savingMap,
    featureGroupRef,
    selectedLayerRef,
    selectLayerHandlerRef,
    selectLayer,
    clearPoiForm,
    applyPoiChanges,
    selectMappingTool,
    finishPolygonDraft,
    finishPathDraft,
    saveFeatures,
    handlePoiPhotoUpload,
  } = usePoiEditor(id, setMapData);

  useEffect(() => {
    if (!id) {
      navigate('/map-editor');
      return;
    }
    const found = getMapById(id);
    if (!found) {
      setNotFound(true);
      return;
    }
    setMapData(found);
  }, [id, navigate]);

  if (!id) return null;
  if (notFound) {
    return (
      <PageLayout theme={theme}>
        <PageHeader theme={theme} setTheme={setTheme} isLoggedIn />
        <main className="relative z-10 flex-1 flex flex-col items-center justify-center gap-4 p-6">
          <p className="text-red-400 text-lg font-semibold">Mapa não encontrado neste navegador.</p>
          <GhostButton theme={theme} onClick={() => navigate('/map-editor')} size="md">
            Voltar
          </GhostButton>
        </main>
      </PageLayout>
    );
  }
  if (!mapData) return null;

  return (
    <PageLayout theme={theme} fullBleed>
      <PageHeader theme={theme} setTheme={setTheme} isLoggedIn />

      {/* 👇 botão Voltar acima do mapa (com mais respiro no mobile) */}
      <div className="relative z-10 px-4 sm:px-10 pt-4 sm:pt-3 pb-4 sm:pb-4">
        <GhostButton
          theme={theme}
          variant="overlay"
          size="sm"
          onClick={() => navigate('/map-editor')}
        >
          <BackIcon className="h-4 w-4 shrink-0" /> Voltar
        </GhostButton>
      </div>

      <MapSplitLayout
        theme={theme}
        panelPosition="left"
        panelWidth="editor"
        panel={
          <EditorSidebar
            theme={theme}
            mapName={mapData.name}
          >
            {selectedLayerKey ? (
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
                  poiDescription={poiDescription}
                  setPoiDescription={setPoiDescription}
                  poiPhotoUrl={poiPhotoUrl}
                  onPhotoUpload={handlePoiPhotoUpload}
                  onSave={applyPoiChanges}
                  onCancel={clearPoiForm}
                />
              )
            ) : (
              <div className="flex-1 flex flex-col gap-4">
                <p className={`text-sm ${theme === 'dark' ? 'text-white/50' : 'text-[#1B2F55]/50'}`}>
                  Use as ferramentas abaixo para criar um ponto, uma área ou um corredor no mapa.
                </p>
                <ToolPicker
                  theme={theme}
                  activeTool={activeTool}
                  onSelectTool={selectMappingTool}
                />
                <DraftActions
                  theme={theme}
                  activeTool={activeTool}
                  drawingPoints={drawingPoints}
                  onFinishPolygon={finishPolygonDraft}
                  onFinishPath={finishPathDraft}
                  onClear={() => setDrawingPoints([])}
                />
                <AccentButton
                  onClick={saveFeatures}
                  disabled={savingMap}
                  className="w-full mt-auto"
                >
                  {savingMap ? (
                    'Salvando...'
                  ) : (
                    <>
                      <SaveIcon className="h-4 w-4 shrink-0" /> Salvar mapa
                    </>
                  )}
                </AccentButton>
              </div>
            )}
          </EditorSidebar>
        }
        map={
          <EditorCanvas
            theme={theme}
            mapData={mapData}
            id={id}
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
