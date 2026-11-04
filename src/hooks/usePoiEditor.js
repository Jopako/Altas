import { useState, useEffect, useRef } from "react";
import { loadMyWorkspace, uploadBlockImage } from "../lib/workspacesStorage";
import { useLayerEditor } from "./poiEditor/useLayerEditor";
import { useDrawingTools } from "./poiEditor/useDrawingTools";
import { useBlockMover } from "./poiEditor/useBlockMover";
import { useWorkspaceSave } from "./poiEditor/useWorkspaceSave";

export function usePoiEditor(setMapData) {
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const featureGroupRef = useRef();

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const ws = await loadMyWorkspace();
        setWorkspace(ws);
        if (setMapData) setMapData(ws);
      } catch (err) {
        console.error("Erro ao carregar workspace:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [setMapData]);

  const layerEditor = useLayerEditor(selectedBlockId);
  const drawingTools = useDrawingTools(selectedBlockId, featureGroupRef, layerEditor.selectLayer);
  const blockMover = useBlockMover(workspace, setWorkspace, featureGroupRef);
  const saver = useWorkspaceSave(
    workspace, 
    setWorkspace, 
    setMapData, 
    selectedBlockId, 
    layerEditor.selectedLayerRef, 
    layerEditor.applyPoiChanges, 
    featureGroupRef
  );

  async function handlePoiPhotoUpload(file) {
    if (!file) return;
    try {
      const uploadRes = await uploadBlockImage(file);
      const imageUrl = uploadRes.imageUrl || uploadRes.url;
      
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
      const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${API_BASE}${imageUrl}`;

      layerEditor.setPoiGallery((prev) => [...prev, { photo: fullImageUrl, description: '' }]);
    } catch (err) {
      console.error("Erro ao fazer upload da foto do ponto:", err);
      alert("Erro ao enviar a foto para o servidor.");
    }
  }

  return {
    workspace, loading, selectedBlockId, setSelectedBlockId,
    featureGroupRef,
    ...layerEditor,
    ...drawingTools,
    ...blockMover,
    ...saver,
    handlePoiPhotoUpload,
  };
}