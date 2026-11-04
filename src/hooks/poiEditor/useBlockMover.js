import { checkBlockCollision, getMovedWorkspace, updateLeafletBlockLayers } from "../../lib/blockUtils";

export function useBlockMover(workspace, setWorkspace, featureGroupRef) {
  function moveBlock(blockId, dx, dy) {
    if (!workspace || !blockId) return false;

    const hasCollision = checkBlockCollision(workspace, blockId, dx, dy);
    if (hasCollision) {
      alert("Distância mínima entre blocos não respeitada!");
      return false;
    }

    const newWorkspace = getMovedWorkspace(workspace, blockId, dx, dy);
    setWorkspace(newWorkspace);
    updateLeafletBlockLayers(featureGroupRef, blockId, dx, dy);
    
    return true;
  }

  return { moveBlock };
}