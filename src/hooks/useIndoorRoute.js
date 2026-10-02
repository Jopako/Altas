/**
 * useIndoorRoute — Hook para cálculo e suavização de rota indoor no grafo do mapa.
 * Executa Dijkstra e interpolação de caminho sem alterar regras do produto.
 */
import { useEffect, useState } from 'react';
import L from 'leaflet';
import {
  buildGraph,
  nearestNode,
  dijkstra,
  smoothPath,
  toPoint,
} from '../lib/graph';

export function useIndoorRoute(mapData, navOrigem, navDestino, somenteAcessivel) {
  const [rotaPontos, setRotaPontos] = useState(null);
  const [rotaTexto, setRotaTexto] = useState('');
  const [rotaErro, setRotaErro] = useState('');

  useEffect(() => {
    if (!mapData?.features || !navOrigem || !navDestino) {
      setRotaPontos(null);
      setRotaTexto('');
      setRotaErro('');
      return;
    }

    if (navOrigem.id === navDestino.id) {
      setRotaPontos(null);
      setRotaTexto('');
      setRotaErro('Origem e destino são o mesmo local.');
      return;
    }

    if (navOrigem.lng == null || navDestino.lng == null) {
      setRotaPontos(null);
      setRotaTexto('');
      setRotaErro('');
      return;
    }

    const { graph, __meta } = buildGraph(mapData.features);

    if (!graph || Object.keys(graph).length === 0) {
      setRotaPontos(null);
      setRotaTexto('');
      setRotaErro('Nenhum corredor foi desenhado neste mapa ainda.');
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
      setRotaTexto('');
      setRotaErro('Não foi possível localizar origem ou destino no grafo.');
      return;
    }

    const resultado = dijkstra(graph, origemKey, destinoKey, { somenteAcessivel });

    if (!resultado) {
      setRotaPontos(null);
      setRotaTexto('');
      setRotaErro(
        somenteAcessivel
          ? 'Não há rota acessível entre esses pontos.'
          : 'Não foi possível calcular uma rota entre esses pontos.'
      );
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
    const caminhoSuave = smoothPath(resultado.caminho, rooms, corridorNodes, 0);

    const pontosFinais = [
      origemPonto,
      ...caminhoSuave.map((k) => toPoint(k)),
      destinoPonto,
    ];

    const latlngs = pontosFinais.map((p) => L.latLng(p.y, p.x));
    setRotaPontos(latlngs);
    setRotaTexto(`Rota de "${navOrigem.name}" até "${navDestino.name}" traçada no mapa.`);
    setRotaErro('');
  }, [navOrigem, navDestino, somenteAcessivel, mapData]);

  const limparRota = () => {
    setRotaPontos(null);
    setRotaTexto('');
    setRotaErro('');
  };

  return { rotaPontos, rotaTexto, rotaErro, limparRota };
}
