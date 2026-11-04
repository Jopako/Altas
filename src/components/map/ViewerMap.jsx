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
  poiLayersRef, handlePoiClickRef, poiSelecionado, isRoutePanelOpen,
}) {
  const blockMeta = workspace?.blockMeta || {};
  const workspaceBounds = computeWorkspaceBounds(blockMeta);
  const { rotaAjustada, finalPinoOrigem, finalPinoDestino } = processRouteForDisplay(rotaPontos, navOrigem, navDestino);
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
        <MapRoute rotaAjustada={rotaAjustada} finalPinoOrigem={finalPinoOrigem} finalPinoDestino={finalPinoDestino} />
      </MapContainer>
    </div>
  );
}
