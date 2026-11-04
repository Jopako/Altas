import { useState } from "react";
import { saveMyWorkspace } from "../../lib/workspacesStorage";

export function useWorkspaceSave(workspace, setWorkspace, setMapData, selectedBlockId, selectedLayerRef, applyPoiChanges, featureGroupRef) {
  const [savingMap, setSavingMap] = useState(false);

  async function saveFeatures() {
    if (!featureGroupRef.current || !workspace) return;
    
    if (selectedLayerRef.current) {
      applyPoiChanges();
    }

    setSavingMap(true);
    await new Promise(resolve => setTimeout(resolve, 50));

    const currentFeatures = featureGroupRef.current.toGeoJSON().features;
    const featuresWithBlockId = currentFeatures.map(f => ({
      ...f,
      properties: { ...f.properties, blockId: f.properties?.blockId || selectedBlockId }
    }));

    const currentIds = new Set(featuresWithBlockId.map(f => f.properties.id));
    const allWorkspaceFeatures = workspace.features?.features || [];
    
    const otherBlockFeatures = allWorkspaceFeatures.filter(
      f => f.properties?.blockId !== selectedBlockId && !currentIds.has(f.properties?.id)
    );

    const mergedFeatures = {
      type: 'FeatureCollection',
      features: [...otherBlockFeatures, ...featuresWithBlockId]
    };

    const payload = {
      name: workspace.name || "Workspace ALTAS",
      features: mergedFeatures,
      blockMeta: workspace.blockMeta || {},
    };

    try {
      const updated = await saveMyWorkspace(payload);
      setWorkspace((prev) => ({ ...prev, ...updated }));
      if (setMapData) setMapData(updated);
      alert('Workspace salvo com sucesso!');
    } catch (err) {
      console.error("Erro ao salvar workspace:", err);
      alert('Erro ao salvar o workspace no servidor.');
    } finally {
      setSavingMap(false);
    }
  }

  return { savingMap, saveFeatures };
}