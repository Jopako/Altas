# Plano de Ação: Movimentação de Blocos no Workspace

## 🎯 Objetivo
Permitir que o admin mova os blocos (plantas) no Editor, ajustando a distância entre eles e recalculando as coordenadas de todas as features daquele bloco, tanto no estado (JSON) quanto na camada visual do Leaflet. O sistema deve impedir que os blocos se sobreponham, respeitando uma margem mínima de distância.

---

## 🛠️ Módulos a serem alterados

### 1. `src/hooks/usePoiEditor.js`
Adicionar a função `moveBlock` que calcula o deslocamento (`dx`, `dy`), valida a colisão com outros blocos e atualiza tanto o estado do React quanto os layers visuais do Leaflet.

```javascript
// Adicione no topo do arquivo, fora do hook
const MIN_BLOCK_DISTANCE = 150;

export function usePoiEditor(setMapData) {
  // ... (mantenha os estados existentes)

  // Função para transladar as coordenadas do GeoJSON recursivamente
  const translateFeatureCoords = (coords, dx, dy) => {
    if (typeof coords[0] === 'number') {
      // GeoJSON usa [lng, lat] que no CRS.Simple é [x, y]
      return [coords[0] + dx, coords[1] + dy];
    }
    return coords.map(c => translateFeatureCoords(c, dx, dy));
  };

  function moveBlock(blockId, dx, dy) {
    if (!workspace || !blockId) return false;

    const currentMeta = workspace.blockMeta[blockId];
    if (!currentMeta || !currentMeta.bounds) return false;

    const currentBounds = currentMeta.bounds;
    
    // Bounds no Leaflet usam [lat, lng] (que no CRS.Simple é [y, x])
    const newBounds = [
      [currentBounds[0][0] + dy, currentBounds[0][1] + dx],
      [currentBounds[1][0] + dy, currentBounds[1][1] + dx]
    ];

    // 1. Validação de Colisão (Margem Mínima)
    const hasCollision = Object.entries(workspace.blockMeta).some(([otherId, meta]) => {
      if (otherId === blockId || !meta.bounds) return false;
      const other = meta.bounds;
      return (
        newBounds[0][0] < other[1][0] + MIN_BLOCK_DISTANCE &&
        newBounds[1][0] > other[0][0] - MIN_BLOCK_DISTANCE &&
        newBounds[0][1] < other[1][1] + MIN_BLOCK_DISTANCE &&
        newBounds[1][1] > other[0][1] - MIN_BLOCK_DISTANCE
      );
    });

    if (hasCollision) {
      alert("Distância mínima entre blocos não respeitada!");
      return false;
    }

    // 2. Atualiza o JSON das features no estado
    const updatedFeatures = workspace.features.features.map(f => {
      if (f.properties?.blockId !== blockId) return f;
      return {
        ...f,
        geometry: {
          ...f.geometry,
          coordinates: translateFeatureCoords(f.geometry.coordinates, dx, dy)
        }
      };
    });

    // 3. Atualiza o estado no React
    const newWorkspace = {
      ...workspace,
      blockMeta: {
        ...workspace.blockMeta,
        [blockId]: { ...currentMeta, bounds: newBounds }
      },
      features: { type: 'FeatureCollection', features: updatedFeatures }
    };

    setWorkspace(newWorkspace);
    if (setMapData) setMapData(newWorkspace);

    // 4. Atualiza o Leaflet visualmente (Camada FeatureGroup)
    if (featureGroupRef.current) {
      featureGroupRef.current.eachLayer(layer => {
        if (layer.feature?.properties?.blockId === blockId) {
          if (layer.setLatLngs) {
            const latlngs = layer.getLatLngs();
            // Verifica se é Polygon (array de arrays) ou Polyline
            if (Array.isArray(latlngs[0])) {
              const newLatLngs = latlngs.map(ring => 
                ring.map(p => L.latLng(p.lat + dy, p.lng + dx))
              );
              layer.setLatLngs(newLatLngs);
            } else {
              const newLatLngs = latlngs.map(p => L.latLng(p.lat + dy, p.lng + dx));
              layer.setLatLngs(newLatLngs);
            }
          }
          if (layer.setLatLng) {
            const p = layer.getLatLng();
            layer.setLatLng(L.latLng(p.lat + dy, p.lng + dx));
          }
        }
      });
    }
    
    return true;
  }

  return {
    // ... (mantenha os outros retornos)
    moveBlock,
  };
}
```

### 2. `src/pages/MapPoiEditor.jsx`
Adicionar o botão para ativar/desativar o modo de movimentação e passar as props necessárias.

```jsx
import { useState, useEffect } from "react";
// ... outros imports

export default function MapPoiEditor() {
  const { blockId } = useParams(); 
  const navigate = useNavigate();
  const [theme, setTheme] = useTheme();
  const [mapData, setMapData] = useState(null);
  
  // 👇 Novo estado para o modo de mover
  const [isMovingBlock, setIsMovingBlock] = useState(false);

  const {
    // ... outras props do hook
    moveBlock, // 👈 Puxe a função do hook
  } = usePoiEditor(setMapData);

  // ... (useEffect do blockId)

  return (
    <PageLayout theme={theme} fullBleed>
      {/* ... */}
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
                  if (newId) navigate(`/map-editor/${newId}`);
                  else navigate('/map-editor');
                  setIsMovingBlock(false); // Cancela modo ao trocar de bloco
                }}
                className="w-full p-2 rounded-lg bg-black/20 text-white border border-white/10 text-sm outline-none"
              >
                <option value="">Selecione um bloco...</option>
                {blocksList.map(([id, meta]) => (
                  <option key={id} value={id}>{meta.name || id}</option>
                ))}
              </select>
              
              {/* 👇 Botão de Mover Bloco */}
              {selectedBlockId && (
                <button 
                  onClick={() => setIsMovingBlock(prev => !prev)}
                  className={`w-full mt-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    isMovingBlock ? 'bg-[#F59E0B] text-white hover:bg-[#d97706]' : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {isMovingBlock ? '❌ Cancelar Movimentação' : '✋ Mover Bloco'}
                </button>
              )}
            </div>

            {/* ... restante dos formulários ... */}
          </EditorSidebar>
        }
        map={
          <EditorCanvas
            theme={theme}
            mapData={workspace}
            activeBlockId={selectedBlockId}
            activeTool={activeTool}
            // 👇 Passando props de movimentação
            isMovingBlock={isMovingBlock}
            setIsMovingBlock={setIsMovingBlock}
            onBlockMove={moveBlock}
            // ... outras props
          />
        }
      />
    </PageLayout>
  );
}
```

### 3. `src/components/map/editor/EditorCanvas.jsx`
Adicionar o retângulo interativo (que aparece quando `isMovingBlock` é `true`) e a lógica de arrasto com o mouse.

```jsx
import { FeatureGroup, GeoJSON, ImageOverlay, MapContainer, Rectangle, useMap } from "react-leaflet";
import L from "leaflet";
// ... outros imports

export function EditorCanvas({
  // ... props existentes
  activeBlockId,
  isMovingBlock,
  setIsMovingBlock,
  onBlockMove,
}) {
  const isDark = theme === 'dark';
  const map = useMap(); // 👈 Hook do react-leaflet para acessar o mapa

  const activeBlock = mapData?.blockMeta?.[activeBlockId];
  const imageUrl = activeBlock?.imageUrl;
  const blockBounds = activeBlock?.bounds;

  // ... (restante do código de features)

  return (
    <div className="...">
      <MapContainer ...>
        {/* ... */}
        
        {/* 👇 RETÂNGULO DE MOVIMENTAÇÃO */}
        {isMovingBlock && blockBounds && (
          <Rectangle
            bounds={blockBounds}
            pathOptions={{ color: '#F59E0B', weight: 2, dashArray: '8 8', fillOpacity: 0.15 }}
            eventHandlers={{
              mousedown: (e) => {
                map.dragging.disable(); // Desativa o pan do mapa enquanto move o bloco
                
                const startLat = e.latlng.lat;
                const startLng = e.latlng.lng;
                const initialBounds = [...blockBounds];

                const onMouseMove = (moveEvent) => {
                  const dy = moveEvent.latlng.lat - startLat;
                  const dx = moveEvent.latlng.lng - startLng;

                  // Atualiza apenas o visual do retângulo
                  e.target.setBounds([
                    [initialBounds[0][0] + dy, initialBounds[0][1] + dx],
                    [initialBounds[1][0] + dy, initialBounds[1][1] + dx]
                  ]);
                };

                const onMouseUp = (upEvent) => {
                  map.off('mousemove', onMouseMove);
                  map.off('mouseup', onMouseUp);
                  map.dragging.enable();

                  const dy = upEvent.latlng.lat - startLat;
                  const dx = upEvent.latlng.lng - startLng;

                  // Aplica no estado e nos dados (retorna true se deu certo)
                  const success = onBlockMove(activeBlockId, dx, dy);
                  
                  if (success) {
                    setIsMovingBlock(false); // Desativa modo
                  } else {
                    // Se falhar (colisão), reverte o retângulo
                    e.target.setBounds(initialBounds);
                  }
                };

                map.on('mousemove', onMouseMove);
                map.on('mouseup', onMouseUp);
              }
            }}
          />
        )}

        {/* ... (restante do código) */}
      </MapContainer>
    </div>
  );
}
```

### 4. `src/hooks/useIndoorRoute.js` (Sem alteração)
Como o grafo lê as features em tempo real do estado do `workspace`, assim que as coordenadas do estado forem atualizadas pela função `moveBlock`, o cálculo de rotas vai refletir a nova posição automaticamente.

---

## ✅ Checklist de Teste

1. [ ] Abra o editor e selecione o Bloco 1.
2. [ ] Clique em "✋ Mover Bloco". Um retângulo tracejado laranja vai aparecer em volta da planta.
3. [ ] Arraste o retângulo. A planta deve deslizar visualmente, mas o mapa não deve se mover.
4. [ ] Solte em uma área livre. O bloco deve "fixar" na nova posição.
5. [ ] Tente mover o Bloco 1 em cima do Bloco 2. O sistema deve disparar um alerta e devolver o bloco para o lugar.
6. [ ] Salve o Workspace.
7. [ ] Vá para o Visualizador. A planta e todos os seus pontos devem estar na nova posição, e a rota entre blocos deve funcionar.
8. [ ] O botão "Ver Todos" deve enquadrar o Workspace considerando o novo espaçamento.