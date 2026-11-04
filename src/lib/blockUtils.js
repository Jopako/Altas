import L from "leaflet";

export function translateFeatureCoords(coords, dx, dy) {
  if (typeof coords[0] === "number") {
    return [coords[0] + dx, coords[1] + dy];
  }
  return coords.map((c) => translateFeatureCoords(c, dx, dy));
}

export function checkBlockCollision(workspace, blockId, dx, dy, minDistance = 150) {
  const currentMeta = workspace.blockMeta?.[blockId];
  if (!currentMeta || !currentMeta.bounds) return true;
  
  const currentBounds = currentMeta.bounds;
  const newBounds = [
    [currentBounds[0][0] + dy, currentBounds[0][1] + dx],
    [currentBounds[1][0] + dy, currentBounds[1][1] + dx],
  ];

  return Object.entries(workspace.blockMeta || {}).some(([otherId, meta]) => {
    if (otherId === blockId || !meta.bounds) return false;
    const other = meta.bounds;
    return (
      newBounds[0][0] < other[1][0] + minDistance &&
      newBounds[1][0] > other[0][0] - minDistance &&
      newBounds[0][1] < other[1][1] + minDistance &&
      newBounds[1][1] > other[0][1] - minDistance
    );
  });
}

export function getMovedWorkspace(workspace, blockId, dx, dy) {
  const currentMeta = workspace.blockMeta[blockId];
  const currentBounds = currentMeta.bounds;
  const newBounds = [
    [currentBounds[0][0] + dy, currentBounds[0][1] + dx],
    [currentBounds[1][0] + dy, currentBounds[1][1] + dx],
  ];

  const updatedFeatures = (workspace.features?.features || []).map((f) => {
    if (f.properties?.blockId !== blockId) return f;
    return {
      ...f,
      geometry: {
        ...f.geometry,
        coordinates: translateFeatureCoords(f.geometry.coordinates, dx, dy),
      },
    };
  });

  return {
    ...workspace,
    blockMeta: {
      ...workspace.blockMeta,
      [blockId]: { ...currentMeta, bounds: newBounds },
    },
    features: { type: "FeatureCollection", features: updatedFeatures },
  };
}

export function updateLeafletBlockLayers(featureGroupRef, blockId, dx, dy) {
  if (!featureGroupRef.current) return;
  
  featureGroupRef.current.eachLayer((layer) => {
    if (layer.feature?.properties?.blockId !== blockId) return;

    if (layer.setLatLngs) {
      const latlngs = layer.getLatLngs();
      if (Array.isArray(latlngs[0])) {
        const newLatLngs = latlngs.map((ring) =>
          ring.map((p) => L.latLng(p.lat + dy, p.lng + dx))
        );
        layer.setLatLngs(newLatLngs);
      } else {
        const newLatLngs = latlngs.map((p) => L.latLng(p.lat + dy, p.lng + dx));
        layer.setLatLngs(newLatLngs);
      }
    }

    if (layer.setLatLng) {
      const p = layer.getLatLng();
      layer.setLatLng(L.latLng(p.lat + dy, p.lng + dx));
    }
  });
}