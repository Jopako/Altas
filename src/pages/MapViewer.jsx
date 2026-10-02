/**
 * MapViewer — Orquestração do visualizador de mapas e rotas acessíveis.
 */
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import L from "leaflet";
import { useTheme } from '../hooks/useTheme';
import { loadMaps, getMapById } from '../lib/mapsStorage';
import { getFeatureCenter } from '../lib/geo';

import { ORIGEM_STYLE, DESTINO_STYLE, DEFAULT_AREA_STYLE, DEFAULT_POINT_STYLE } from '../lib/mapConstants';
import { useIndoorRoute } from '../hooks/useIndoorRoute';

import { PageLayout, PageHeader } from '../components/PageLayout';
import { MapSplitLayout } from '../components/ui/MapSplitLayout';
import { GhostButton } from '../components/ui/GhostButton';
import { MapGallery } from '../components/map/MapGallery';
import { ViewerMap } from '../components/map/ViewerMap';
import { PoiDetailPanel } from '../components/map/PoiDetailPanel';
import { PoiCardList } from '../components/map/PoiCardList';
import { RoutePanel } from '../components/map/RoutePanel';
import { BackIcon, SettingsIcon } from '../components/icons/Icons';

export default function MapViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [theme, setTheme] = useTheme();

  const [mapList, setMapList] = useState([]);
  const [mapData, setMapData] = useState(null);
  const [poiSelecionado, setPoiSelecionado] = useState(null);
  const [navOrigem, setNavOrigem] = useState(null);
  const [navDestino, setNavDestino] = useState(null);
  const [alvoAtivo, setAlvoAtivo] = useState('origem');
  const [somenteAcessivel, setSomenteAcessivel] = useState(false);

  const alvoAtivoRef = useRef('origem');
  const handlePoiClickRef = useRef(null);
  const poiLayersRef = useRef(new Map());

  const { rotaPontos, rotaTexto, rotaErro, limparRota } = useIndoorRoute(
    mapData,
    navOrigem,
    navDestino,
    somenteAcessivel
  );

  useEffect(() => {
    if (id) setMapData(getMapById(id));
    else setMapList(loadMaps());
  }, [id]);

  useEffect(() => {
    alvoAtivoRef.current = alvoAtivo;
  }, [alvoAtivo]);

  useEffect(() => {
    handlePoiClickRef.current = (poi) => {
      if (alvoAtivoRef.current === 'origem') {
        if (navDestino?.id === poi.id) setNavDestino(null);
        setNavOrigem(poi);
      } else {
        if (navOrigem?.id === poi.id) return;
        setNavDestino(poi);
      }
      setPoiSelecionado(poi.feature || null);
    };
  }, [navOrigem, navDestino]);

  useEffect(() => {
    poiLayersRef.current.forEach((layer, key) => {
      const isOrigem = navOrigem?.id === key;
      const isDestino = navDestino?.id === key;
      if (isOrigem || isDestino) {
        const style = isOrigem ? ORIGEM_STYLE : DESTINO_STYLE;
        if (layer.setStyle) layer.setStyle(style);
        if (layer.setRadius) layer.setStyle({ ...style, radius: 9 });
        layer.setZIndexOffset?.(1000);
      } else {
        if (layer.setStyle) {
          layer.setStyle(layer instanceof L.CircleMarker ? DEFAULT_POINT_STYLE : DEFAULT_AREA_STYLE);
        }
        layer.setZIndexOffset?.(0);
      }
    });
  }, [navOrigem, navDestino]);

  // Galeria
  if (!id) {
    return (
      <MapGallery
        theme={theme}
        setTheme={setTheme}
        mapList={mapList}
        onOpenMap={(mapId) => navigate(`/map-viewer/${mapId}`)}
        onEditMaps={() => navigate('/map-editor')}
      />
    );
  }

  // Mapa não encontrado
  if (!mapData) {
    return (
      <PageLayout theme={theme}>
        <PageHeader theme={theme} setTheme={setTheme} />
        <main className="relative z-10 flex-1 flex items-center justify-center p-6">
          <p className={theme === 'dark' ? 'text-white/70' : 'text-[#1B2F55]/70'}>
            Mapa não encontrado neste navegador.
          </p>
        </main>
      </PageLayout>
    );
  }

  const features = mapData.features?.features || [];
  const areas = features.filter(
    (f) => f.geometry?.type === 'Polygon' && !(f.properties?.kind === 'edge' || f.properties?.tipo === 'corredor')
  );
  const pontos = features.filter((f) => f.geometry?.type === 'Point');
  const corredores = features.filter(
    (f) => f.properties?.kind === 'edge' || f.properties?.tipo === 'corredor'
  );
  const listaPois = [...areas, ...pontos].filter((f) => f.properties?.name);

  function handleCardClick(poiFeature) {
    const center = getFeatureCenter(poiFeature);
    handlePoiClickRef.current?.({
      id: poiFeature.properties?.id,
      name: poiFeature.properties?.name,
      lng: center?.lng,
      lat: center?.lat,
      feature: poiFeature,
    });
  }

  function handleResetRoute() {
    setNavOrigem(null);
    setNavDestino(null);
    limparRota();
    setAlvoAtivo('origem');
    setPoiSelecionado(null);
  }

  return (
    <PageLayout theme={theme} fullBleed>
      <PageHeader theme={theme} setTheme={setTheme} />

      {/* botão Voltar acima do mapa, fora do MapSplitLayout */}
      <div className="relative z-10 px-4 sm:px-10 pt-3 pb-5">
        <GhostButton
          theme={theme}
          variant="overlay"
          size="sm"
          onClick={() => navigate('/map-viewer')}
        >
          <BackIcon className="h-4 w-4 shrink-0" /> Voltar
        </GhostButton>
      </div>

      <MapSplitLayout
        theme={theme}
        panelPosition="right"
        panelWidth="viewer"
        map={
          <ViewerMap
            key={theme}
            theme={theme}
            corredores={corredores}
            areas={areas}
            pontos={pontos}
            navOrigem={navOrigem}
            navDestino={navDestino}
            rotaPontos={rotaPontos}
            poiLayersRef={poiLayersRef}
            handlePoiClickRef={handlePoiClickRef}
            poiSelecionado={poiSelecionado}
          />
        }
        panel={
          <div className="flex flex-col gap-4">
            <PoiCardList
              theme={theme}
              pois={listaPois}
              poiSelecionado={poiSelecionado}
              onSelectPoi={handleCardClick}
              onOuvir={(poi) => alert('Aqui entraria a audiodescrição do local: ' + (poi.properties.name || '') + '. ' + (poi.properties.description || ''))}
              onLibras={(poi) => alert('Aqui entraria o widget VLibras traduzindo este texto para Libras.')}
            />

            {listaPois.length >= 2 && (
              <RoutePanel
                theme={theme}
                listaPois={listaPois}
                alvoAtivo={alvoAtivo}
                setAlvoAtivo={setAlvoAtivo}
                navOrigem={navOrigem}
                navDestino={navDestino}
                setNavOrigem={setNavOrigem}
                setNavDestino={setNavDestino}
                setPoiSelecionado={setPoiSelecionado}
                somenteAcessivel={somenteAcessivel}
                setSomenteAcessivel={setSomenteAcessivel}
                rotaPontos={rotaPontos}
                rotaErro={rotaErro}
                rotaTexto={rotaTexto}
                onOuvirRota={() => alert('Aqui entraria a audiodescrição da rota: ' + (rotaTexto || ''))}
                onLimpar={handleResetRoute}
              />
            )}
          </div>
        }
      />
    </PageLayout>
  );
}