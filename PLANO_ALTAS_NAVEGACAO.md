# Plano Único: Navegação QR Code + Multi-piso (ALTAS)

## ⚙️ REGRAS PARA A IA (leia primeiro)
1. Veja a seção **PROGRESSO** abaixo e continue da **primeira etapa não marcada**.
2. Faça **somente uma etapa por vez**. Não adiante etapas.
3. Ao terminar uma etapa:
   - marque `[x]` na etapa em **PROGRESSO** (edite este arquivo);
   - anote em **LOG** o que foi feito e os arquivos alterados;
   - rode `git add -A && git commit -m "etapa N: <resumo>"`.
4. Se a etapa ficar pela metade, anote no **LOG** exatamente onde parou (arquivo + o que falta).
5. Não altere o que já foi marcado como concluído, a menos que dê erro.

---

## 📊 PROGRESSO

- [x] **Etapa 1** — Escala em metros (`useIndoorRoute` + `RoutePanel`)
- [ ] **Etapa 2** — Salvar destino no `sessionStorage` (`MapViewer`)
- [ ] **Etapa 3** — Fluxo do QR Code / checkpoints (`MapViewer`)
- [ ] **Etapa 4** — Teste mobile da navegação por QR
- [ ] **Etapa 5** — Modelagem de escadas/elevadores (editor + dados)
- [ ] **Etapa 6** — Grafo com aresta vertical (`buildGraph.js`)
- [ ] **Etapa 7** — Rota partida em segmentos + `RoutePanel` + visual por andar
- [ ] **Etapa 8** — QR na escada (troca automática de andar)
- [ ] **Etapa 9** — Testes finais multi-piso

## 📝 LOG
_(a IA escreve aqui ao fim de cada etapa ou ao parar no meio)_

- **Etapa 1 concluída**:
  - `src/hooks/useIndoorRoute.js`: Adicionada constante `ESCALA_METROS = 0.1`, cálculo de `distanciaMetros`, inclusão da distância no texto e retorno de `distanciaMetros`.
  - `src/components/map/RoutePanel.jsx`: Adicionado suporte a `distanciaMetros` nas props e exibição da distância estimada em metros.
  - `src/pages/MapViewer.jsx`: Passada a prop `distanciaMetros` do hook para o componente `RoutePanel`.

---

# PARTE A — Navegação Dinâmica por QR Code (Mobile)

**Objetivo:** o usuário escaneia QR Codes pelo caminho com a câmera nativa do celular. O sistema recalcula a rota a cada scan e avisa quando ele chega ao destino.

---

## Etapa 1 — Escala em metros

**Arquivo:** `src/hooks/useIndoorRoute.js`

O Dijkstra calcula distância em "pontos do mapa". Converter para metros reais:

- Crie a constante `const ESCALA_METROS = 0.1;` (1 ponto = 0.1 m, ou seja, 10 pontos = 1 m).
- Calcule: `const distanciaMetros = resultado.distancia * ESCALA_METROS;`
- Retorne `distanciaMetros` no objeto do hook.

**Arquivo:** `src/components/RoutePanel.jsx`

- Exiba junto ao texto da rota (ex: *"Rota encontrada: ~15 metros"*).

**Pronto quando:** o painel mostra a distância em metros ao traçar uma rota.

---

## Etapa 2 — Salvar o destino

**Arquivo:** `src/pages/MapViewer.jsx`

O `navDestino` precisa ficar no `sessionStorage` para não se perder quando a câmera recarregar a página ou abrir nova aba.

```javascript
useEffect(() => {
  if (navDestino) {
    sessionStorage.setItem('altas_nav_destino', JSON.stringify(navDestino));
  } else {
    sessionStorage.removeItem('altas_nav_destino');
  }
}, [navDestino]);
```

**Pronto quando:** definir um destino grava `altas_nav_destino` no `sessionStorage` (conferir no DevTools) e limpar o destino remove a chave.

---

## Etapa 3 — Fluxo do QR Code (checkpoints)

**Arquivo:** `src/pages/MapViewer.jsx`

Quando a página carregar com `?poi=ID_DO_PONTO`:

```javascript
useEffect(() => {
  const poiIdUrl = searchParams.get("poi");
  if (!poiIdUrl || !workspace) return;

  // 1. Encontra o POI escaneado
  const allFeatures = workspace.features?.features || [];
  const poiEscaneado = allFeatures.find(f => f.properties?.id === poiIdUrl);
  if (!poiEscaneado) return;

  // 2. Abre as informações do ponto escaneado
  setPoiSelecionado(poiEscaneado);
  setPoiExpandido(poiEscaneado);
  setBlocoAtivo(poiEscaneado.properties.blockId);

  // 3. Recupera o destino salvo (se existir)
  const savedDestinoStr = sessionStorage.getItem('altas_nav_destino');
  const savedDestino = savedDestinoStr ? JSON.parse(savedDestinoStr) : null;

  if (!savedDestino) {
    // CENÁRIO A: Primeiro scan. Define como Origem.
    setNavOrigem({
      id: poiEscaneado.properties.id,
      name: poiEscaneado.properties.name,
      feature: poiEscaneado
    });
    setIsRoutePanelOpen(true); // Abre a rota pra ele escolher o destino
  } else {
    // CENÁRIO B: Já tem um destino, escaneou um QR intermediário.
    if (savedDestino.id === poiEscaneado.properties.id) {
      // ELE CHEGOU!
      alert(`🎉 Você chegou ao seu destino: ${poiEscaneado.properties.name}!`);
      setNavDestino(null);
      setNavOrigem(null);
      sessionStorage.removeItem('altas_nav_destino');
      limparRota();
    } else {
      // Checkpoint no meio do caminho. Atualiza a origem.
      setNavDestino(savedDestino); // Restaura o destino
      setNavOrigem({
        id: poiEscaneado.properties.id,
        name: poiEscaneado.properties.name,
        feature: poiEscaneado
      });
      setIsRoutePanelOpen(true);
    }
  }
}, [workspace, searchParams]); // Dispara sempre que a URL com o QR mudar
```

**Pré-requisito:** botão "Gerar QR Code" já existente no editor (plano anterior).

**Pronto quando:** abrir `/map-viewer?bloco=X&poi=Y` define a origem (sem destino salvo), atualiza a origem (com destino salvo) ou mostra "chegou" (se o POI for o destino).

---

## Etapa 4 — Teste mobile

1. No terminal do frontend:
   ```bash
   npm run dev -- --host
   ```
2. O Vite mostra um endereço tipo `http://192.168.1.15:5173`.
3. Gere o QR do ponto usando o IP (ex: `http://192.168.1.15:5173/map-viewer?bloco=123&poi=f-456`).
4. Celular na **mesma rede Wi-Fi** do computador.
5. Escaneie com a câmera nativa.

**Checklist:**
- [ ] 1º scan define a origem e abre o painel de rota
- [ ] Escolher destino e escanear QR intermediário recalcula a rota
- [ ] Escanear o QR do destino mostra a mensagem de chegada e limpa a rota

---

# PARTE B — Navegação Multi-piso (Escadas e Elevadores)

**Objetivo:** rotas entre andares diferentes (mapa é 2D). O sistema guia até a escada, avisa para subir e continua a rota no andar superior.

> Depende da Parte A concluída (Etapas 1–4), principalmente para a Etapa 8.

---

## Etapa 5 — Modelagem dos dados (editor)

- **Salas:** continuam como polígonos normais no seu bloco (`bloco-d-terreo`, `bloco-d-superior`).
- **Escadas/Elevadores:** desenhar como **Point** (ou pequenos polígonos) na planta.
- **Conexão:** criar `escada-t-1` (Térreo) e `escada-s-1` (Superior). São features diferentes, ligadas via propriedade.
- Marcar `tipo: escada` (ou `elevador`) no editor.
- Adicionar o campo `conectaPara` nas propriedades: `escada-t-1` → `conectaPara: "escada-s-1"` (e vice-versa).

**Pronto quando:** existe uma escada em cada andar, com `tipo` e `conectaPara` salvos no banco.

---

## Etapa 6 — Grafo com aresta vertical

**Arquivo:** `src/lib/graph/buildGraph.js`

- Para cada feature com `conectaPara`, ligar o nó dela ao nó de destino com uma **aresta vertical**.
- Peso da aresta maior para simular o tempo de subida (ex: 50 pontos).
- Marcar a aresta (ex: `tipo: "vertical"`) para a etapa seguinte conseguir identificar a quebra.

**Pronto quando:** o Dijkstra encontra caminho entre uma sala do Térreo e uma do Superior passando pelas escadas.

---

## Etapa 7 — Rota partida e visual por andar

**Arquivo:** `src/hooks/useIndoorRoute.js`
- Dividir o caminho em segmentos ao cruzar uma aresta vertical:
  - **Segmento 1:** Origem → Escada (Térreo)
  - **Segmento 2:** Escada → Destino (Superior)
- Retornar a lista de segmentos (a linha **não** é contínua).

**Arquivo:** `src/components/RoutePanel.jsx`
- Texto de exemplo: *"Vá até a escada (15m). Suba para o Andar Superior. Siga por mais 20m até a sala."*

**Visual no ViewerMap:**
- `blocoAtivo` = Térreo → mostrar Segmento 1 + destaque/animação na escada.
- `blocoAtivo` = Superior → mostrar Segmento 2.

**Pronto quando:** trocar o andar ativo alterna o segmento exibido e o painel mostra o texto em duas partes.

---

## Etapa 8 — QR na escada (troca automática de andar)

A escada é um **checkpoint de troca de andar**:

1. O usuário traça a rota do Térreo para o Superior.
2. A rota mostra o caminho até a escada.
3. Na escada, ele escaneia o QR fixado na parede.
4. O sistema atualiza a **Origem** para a escada e muda o `blocoAtivo` para o Andar Superior (o fluxo da Etapa 3 já faz `setBlocoAtivo(poiEscaneado.properties.blockId)`; confirmar que funciona com a escada do Superior).
5. A rota recarrega mostrando escada → sala final.

**Pronto quando:** escanear o QR da escada superior muda o andar e mostra só o trecho restante.

---

## Etapa 9 — Testes finais

- [ ] Desenhar uma escada no Térreo e outra no Superior
- [ ] Marcar `tipo: escada` no editor
- [ ] Traçar rota de uma sala do Térreo para uma sala do Superior
- [ ] Dijkstra passa pelas escadas
- [ ] Mapa desenha a rota até a escada do Térreo e continua da escada do Superior até o destino
- [ ] Fluxo completo no celular com QR (Térreo → escada → Superior → chegada)
