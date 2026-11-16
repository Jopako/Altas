/**
 * useIndoorRoute — Hook para cálculo e suavização de rota indoor no grafo do mapa.
 * Executa Dijkstra e suporte a rotas multi-piso partidas por transições verticais (escadas/elevadores).
 */
import { useEffect, useState, useCallback } from 'react';
import L from 'leaflet';
import {
  buildGraph,
  nearestNode,
  dijkstra,
  smoothPath,
  toPoint,
} from '../lib/graph';

const ESCALA_METROS = 0.1;

function calcPointsDistMetros(pts) {
  let d = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    d += Math.hypot(pts[i].x - pts[i + 1].x, pts[i].y - pts[i + 1].y);
  }
  return d * ESCALA_METROS;
}

export function useIndoorRoute(mapData, navOrigem, navDestino, somenteAcessivel) {
  const [rotaPontos, setRotaPontos] = useState(null);
  const [rotaSegmentos, setRotaSegmentos] = useState([]);
  const [transicoesVerticais, setTransicoesVerticais] = useState([]);
  const [rotaTexto, setRotaTexto] = useState('');
  const [rotaErro, setRotaErro] = useState('');
  const [distanciaMetros, setDistanciaMetros] = useState(null);

  useEffect(() => {
    if (!mapData?.features || !navOrigem || !navDestino) {
      setRotaPontos(null);
      setRotaSegmentos([]);
      setTransicoesVerticais([]);
      setRotaTexto('');
      setRotaErro('');
      setDistanciaMetros(null);
      return;
    }

    if (navOrigem.id === navDestino.id) {
      setRotaPontos(null);
      setRotaSegmentos([]);
      setTransicoesVerticais([]);
      setRotaTexto('');
      setRotaErro('Origem e destino são o mesmo local.');
      setDistanciaMetros(null);
      return;
    }

    if (navOrigem.lng == null || navDestino.lng == null) {
      setRotaPontos(null);
      setRotaSegmentos([]);
      setTransicoesVerticais([]);
      setRotaTexto('');
      setRotaErro('');
      setDistanciaMetros(null);
      return;
    }

    const { graph, __meta } = buildGraph(mapData.features);

    if (!graph || Object.keys(graph).length === 0) {
      setRotaPontos(null);
      setRotaSegmentos([]);
      setTransicoesVerticais([]);
      setRotaTexto('');
      setRotaErro('Nenhum corredor foi desenhado neste mapa ainda.');
      setDistanciaMetros(null);
      return;
    }

    const origemKey =
      __meta?.roomCenterKey?.get(navOrigem.id) ||
      nearestNode(graph, [navOrigem.lng, navOrigem.lat]);
    const destinoKey =
      __meta?.roomCenterKey?.get(navDestino.id) ||
      nearestNode(graph, [navDestino.lng, navDestino.lat]);

    if (!origemKey || !destinoKey) {
      setRotaPontos(null);
      setRotaSegmentos([]);
      setTransicoesVerticais([]);
      setRotaTexto('');
      setRotaErro('Não foi possível localizar origem ou destino no grafo.');
      setDistanciaMetros(null);
      return;
    }

    const resultado = dijkstra(graph, origemKey, destinoKey, { somenteAcessivel });

    if (!resultado) {
      setRotaPontos(null);
      setRotaSegmentos([]);
      setTransicoesVerticais([]);
      setRotaTexto('');
      setRotaErro(
        somenteAcessivel
          ? 'Não há rota acessível entre esses pontos.'
          : 'Não foi possível calcular uma rota entre esses pontos.'
      );
      setDistanciaMetros(null);
      return;
    }

    const origemPonto = { x: navOrigem.lng, y: navOrigem.lat };
    const destinoPonto = { x: navDestino.lng, y: navDestino.lat };

    const rooms = (mapData.features.features || [])
      .filter(
        (f) =>
          f.geometry?.type === 'Polygon' &&
          !(f.properties?.kind === 'edge' || f.properties?.tipo === 'corredor')
      )
      .map((f) => ({ ring: f.geometry.coordinates[0] }));

    const corridorNodes = __meta?.corridorNodes || [];
    const allFeatures = mapData.features.features || (Array.isArray(mapData.features) ? mapData.features : []);

    // 1. Identifica quebras por arestas verticais no caminho do Dijkstra
    const rawSegments = [];
    let currentSegment = [resultado.caminho[0]];
    const transitions = [];

    for (let i = 0; i < resultado.caminho.length - 1; i++) {
      const u = resultado.caminho[i];
      const v = resultado.caminho[i + 1];
      const edge = graph[u]?.find((e) => e.to === v);
      if (edge?.tipo === 'vertical') {
        rawSegments.push(currentSegment);
        transitions.push({
          fromKey: u,
          toKey: v,
          fromId: edge.fromId,
          toId: edge.toId,
          tipo: edge.tipo,
        });
        currentSegment = [v];
      } else {
        currentSegment.push(v);
      }
    }
    rawSegments.push(currentSegment);

    if (rawSegments.length === 1) {
      // Cenário Mono-piso (mesmo piso)
      const distCalculada = resultado.distancia * ESCALA_METROS;
      setDistanciaMetros(distCalculada);

      const caminhoSuave = smoothPath(resultado.caminho, rooms, corridorNodes, 0);
      const pontosFinais = [
        origemPonto,
        ...caminhoSuave.map((k) => toPoint(k)),
        destinoPonto,
      ];

      const latlngs = pontosFinais.map((p) => L.latLng(p.y, p.x));
      setRotaPontos(latlngs);
      setRotaSegmentos([{
        id: 'seg-0',
        index: 0,
        blockId: navOrigem.feature?.properties?.blockId || null,
        pontos: latlngs,
        distanciaMetros: distCalculada,
      }]);
      setTransicoesVerticais([]);
      setRotaTexto(`Rota de "${navOrigem.name}" até "${navDestino.name}" traçada no mapa (~${Math.round(distCalculada)} metros).`);
      setRotaErro('');
    } else {
      // Cenário Multi-piso (cruza escadas / elevadores)
      const segmentosProcessados = [];
      const transicoesEnriquecidas = [];
      let totalDistMetros = 0;

      for (let sIdx = 0; sIdx < rawSegments.length; sIdx++) {
        const rawSeg = rawSegments[sIdx];
        const caminhoSuave = smoothPath(rawSeg, rooms, corridorNodes, 0);

        let ptsGeo = [];
        let segBlockId = null;

        if (sIdx === 0) {
          ptsGeo = [origemPonto, ...caminhoSuave.map((k) => toPoint(k))];
          segBlockId = navOrigem.feature?.properties?.blockId;
        } else if (sIdx === rawSegments.length - 1) {
          ptsGeo = [...caminhoSuave.map((k) => toPoint(k)), destinoPonto];
          segBlockId = navDestino.feature?.properties?.blockId;
        } else {
          ptsGeo = caminhoSuave.map((k) => toPoint(k));
        }

        if (!segBlockId) {
          const firstPt = ptsGeo[0];
          const closestF = allFeatures.find((f) => f.properties?.blockId);
          segBlockId = closestF?.properties?.blockId || null;
        }

        const distSeg = calcPointsDistMetros(ptsGeo);
        totalDistMetros += distSeg;
        const latlngs = ptsGeo.map((p) => L.latLng(p.y, p.x));

        segmentosProcessados.push({
          id: `seg-${sIdx}`,
          index: sIdx,
          blockId: segBlockId,
          pontos: latlngs,
          distanciaMetros: distSeg,
        });
      }

      // Enriquecer transições verticais com coordenadas e nomes
      transitions.forEach((tr, tIdx) => {
        const fromFeature = allFeatures.find((f) => f.properties?.id === tr.fromId);
        const toFeature = allFeatures.find((f) => f.properties?.id === tr.toId);
        const fromPt = toPoint(tr.fromKey);
        const toPt = toPoint(tr.toKey);

        transicoesEnriquecidas.push({
          ...tr,
          fromBlockId: fromFeature?.properties?.blockId || segmentosProcessados[tIdx]?.blockId,
          toBlockId: toFeature?.properties?.blockId || segmentosProcessados[tIdx + 1]?.blockId,
          fromName: fromFeature?.properties?.name || 'Escada',
          toName: toFeature?.properties?.name || 'Escada',
          fromCoord: fromPt ? L.latLng(fromPt.y, fromPt.x) : null,
          toCoord: toPt ? L.latLng(toPt.y, toPt.x) : null,
          tipo: fromFeature?.properties?.tipo || 'escada',
        });
      });

      setDistanciaMetros(totalDistMetros);
      setRotaSegmentos(segmentosProcessados);
      setTransicoesVerticais(transicoesEnriquecidas);

      const todosPontos = segmentosProcessados.flatMap((s) => s.pontos);
      setRotaPontos(todosPontos);

      if (transicoesEnriquecidas.length > 0 && segmentosProcessados.length >= 2) {
        const tr = transicoesEnriquecidas[0];
        const seg1 = segmentosProcessados[0];
        const seg2 = segmentosProcessados[1];
        const dist1 = Math.round(seg1.distanciaMetros);
        const dist2 = Math.round(seg2.distanciaMetros);
        const destBlockNome = mapData?.blockMeta?.[tr.toBlockId]?.name || tr.toBlockId || 'Andar Superior';
        const verboSubida = tr.tipo === 'elevador' ? 'Pegue o elevador para' : 'Suba para';

        setRotaTexto(`Vá até a ${tr.fromName} (~${dist1}m). ${verboSubida} o ${destBlockNome}. Siga por mais ~${dist2}m até "${navDestino.name}".`);
      } else {
        setRotaTexto(`Rota de "${navOrigem.name}" até "${navDestino.name}" traçada no mapa (~${Math.round(totalDistMetros)} metros).`);
      }
      setRotaErro('');
    }
  }, [navOrigem, navDestino, somenteAcessivel, mapData]);

  const limparRota = useCallback(() => {
    setRotaPontos(null);
    setRotaSegmentos([]);
    setTransicoesVerticais([]);
    setRotaTexto('');
    setRotaErro('');
    setDistanciaMetros(null);
  }, []);

  return {
    rotaPontos,
    rotaSegmentos,
    transicoesVerticais,
    rotaTexto,
    rotaErro,
    limparRota,
    distanciaMetros,
  };
}
