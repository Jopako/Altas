/**
 * ViewerMap — Canvas Leaflet do visualizador indoor (Workspace).
 */
import { MapContainer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { computeWorkspaceBounds, processRouteForDisplay, filterByBlock } from '../../lib/workspaceUtils';
import { FundoEsquematico } from './FundoEsquematico';
import { InvalidateMapSize } from './InvalidateMapSize';
import { MapCameraController } from './viewer/MapCameraController';
import { FocusPoi } from './viewer/FocusPoi';
import { ZoomScaledLabels } from './viewer/ZoomScaledLabels';
import { MapBlocks } from './viewer/MapBlocks';
import { MapCorridors } from './viewer/MapCorridors';
import { MapAreas } from './viewer/MapAreas';
import { MapPoints } from './viewer/MapPoints';
import { MapRoute } from './viewer/MapRoute';

export function ViewerMap({
  theme, workspace, blocoAtivo, onBlocoClick,
  corredores, areas, pontos,
  navOrigem, navDestino, rotaPontos,
  rotaSegmentos = [], transicoesVerticais = [],
  poiLayersRef, handlePoiClickRef, poiSelecionado, isRoutePanelOpen,
}) {
  const blockMeta = workspace?.blockMeta || {};
  const workspaceBounds = computeWorkspaceBounds(blockMeta);

  // Lógica multi-piso: isolar segmento correspondente ao andar ativo
  let pontosExibicao = rotaPontos;
  let segmentosIndependentes = null;
  let escadaHighlight = null;

  if (rotaSegmentos && rotaSegmentos.length > 1) {
    if (blocoAtivo) {
      // Procura o segmento pertencente a este bloco
      const segAtivo = rotaSegmentos.find((s) => s.blockId === blocoAtivo);
      pontosExibicao = segAtivo ? segAtivo.pontos : null;

      // Destaca a escada que leva ao próximo piso se estiver saindo deste andar
      const transSaindo = transicoesVerticais?.find((t) => t.fromBlockId === blocoAtivo);
      if (transSaindo?.fromCoord) {
        escadaHighlight = transSaindo.fromCoord;
      }
    } else {
      // Visão global: renderiza segmentos separados (sem traçar linha reta unindo andares distintos)
      segmentosIndependentes = rotaSegmentos;
      pontosExibicao = null;
    }
  }

  const { rotaAjustada, finalPinoOrigem, finalPinoDestino } = processRouteForDisplay(
    pontosExibicao,
    navOrigem,
    navDestino
  );

  const poiProps = { navOrigem, navDestino, handlePoiClickRef, poiLayersRef };

  return (
    <div className="h-full w-full relative">
      <MapContainer
        crs={L.CRS.Simple}
        center={[0, 0]}
        zoom={-2}
        minZoom={-8}
        maxZoom={4}
        zoomSnap={0.5}
        zoomDelta={0.5}
        className="h-full w-full rounded-2xl sm:rounded-[28px] overflow-hidden"
        style={{ height: '100%', width: '100%', background: '#1f3975' }}
      >
        <InvalidateMapSize />
        <FundoEsquematico theme={theme} bounds={workspaceBounds} />
        <MapCameraController blocoAtivo={blocoAtivo} blockMeta={blockMeta} workspaceBounds={workspaceBounds} />
        <ZoomScaledLabels />
        <FocusPoi poi={poiSelecionado} />

        <MapBlocks blockMeta={blockMeta} blocoAtivo={blocoAtivo} isRoutePanelOpen={isRoutePanelOpen} onBlocoClick={onBlocoClick} />
        <MapCorridors corredores={filterByBlock(corredores, blocoAtivo)} />
        <MapAreas areas={filterByBlock(areas, blocoAtivo)} {...poiProps} />
        <MapPoints pontos={filterByBlock(pontos, blocoAtivo)} {...poiProps} />
        <MapRoute
          rotaAjustada={rotaAjustada}
          segmentosIndependentes={segmentosIndependentes}
          finalPinoOrigem={blocoAtivo && navOrigem?.feature?.properties?.blockId && navOrigem.feature.properties.blockId !== blocoAtivo ? null : finalPinoOrigem}
          finalPinoDestino={blocoAtivo && navDestino?.feature?.properties?.blockId && navDestino.feature.properties.blockId !== blocoAtivo ? null : finalPinoDestino}
          escadaHighlight={escadaHighlight}
        />
      </MapContainer>
    </div>
  );
}
