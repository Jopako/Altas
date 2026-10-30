import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import L from "leaflet";
import { useTheme } from "../hooks/useTheme";
import { loadPublicWorkspace, loadMyWorkspace } from "../lib/workspacesStorage";
import { getFeatureCenter } from "../lib/geo";
import { ORIGEM_STYLE, DESTINO_STYLE, DEFAULT_AREA_STYLE, DEFAULT_POINT_STYLE } from "../lib/mapConstants";
import { useIndoorRoute } from "../hooks/useIndoorRoute";

import { PageLayout, PageHeader } from "../components/PageLayout";
import { MapSplitLayout } from "../components/ui/MapSplitLayout";
import { GhostButton } from "../components/ui/GhostButton";
import { ViewerMap } from "../components/map/ViewerMap";
import { PoiCardList } from "../components/map/PoiCardList";
import { RoutePanel } from "../components/map/RoutePanel";
import { BackIcon } from "../components/icons/Icons";
import { PoiExpandedModal } from "../components/map/PoiExpandedModal";

export default function MapViewer() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [theme, setTheme] = useTheme();

  const blocoUrl = searchParams.get("bloco");
  const [blocoAtivo, setBlocoAtivo] = useState(blocoUrl || null);

  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [poiSelecionado, setPoiSelecionado] = useState(null);
  const [navOrigem, setNavOrigem] = useState(null);
  const [navDestino, setNavDestino] = useState(null);
  const [alvoAtivo, setAlvoAtivo] = useState("origem");
  const [isRoutePanelOpen, setIsRoutePanelOpen] = useState(false);

  const alvoAtivoRef = useRef("origem");
  const handlePoiClickRef = useRef(null);
  const poiLayersRef = useRef(new Map());

  const [poiExpandido, setPoiExpandido] = useState(null);

  const { rotaPontos, rotaTexto, rotaErro, limparRota } = useIndoorRoute(
    workspace,
    navOrigem,
    navDestino
  );

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const hasToken = !!localStorage.getItem("jwt_token");
        const ws = hasToken ? await loadMyWorkspace() : await loadPublicWorkspace();
        if (!cancelled) setWorkspace(ws);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.error || "Erro ao carregar o workspace.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    setBlocoAtivo(blocoUrl || null);
  }, [blocoUrl]);

  useEffect(() => {
    alvoAtivoRef.current = alvoAtivo;
  }, [alvoAtivo]);

  useEffect(() => {
    handlePoiClickRef.current = (poi) => {
      if (!isRoutePanelOpen) {
        setPoiSelecionado(poi.feature || null);
        setPoiExpandido(poi.feature || null);
        return;
      }
      if (alvoAtivoRef.current === "origem") {
        if (navDestino?.id === poi.id) setNavDestino(null);
        setNavOrigem(poi);
      } else {
        if (navOrigem?.id === poi.id) return;
        setNavDestino(poi);
      }
      setPoiSelecionado(poi.feature || null);
    };
  }, [navOrigem, navDestino, isRoutePanelOpen]);

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

  function handleBlocoClick(blockId) {
    setBlocoAtivo(blockId);
    if (blockId) {
      navigate(`/map-viewer?bloco=${blockId}`, { replace: true });
    } else {
      navigate("/map-viewer", { replace: true });
    }
  }

  function handleCardClick(poiFeature) {
    const center = getFeatureCenter(poiFeature);
    handlePoiClickRef.current?.({
      id: poiFeature.properties?.id,
      name: poiFeature.properties?.name,
      lng: center?.lng,
      lat: center?.lat,
      feature: poiFeature,
    });
    if (!isRoutePanelOpen) setPoiExpandido(poiFeature);
  }

  function handleResetRoute() {
    setNavOrigem(null);
    setNavDestino(null);
    limparRota();
    setAlvoAtivo("origem");
    setPoiSelecionado(null);
    setPoiExpandido(null);
  }

  if (loading) return <div className="p-10 text-center text-white">Carregando workspace...</div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;
  if (!workspace) return null;

  const allFeatures = workspace.features?.features || [];
  
  const uniqueFeaturesMap = new Map();
  allFeatures.forEach((f, index) => {
    const id = f.properties?.id || `no-id-${index}`;
    if (!uniqueFeaturesMap.has(id)) {
      uniqueFeaturesMap.set(id, f);
    }
  });
  const featuresUnicas = Array.from(uniqueFeaturesMap.values());

  const featuresAtivas = blocoAtivo
    ? featuresUnicas.filter((f) => f.properties?.blockId === blocoAtivo)
    : featuresUnicas;

  const areas = featuresAtivas.filter(
    (f) => f.geometry?.type === "Polygon" && !(f.properties?.kind === "edge" || f.properties?.tipo === "corredor")
  );
  const pontos = featuresAtivas.filter((f) => f.geometry?.type === "Point");
  const corredores = featuresAtivas.filter(
    (f) => f.properties?.kind === "edge" || f.properties?.tipo === "corredor"
  );
  const listaPois = [...areas, ...pontos].filter((f) => f.properties?.name);

  // 👇 Lista Geral para a Rota
  const todasAreas = featuresUnicas.filter(
    (f) => f.geometry?.type === "Polygon" && !(f.properties?.kind === "edge" || f.properties?.tipo === "corredor")
  );
  const todosPontos = featuresUnicas.filter((f) => f.geometry?.type === "Point");
  const todosPoisParaRota = [...todasAreas, ...todosPontos].filter((f) => f.properties?.name);

  return (
    <PageLayout theme={theme} fullBleed>
      <PageHeader theme={theme} setTheme={setTheme} />
      <div className="relative z-10 px-4 sm:px-10 pt-3 pb-5">
        <GhostButton 
          theme={theme} 
          variant="overlay" 
          size="sm" 
          onClick={() => navigate("/map-gallery")} 
        >
          <BackIcon className="h-4 w-4 shrink-0" /> Voltar aos Blocos
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
            workspace={workspace}
            blocoAtivo={blocoAtivo}
            onBlocoClick={handleBlocoClick}
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
            {blocoAtivo && (
              <div className={`p-3 rounded-xl flex items-center justify-between text-sm font-bold shadow-sm ${
                theme === "dark" ? "bg-[#4A7FD4]/20 text-white border border-[#4A7FD4]/30" : "bg-[#3F64A6]/10 text-[#1B2F55] border border-[#3F64A6]/20"
              }`}>
                <span className="truncate pr-2">📍 {workspace.blockMeta?.[blocoAtivo]?.name || blocoAtivo}</span>
                <button
                  onClick={() => handleBlocoClick(null)}
                  className="text-[11px] underline opacity-70 hover:opacity-100 cursor-pointer whitespace-nowrap"
                >
                  Ver todos
                </button>
              </div>
            )}

            <PoiCardList
              theme={theme}
              pois={listaPois}
              poiSelecionado={poiSelecionado}
              onSelectPoi={handleCardClick}
              onOuvir={(poi) => alert("Audiodescrição: " + (poi.properties.description || ""))}
              onLibras={(poi) => alert("Aqui entraria o VLibras.")}
            />

            {todosPoisParaRota.length >= 1 && (
              <RoutePanel
                theme={theme}
                listaPois={todosPoisParaRota} // 👈 Lista geral, permite rotas entre blocos
                alvoAtivo={alvoAtivo}
                setAlvoAtivo={setAlvoAtivo}
                navOrigem={navOrigem}
                navDestino={navDestino}
                setNavOrigem={setNavOrigem}
                setNavDestino={setNavDestino}
                setPoiSelecionado={setPoiSelecionado}
                rotaPontos={rotaPontos}
                rotaErro={rotaErro}
                rotaTexto={rotaTexto}
                onOuvirRota={() => alert("Audiodescrição da rota: " + (rotaTexto || ""))}
                onLimpar={handleResetRoute}
                isOpen={isRoutePanelOpen}
                setIsOpen={setIsRoutePanelOpen}
              />
            )}
          </div>
        }
      />
      
      {poiExpandido && (
        <PoiExpandedModal
          theme={theme}
          poi={poiExpandido}
          onClose={() => setPoiExpandido(null)}
          onOuvir={(poi) => alert("Audiodescrição: " + (poi.properties.description || ""))}
          onLibras={(poi) => alert("Aqui entraria o VLibras.")}
        />
      )}
    </PageLayout>
  );
}