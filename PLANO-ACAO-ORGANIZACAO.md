# Plano de ação — organização do front (ALTAS)

Documento para um agente de IA implementar. Objetivo: **reorganizar o código** e **deixar o sistema inteiro responsivo** (celular, tablet e desktop). A lógica do produto permanece a mesma (rotas, snap, desenho, grafo, localStorage). O que muda é estrutura de arquivos e o layout em telas estreitas: nada pode ficar cortado, ilegível ou inalcançável. Depois disto o front fica mais curto, mais legível, usável no telefone e com um ponto único de persistência, pronto para uma integração com backend sem reescrever as pages.

---

## 0. Regras obrigatórias

Leia isto antes de editar qualquer arquivo.

1. **Não mude a lógica do produto.** Rotas, cliques, snap, desenho, cálculo de rota, localStorage, textos, paleta, alertas, `confirm`, `speechSynthesis` e mensagens de erro ficam iguais. Empilhar colunas, reordenar mapa/painel no mobile, menu hamburger e `invalidateSize` do Leaflet **entram** — isso é responsivo, não feature nova.
2. **Não refatore lógica de grafo.** `src/lib/graph.js` não entra nesta entrega. Só importe o que já é importado hoje.
3. **Não adicione backend, auth, testes novos, TypeScript, nem telas novas.** Sem endpoint, sem mudar o shape dos mapas.
4. **Meta de tamanho:** cada arquivo novo ou reescrito deve ficar **abaixo de 200 linhas**. Se um bloco ainda passar disso, quebre de novo.
5. **Pages viram orquestração.** `src/pages/*.jsx` só: hooks, estado, handlers finos e composição de componentes. Sem JSX enorme, sem helpers de Leaflet, sem CSS duplicado.
6. **Responsivo é obrigatório em cada componente extraído.** Não extraia o JSX desktop e deixe o mobile “pra depois”. O bloco já nasce com os breakpoints da seção 2.1.
7. **Comentários:** um bloco no topo de cada arquivo novo (responsabilidade + restrição não óbvia). Comentários no código só onde a regra não é óbvia (ex.: CRS Simple, chave do localStorage, tolerância de snap, faixa visual vs eixo da rota, `invalidateSize`). Sem narrar “aqui setamos o state”.
8. **Entrega incremental.** Siga as fases na ordem. Depois de cada fase o app precisa continuar compilando e as três telas precisam funcionar em desktop **e** em ~375px de largura.
9. **Verificação:** `npm run build` e `npm run lint` no fim de cada fase. Percorra os fluxos da seção 11 na largura estreita e na larga.

---

## 1. Diagnóstico atual

| Arquivo | Linhas | Problema |
|---|---|---|
| `src/pages/MapViewer.jsx` | 683 | Duas telas no mesmo arquivo (galeria + visualizador), mapa Leaflet, painel de POI, painel de rota, cálculo Dijkstra, estilos, helpers |
| `src/pages/MapPoiEditor.jsx` | 630 | `MapSetup` (~200 linhas), snap, estilos de layer, dois formulários, toolbar, canvas |
| `src/pages/MapEditor.jsx` | 184 | Já perto da meta, mas duplica persistência, classes de input e card de mapa |
| `src/components/PageLayout.jsx` | 233 | `useTheme` + header + footer + ícones no mesmo arquivo |
| `src/lib/graph.js` | 450 | Fora do escopo desta entrega |

Duplicação hoje (extrair, não copiar de novo):

- `LS_KEY = 'altas_maps'`, `loadMaps()`, `saveMaps()` em **três pages**
- `shellOuterClasses(theme)` e `panelClasses(theme)` em `MapViewer` e `MapPoiEditor`
- `inputClasses` / `labelClasses` nas três pages
- `bounds = [[0, 0], [1000, 1000]]` em Viewer e PoiEditor
- Card de mapa (imagem + nome) em `MapEditor` e galeria do `MapViewer`
- `getFeatureCenter` no Viewer é o mesmo cálculo de centro de `getEntryPoint` em `graph.js` — **não misturar**. Deixe `getFeatureCenter` em `src/lib/geo.js` e continue usando-o no Viewer. Não altere `graph.js`.

Emojis a remover (botões e títulos de ação): ver fase 6.

Problemas de responsividade hoje (o sistema **não** está 100% usável no telefone):

- `PageLayout` usa `overflow-hidden` + `min-h-[100svh]`. Em telas baixas a lista de mapas e os formulários **cortam** e não rolam.
- Header: nav (`Equipe`, `Home`, etc.) é `hidden md:flex` **sem menu mobile**. Em &lt;768px os links somem.
- Header em 320px: logo + Login/Sair + tema competem na mesma linha (`grid-cols-[1fr_auto_1fr]`).
- `MapPoiEditor` no mobile empilha o painel de 400px **acima** do mapa (`flex-col`). Quem vai desenhar precisa rolar o form inteiro para ver a planta. O wrapper interno ainda tem `min-h-[100svh]` **além** do header, então passa de uma tela e o `overflow-hidden` do layout corta o mapa.
- `MapViewer` (mapa) idem: `overflow-hidden` + `min-h-[100svh]` + `pt-20` + dois painéis embaixo. No telefone o painel de rota fica inacessível.
- Leaflet **não** chama `invalidateSize()` quando o container muda (rotação, painel que abre, troca `flex-col` → `flex-row`). O mapa fica com tile/área cinza ou clique defasado.
- Alvos de toque &lt; 44px em vários botões pílula `text-xs py-1.5`.
- Sem `safe-area-inset` (notch / home indicator).
- Editor ainda renderiza `<PageFooter>` no final mesmo com `showFooter={false}` — no mobile isso empurra o mapa para fora.
- Grade de cards começa em `grid-cols-2` até em 320px: nome truncado, botão apagar cobre a miniatura.

---

## 2. Árvore-alvo

Crie só o que a fase pedir. Não invente pastas extras.

```
src/
  lib/
    mapsStorage.js      # ÚNICO lugar que lê/grava localStorage dos mapas
    mapUi.js            # classes Tailwind repetidas (shell, panel, input, label)
    mapConstants.js     # bounds + estilos Leaflet de POI/rota
    geo.js              # getFeatureCenter
    speech.js           # falar()
    graph.js            # intacto
  hooks/
    useTheme.js         # sai de PageLayout.jsx
  components/
    icons/
      Icons.jsx         # wrappers Heroicons + LibrasIcon custom
    layout/
      PageLayout.jsx
      PageHeader.jsx
      PageFooter.jsx
    ui/
      MapCard.jsx
      EmptyState.jsx
      GhostButton.jsx
      AccentButton.jsx
      MobileNav.jsx          # menu hamburger &lt; md
      MapSplitLayout.jsx     # casca mapa + painel, desktop lado a lado / mobile mapa primeiro
    map/
      InvalidateMapSize.jsx  # useMap + resize → invalidateSize
      FundoEsquematico.jsx
      RouteFocus.jsx
      ViewerMap.jsx
      MapGallery.jsx
      PoiDetailPanel.jsx
      RoutePanel.jsx
      editor/
        layerStyles.js
        snap.js
        MapSetup.jsx
        EditorCanvas.jsx
        EditorSidebar.jsx
        ToolPicker.jsx
        PoiForm.jsx
        CorridorForm.jsx
        DraftActions.jsx
  pages/
    MapEditor.jsx       # < 200 linhas, só orquestra
    MapPoiEditor.jsx    # < 200 linhas, só orquestra
    MapViewer.jsx       # < 200 linhas, só orquestra
```

`AuthBackground.jsx` permanece onde está (`src/components/AuthBackground.jsx`). Atualize imports em `PageLayout` / pages.

---

## 2.1 Sistema responsivo (vale para todas as fases)

O app já tem `viewport` em `index.html`. Completar com `viewport-fit=cover` para safe-area:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
```

Breakpoints Tailwind já usados no projeto — **não invente outros**:

| Prefixo | Largura | Papel neste app |
|---|---|---|
| (base) | &lt; 640px | telefone: uma coluna, mapa primeiro, nav hamburger |
| `sm` | ≥ 640px | um pouco mais de padding; tagline do header pode aparecer |
| `md` | ≥ 768px | nav horizontal no header; grade 3 cards |
| `lg` | ≥ 1024px | mapa + painel **lado a lado** (layout atual de Viewer/Editor) |

### Tokens de espaçamento no mobile

- Padding de página: `px-4 sm:px-6 lg:px-10` (hoje `px-6` no header aperta 320px).
- Footer/home indicator: `pb-[max(12px,env(safe-area-inset-bottom))]`.
- Topo (notch): `pt-[max(0px,env(safe-area-inset-top))]` só no chrome full-bleed (overlay Voltar do Viewer).
- Botão tocável: `min-h-11 min-w-11` (44px) em botões de ação no base; em `lg` pode manter o tamanho visual atual se já for ≥ 36px.
- Ícone + label: `flex-wrap` para o texto não vazar.

### `PageLayout` — scroll vs tela de mapa

Dois modos, explícitos:

1. **Páginas que rolam** (`MapEditor`, galeria do Viewer, 404, mapa não encontrado): `min-h-[100svh] overflow-y-auto overflow-x-hidden`. Tire o `overflow-hidden` atual. O `pb-[110px]` do footer fica, mas o conteúdo **precisa** conseguir rolar por cima.
2. **Páginas de mapa full-bleed** (`MapViewer` com `:id`, `MapPoiEditor`): `h-[100svh] overflow-hidden flex flex-col`. Header encolhe (`flex-shrink-0`). O miolo (`MapSplitLayout`) ocupa `flex-1 min-h-0` — `min-h-0` é o que deixa o filho com `overflow-y-auto` funcionar no flex.

Não use `min-h-[100svh]` **dentro** de uma page que já é `100svh` (é o bug atual do editor/viewer: header + 100svh = corte).

No `MapPoiEditor`, **não renderize** `<PageFooter>` se a page já passou `showFooter={false}`. Footer em tela de mapa no mobile empurra o canvas para fora.

### `MapSplitLayout.jsx` (usar em Viewer e PoiEditor)

Casca única para “mapa + painel”. Comportamento:

```
base / sm / md:
  flex-col, altura 100% do miolo (min-h-0)
  1) mapa  flex-1 min-h-[45vh]   (order-1)  — sempre visível
  2) painel max-h-[42vh] overflow-y-auto (order-2)
lg:
  flex-row (igual hoje)
  painel lg:w-[360px] no Viewer / lg:w-[400px] no Editor, overflow-y-auto
  mapa flex-1 min-h-0
```

Props: `theme`, `panel`, `map`, `panelWidth: 'viewer' | 'editor'`. Bordas `rounded-2xl sm:rounded-[28px]` — no telefone `28px` come área útil.

No Viewer, os botões overlay Voltar/Editar ficam `top-[max(12px,env(safe-area-inset-top))] left-3` e não podem cobrir o único canto de zoom. `flex-wrap` já existe; reduzir `text-sm` → `text-xs sm:text-sm` e `px-3 sm:px-4`.

### Header — `MobileNav.jsx`

Abaixo de `md`, a nav some. Recriar os **mesmos** links (`publicNavLinks` / `loggedInNavLinks`) num painel:

- Botão hamburger (`Bars3Icon` / `XMarkIcon` na fase 6; até lá um SVG 24px simples) à esquerda do bloco de ações, `aria-label="Abrir menu"`, `min-h-11 min-w-11`.
- Painel absoluto abaixo do header, `w-full`, fundo igual ao `themeClasses[theme].surface`, links empilhados, toque fecha o menu e navega.
- Sem overlay que bloqueie o mapa se o menu estiver fechado.
- Em `md+` o hamburger some e a nav central atual permanece.

Logo: em &lt;640px o texto “ALTAS” pode ficar; a frase “Mapeamento institucional” continua `hidden sm:block`. Se Sair+tema apertarem, esconda só o texto “Sair” e deixe o botão com `aria-label="Sair"` — **não** remova o logout.

### Leaflet — `InvalidateMapSize.jsx`

```jsx
function InvalidateMapSize() {
  const map = useMap();
  useEffect(() => {
    const kick = () => map.invalidateSize();
    kick();
    const ro = new ResizeObserver(kick);
    ro.observe(map.getContainer());
    window.addEventListener('orientationchange', kick);
    return () => {
      ro.disconnect();
      window.removeEventListener('orientationchange', kick);
    };
  }, [map]);
  return null;
}
```

Montar **dentro** de todo `MapContainer` (Viewer e Editor). Sem isso o mapa no flex mobile nasce com altura 0 ou clique fora do ponto.

Não mude CRS, bounds, zoom duplo, nem o fluxo de desenho. No telefone o usuário já tem “Finalizar área/corredor” quando há ≥ 2 pontos — isso cobre a falta de duplo clique; **não** troque o gesto de desenho.

### Grades e forms

- Cards: `grid-cols-1 xs` efetivo = `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`. Viewer hoje é `grid-cols-2` desde o base — passar a 1 coluna abaixo de `sm`.
- Botão apagar do card: `top-2 right-2` ok, mas `min-h-11 min-w-11` no mobile (hoje `w-7 h-7` é difícil de acertar). Em `sm+` pode voltar a 28px se quiser o visual atual.
- Inputs/select/textarea: `w-full`, `max-w-full`, sem largura fixa em px.
- Nome de arquivo no upload: no mobile mostrar até ~12 caracteres + `…`; não deixar o botão estourar a coluna (`max-w-full truncate`).
- `AuthBackground` é `absolute inset-0` com `pointer-events-none` — ok em qualquer largura; não precisa redesenhar o SVG.

### O que o responsivo **não** é

- Não muda paleta, raios “de marca” no desktop, copy, nem o fluxo origem → destino.
- Não cria bottom-tab bar nova, PWA, nem layout tablet especial além de `md`/`lg`.
- Não reescreve o editor para “modo touch” com ferramentas diferentes.

---


## 3. Fase 1 — persistência e tokens visuais (fundação para backend)

### 3.1 `src/lib/mapsStorage.js`

Mover `LS_KEY`, `loadMaps` e `saveMaps` para cá. Expor funções com a **mesma semântica** de hoje:

```js
/** Persistência local dos mapas (localStorage).
 *  Trocar o corpo destas funções por chamadas HTTP no futuro,
 *  sem mudar o shape `{ id, name, imageUrl, features, createdAt }`.
 */
export const LS_KEY = 'altas_maps';

export function loadMaps() { /* JSON.parse(localStorage.getItem(LS_KEY) || '[]') + try/catch igual ao atual */ }
export function saveMaps(maps) { /* localStorage.setItem igual ao atual */ }
export function getMapById(id) { return loadMaps().find((m) => m.id === id) || null; }
export function createMap(novoMapa) { const atualizado = [...loadMaps(), novoMapa]; saveMaps(atualizado); return atualizado; }
export function deleteMap(id) { const atualizado = loadMaps().filter((m) => m.id !== id); saveMaps(atualizado); return atualizado; }
export function updateMapFeatures(id, featureCollection) {
  const maps = loadMaps();
  const idx = maps.findIndex((m) => m.id === id);
  if (idx === -1) return null;
  maps[idx] = { ...maps[idx], features: featureCollection };
  saveMaps(maps);
  return maps[idx];
}
```

`createMap` / `deleteMap` / `updateMapFeatures` **não mudam o formato** do objeto mapa. `id` continua `map-${Date.now()}`, `imageUrl` continua dataURL, `features` continua FeatureCollection.

Nas pages: apague as cópias locais e importe daqui.

### 3.2 `src/lib/mapUi.js`

```js
export function shellOuterClasses(theme) { /* copiar literal de MapViewer/MapPoiEditor */ }
export function panelClasses(theme) { /* idem */ }
export function inputClasses(theme) { /* unificar: usar a versão com placeholder + focus:border-[#4A7FD4] do MapEditor/PoiEditor.
  No Viewer o input de rota hoje NÃO tem placeholder/focus — ao unificar, preserve as classes extras que o RoutePanel já concatena (border-2, ring verde/vermelho). Não deixe o input de rota visualmente diferente. Se precisar, exporte inputClassesBase e deixe o Viewer somar as classes de foco de origem/destino. */ }
export function labelClasses(theme) { /* igual MapEditor/PoiEditor */ }
```

Cuidado: o Viewer usa um `inputClasses` um pouco mais curto (`px-3 py-2.5`, sem placeholder/focus). **Mantenha o visual do Viewer.** Solução: `inputClasses(theme, { size: 'sm' | 'md' })` ou duas funções `inputClasses` e `inputClassesCompact`. Não “melhorar” o padding.

### 3.3 `src/lib/mapConstants.js`

```js
export const MAP_BOUNDS = [[0, 0], [1000, 1000]];

export const ORIGEM_STYLE = { color: '#22c55e', weight: 3, fillColor: '#22c55e', fillOpacity: 0.35 };
export const DESTINO_STYLE = { color: '#ef4444', weight: 3, fillColor: '#ef4444', fillOpacity: 0.35 };
export const DEFAULT_AREA_STYLE = { color: '#00d4ff', weight: 2.5, fillColor: '#00d4ff', fillOpacity: 0.22 };
export const DEFAULT_POINT_STYLE = { radius: 7, color: '#fff', weight: 2, fillColor: '#f59e0b', fillOpacity: 1 };
```

Estilos de desenho do editor (`areaShapeOptions`, `selectedShapeOptions`, `pathShapeOptions`, `selectedPathShapeOptions`) ficam em `src/components/map/editor/layerStyles.js`, não aqui.

### 3.4 `src/lib/geo.js` e `src/lib/speech.js`

- `geo.js`: mover `getFeatureCenter` de `MapViewer.jsx` **sem alterar a função**.
- `speech.js`: mover `falar(texto)` de `MapViewer.jsx` **sem alterar** (mesmo `alert` se não houver `speechSynthesis`, mesmo `pt-BR`, mesmo `cancel` + `speak`).

### 3.5 Critério da fase 1

App igual. Pages ainda grandes, mas já importam storage/UI/constants. Zero `localStorage` nas pages.

---

## 4. Fase 2 — layout, botões e cards reutilizáveis

### 4.1 Quebrar `PageLayout.jsx`

| Arquivo | Conteúdo |
|---|---|
| `src/hooks/useTheme.js` | `useTheme` exatamente como está |
| `src/components/layout/PageLayout.jsx` | `PageLayout` |
| `src/components/layout/PageHeader.jsx` | `PageHeader` |
| `src/components/layout/PageFooter.jsx` | `PageFooter` |

Para não quebrar imports atuais, `src/components/PageLayout.jsx` vira barrel:

```js
export { useTheme } from '../hooks/useTheme';
export { PageLayout } from './layout/PageLayout';
export { PageHeader } from './layout/PageHeader';
export { PageFooter } from './layout/PageFooter';
```

Mover `MoonIcon` / `SunIcon` para `src/components/icons/Icons.jsx` (fase 6). Até lá podem ficar no header.

No `PageHeader`, integrar `MobileNav` (seção 2.1). Padding do header: `px-4 sm:px-10 lg:px-16`. Ações do lado direito: `gap-2 sm:gap-3`, botões `min-h-11` no base.

### 4.2 Botões

Hoje há 3 famílias visuais. Extrair **sem mudar classes**:

**`GhostButton.jsx`** — botões pílula translúcidos (Voltar, Editar, Selecionar inativo, Cancelar, Limpar rota):

- dark: `bg-white/10 text-white border border-white/10` (ou `text-white/70` quando o original usa isso)
- light: `bg-[#1B2F55]/10 text-[#1B2F55]` (no Viewer overlay do mapa o Voltar usa `bg-white/90` — **não unifique isso com o ghost do editor**. Passe `variant="overlay" | "panel"` ou aceite `className` extra).

**`AccentButton.jsx`** — âmbar `#F59E0B` / `#0B1B3B` (Salvar, Ouvir, Finalizar área/corredor). `rounded-full` ou `rounded-lg` conforme o original de cada tela. Prop `shape: 'pill' | 'lg'`.

Não force um único botão genérico se isso alterar border-radius ou tamanho. Prefira dois componentes fiéis.

No mobile, os dois usam `inline-flex items-center justify-center gap-1.5 min-h-11`. Em `lg` o `min-h-11` pode ficar se não alterar o visual desktop de forma visível; se alterar, `min-h-11 lg:min-h-0`.

### 4.3 `MapCard.jsx`

Usado em `MapEditor` (com botão apagar + contagem de elementos) e na galeria do `MapViewer` (sem apagar, sem contagem).

Props:

```
map, theme, onClick
showDelete?: boolean
onDelete?: (id, event) => void
footer?: ReactNode   // Editor: "N elemento(s) mapeado(s)"; Viewer: omitir
```

Classes do card, hover, aspect `[4/3]`, truncate do nome: copiar do arquivo de origem de cada uso. Onde Editor e Viewer diferem (borda hover azul só no Editor, fundo da imagem `#6b8fc7` vs `#1a3a6e` no light), preserve via prop `variant="editor" | "viewer"`.

### 4.4 `EmptyState.jsx`

Estado vazio da grade de mapas. Props: `theme`, `message`, `icon` (componente, não emoji).

Textos atuais:

- Editor: “Nenhum mapa criado ainda.”
- Viewer galeria: “Nenhum mapa disponível ainda.” (hoje é só `<p>`, sem ícone — **não adicione ícone no Viewer** se hoje não tem. EmptyState no Viewer = só o parágrafo centralizado.)

### 4.5 `MobileNav.jsx` e `MapSplitLayout.jsx`

Criar já nesta fase (receita na §2.1). O header passa a usar o nav mobile. Viewer e Editor passam a usar o split na fase 3 e 4.

### 4.6 Critério da fase 2

`MapEditor.jsx` deve cair bem abaixo de 200 linhas (form + lista usando `MapCard`). Visual **desktop** idêntico. Em 375px: a página rola, o form empilha, a grade é 1 coluna, o menu hamburger mostra os mesmos links, nada cortado pelo footer.

---

## 5. Fase 3 — `MapViewer.jsx` (683 → orquestração < 200)

A page hoje tem **dois modos**: sem `:id` (galeria) e com `:id` (mapa + painéis). Extraia os dois. A page só decide qual renderizar.

### 5.1 Componentes a criar

#### `src/components/map/MapGallery.jsx`

JSX atual do bloco “TELA 1: galeria” (linhas ~270–320).

Props: `theme`, `setTheme`, `mapList`, `onOpenMap(id)`, `onEditMaps()`.

Mantém `PageLayout` + `PageHeader` + `PageFooter` como hoje (layout **rolável**, §2.1 modo 1).

Título: “Mapas da Instituição”. Botão “Editar mapas” (ícone na fase 6). Grade `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`. Click no card → `/map-viewer/${id}`. Cabeçalho da galeria já tem `flex-wrap` — manter.

#### `src/components/map/FundoEsquematico.jsx`

Mover o componente homônimo. Props: `theme`, `size = 1000`, `step = 50`. Mesmas cores e opacidades.

#### `src/components/map/RouteFocus.jsx`

Mover o componente que faz `fitBounds` da rota. Mesmo padding `[40, 40]`.

#### `src/components/map/ViewerMap.jsx`

O `MapContainer` + corredores + áreas + GeoJSON de pontos + polyline da rota. Incluir `<InvalidateMapSize />` dentro do container.

Props mínimas:

```
theme, corredores, areas, pontos,
navOrigem, navDestino, rotaPontos,
poiLayersRef, handlePoiClickRef
```

Regras que **não pode quebrar**:

- `L.CRS.Simple`, `bounds` = `MAP_BOUNDS`
- Fundo radial dark/light igual ao atual
- Corredor: `Polygon` da faixa (`lineStringToPolygon` se LineString) + `Polyline` tracejada só se `geometry.type === 'LineString'`
- Largura default `f.properties?.largura || 60`
- Clique em área/ponto chama `handlePoiClickRef.current` com `{ id, name, lng, lat, feature }` via `getFeatureCenter`
- `on add` da área registra a layer em `poiLayersRef`
- Estilos origem/destino/default iguais às constantes
- Rota: polyline `#f59e0b` weight 5 + `<RouteFocus pontos={rotaPontos} />`

#### `src/components/map/PoiDetailPanel.jsx`

Painel “Local selecionado”.

Props: `theme`, `poiSelecionado`, `onOuvir`, `onLibras`.

Se não houver POI: texto “Toque numa sala ou ponto do mapa para ver a descrição.”

Se houver: nome, foto se `photoUrl`, descrição ou “Sem descrição cadastrada.”, botões Ouvir e Libras. O `onLibras` continua `alert('Aqui entraria o widget VLibras traduzindo este texto para Libras.')`.

#### `src/components/map/RoutePanel.jsx`

Bloco “Traçar rota” (só renderizado se `listaPois.length >= 2`, a page decide).

Props:

```
theme, listaPois, alvoAtivo, setAlvoAtivo,
navOrigem, navDestino, setNavOrigem, setNavDestino, setPoiSelecionado,
somenteAcessivel, setSomenteAcessivel,
rotaErro, rotaTexto, onOuvirRota, onLimpar
```

O `onChange` dos inputs (datalist `poi-list-nav`, busca por `properties.name`, centro via `getFeatureCenter`, fallback `{ id: null, name, lng: null, lat: null }`) deve ser **copiado**, não reescrito. Destaque verde/vermelho do input ativo igual.

A page pode passar um helper `poiFromName(nome)` para não duplicar o find+center.

### 5.2 O que fica na page `MapViewer.jsx`

- `useParams`, `useNavigate`, `useTheme`
- states atuais (não renomear)
- `useEffect` de load (`getMapById` / `loadMaps`)
- refs `alvoAtivoRef`, `handlePoiClickRef`, `poiLayersRef` e os três effects que os alimentam / pintam layers
- effect que recalcula a rota (copiar o bloco inteiro, linhas ~176–252). Pode ir para `src/hooks/useIndoorRoute.js` **se** o arquivo da page ainda passar de 200 linhas. A função do hook recebe `(mapData, navOrigem, navDestino, somenteAcessivel)` e devolve `{ rotaPontos, rotaTexto, rotaErro }`. Sem mudar mensagens de erro.
- derived: `areas`, `pontos`, `corredores`, `listaPois` (mesmos filters)
- early returns: galeria / mapa não encontrado / viewer
- a tela do mapa usa `MapSplitLayout` (mapa primeiro no mobile, painéis `max-h-[42vh]` rolando). Overlay Voltar/Editar com safe-area. **Sem** `PageLayout overflow-hidden` engolindo os painéis — esta tela é full-bleed modo 2 da §2.1.

Filtros atuais (manter):

```js
areas     = Polygon && kind !== 'edge' && tipo !== 'corredor'
pontos    = geometry.type === 'Point'
corredores = kind === 'edge' || tipo === 'corredor'
listaPois = [...areas, ...pontos].filter(f => f.properties?.name)
```

### 5.3 Fluxo que parece “simplificável” — e o que NÃO mexer

O Viewer mistura seleção de POI e escolha origem/destino no mesmo clique. Isso é o produto. **Não separe em dois modos novos.** Só extraia componentes.

O recálculo de rota no `useEffect` é denso, mas é o comportamento. Mover para hook = ok. Reescrever Dijkstra/smoothPath = **proibido**.

---

## 6. Fase 4 — `MapPoiEditor.jsx` (630 → orquestração < 200)

### 6.1 `src/components/map/editor/layerStyles.js`

Mover:

- `areaShapeOptions`, `selectedShapeOptions`, `pathShapeOptions`, `selectedPathShapeOptions`
- `getLayerKind(layer)`
- `applyDefaultLayerStyle` / `applySelectedLayerStyle`

### 6.2 `src/components/map/editor/snap.js`

Mover `findClosestSnapVertex`, `snapToNearby`, `getExistingVertices`. Tolerância default **15**. Comentário no topo: “Snap de vértice para encaixar corredores; distância em unidades do CRS Simple.”

### 6.3 `src/components/map/editor/MapSetup.jsx`

Componente `return null` que registra controles Leaflet Draw e listeners de clique. Mover **inteiro**. Props iguais às atuais, inclusive `previewLargura`.

Se ainda passar de 200 linhas, extraia só helpers internos no mesmo folder:

- `draftRender.js` — `clearTempDraft`, `renderTempMarkers`, `renderTempPolygon`, `renderTempPath`, `updatePreview` (usa `lineStringToPolygon`)
- `snapIndicator.js` — circleMarker âmbar do snap

Não altere a ordem dos `useEffect` nem os cleanup (`off` dos eventos, `removeControl`, cursor, `clearSnapIndicator`).

### 6.4 `src/components/map/editor/EditorCanvas.jsx`

`MapContainer` + `ImageOverlay` + `FeatureGroup` + `GeoJSON` + `MapSetup` + `InvalidateMapSize`.

Props: `theme`, `mapData`, `id`, refs e handlers que `MapSetup` já recebe, `poiLargura`, `selectLayer`.

Detalhes a preservar:

- `crs={L.CRS.Simple}`, `bounds`/`maxBounds` = `MAP_BOUNDS`, `maxBoundsViscosity={0.8}`
- `doubleClickZoom={false}`
- background dark `#071427` / light `#edf3f9`
- `GeoJSON key={id}` + `applyDefaultLayerStyle` + click com `L.DomEvent.stopPropagation`

### 6.5 Painel esquerdo — quebrar o JSX, não a máquina de estados

A page continua dona de: `selectedLayerKey`, `selectedLayerKind`, `activeTool`, `drawingPoints`, campos do POI, `savingMap`, refs, `selectLayer`, `clearPoiForm`, `applyPoiChanges`, `selectMappingTool`, `finishPolygonDraft`, `finishPathDraft`, `saveFeatures`, `handlePoiPhotoUpload`, `persistFeatures`.

Componentes visuais:

#### `EditorSidebar.jsx`

Shell do painel 400px (`panelClasses`, overflow, título `mapData.name`, botão Voltar). Filhos via `children` ou slots. A page escolhe o conteúdo:

- se `selectedLayerKey` e kind `edge` → `CorridorForm`
- senão se `selectedLayerKey` → `PoiForm`
- senão → `ToolPicker` + hints + `DraftActions` + botão salvar mapa

#### `CorridorForm.jsx`

Slider largura 20–200 step 5, checkbox “Rota acessível (sem escadas)”, botões “Salvar corredor” / “Cancelar”. Textos e classes iguais.

#### `PoiForm.jsx`

Nome, select tipo (só se `kind === 'area'`, mesmas options), descrição, preview foto, upload “Adicionar foto”, “Salvar ponto de interesse”, “Cancelar”.

#### `ToolPicker.jsx`

Quatro botões: Selecionar / Ponto específico / Área / Corredor. Ativo = `bg-[#F59E0B] text-[#0B1B3B] shadow-md`. Hint `activeToolHint` (objeto atual, pode viver neste arquivo).

#### `DraftActions.jsx`

Os dois blocos “Finalizar área/corredor” + “Limpar pontos” quando `drawingPoints.length >= 2`. Props: `activeTool`, `drawingPoints`, `onFinishPolygon`, `onFinishPath`, `onClear`.

### 6.6 `MapPoiEditor.jsx` final

Early returns (`!id`, `notFound`, `!mapData`) iguais, inclusive o botão “Voltar” da tela de erro. Depois: `PageLayout` modo mapa (sem footer duplicado) + `PageHeader` + `MapSplitLayout` com `EditorSidebar` no painel e `EditorCanvas` no mapa.

No mobile o mapa vem **primeiro**; o sidebar vira faixa inferior rolável (`max-h-[42vh]`). Título longo do mapa: `truncate` + `min-w-0` para não empurrar o botão Voltar para fora.

Sem Leaflet na page além do que os handlers já usam (`L.polygon`, `L.polyline`, `L.stamp`, `L.DomEvent` em `selectLayer` / finish drafts). Se esses handlers incharem a page, mover para `src/hooks/usePoiEditor.js` **copiando as funções**, sem reescrever.

### 6.7 Fluxos do editor — o que extrair vs o que não “simplificar”

Pode extrair:

- persistência → `updateMapFeatures`
- estilo de layer / snap / preview da faixa
- os três estados visuais do sidebar (idle / poi / corredor)

Não fundir “Salvar corredor” e “Salvar ponto de interesse” num form genérico. Properties são diferentes (`largura` vs `name/description/photoUrl/tipo`). Um form único aqui bagunça a futura API.

Não trocar o desenho manual (clique + duplo clique) por Leaflet Draw draw tools. O código já usa Draw só no `edit` control. Manter.

---

## 7. Fase 5 — `MapEditor.jsx` (polimento)

Já está em 184 linhas. Depois das fases 1–2 deve ficar ~80–120.

Estrutura da page:

1. `PageLayout` + `AuthBackground` + `PageHeader isLoggedIn` + `PageFooter`
2. Coluna form “Cadastrar novo mapa:”
3. Coluna lista “Mapas cadastrados:” com `EmptyState` ou grid de `MapCard`

Handlers: manter `handleUpload` (FileReader → dataURL → `createMap` → navigate para `/map-editor/${id}/pontos`) e `handleDelete` (`confirm` com a mesma string + `deleteMap`).

Opcional se ainda houver JSX repetido: `src/components/map/NewMapForm.jsx` com o form de nome + file + submit. Só extraia se a page passar de ~150 linhas.

Responsivo: `PageLayout` modo rolável. Form `w-full`; botões do upload `w-full sm:w-auto` com `truncate` no nome do arquivo. Grade de cards 1 coluna no base. Nada preso atrás do footer de 78px.

---

## 8. Fase 6 — emojis → ícones (Heroicons)

Tailwind não traz ícones no CSS. O set oficial do Tailwind Labs é **Heroicons**. Instalar:

```bash
npm install @heroicons/react
```

Usar **outline 24×24**, `className="h-4 w-4 shrink-0"` (botões de texto) ou `h-5 w-5` (botão só ícone). Cor: `currentColor` (já é o default do Heroicons) para herdar a cor do botão — âmbar no accent, branco/navy no ghost, igual à interface (`#F59E0B`, `#1B2F55`, `#4A7FD4`).

### 8.1 `src/components/icons/Icons.jsx`

Reexportar com nomes do domínio, para as pages não dependerem do path do pacote:

```js
export { Cog6ToothIcon as SettingsIcon } from '@heroicons/react/24/outline';
export { ArrowLeftIcon as BackIcon } from '@heroicons/react/24/outline';
export { SpeakerWaveIcon as SpeakIcon } from '@heroicons/react/24/outline';
export { MapIcon as MapEmptyIcon } from '@heroicons/react/24/outline';
export { XMarkIcon as CloseIcon } from '@heroicons/react/24/outline';
export { ArrowDownTrayIcon as SaveIcon } from '@heroicons/react/24/outline';
export { MapPinIcon as RouteIcon } from '@heroicons/react/24/outline';
export { CheckCircleIcon as SuccessIcon } from '@heroicons/react/24/outline';
export { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
export { Bars3Icon as MenuIcon } from '@heroicons/react/24/outline';
export { XMarkIcon as MenuCloseIcon } from '@heroicons/react/24/outline';
// LibrasIcon: SVG próprio (Heroicons não tem sinal de Libras)
// CloseIcon e MenuCloseIcon podem ser o mesmo XMarkIcon reexportado duas vezes, ou um único XMarkIcon.
```

`SunIcon` / `MoonIcon` atuais no header são SVG custom 18px. **Substituir pelos Heroicons do mesmo tamanho visual** (`h-[18px] w-[18px]`) no botão circular azul `#4A7FD4`. O botão e o `aria-label` ficam iguais.

`LibrasIcon`: desenhar um SVG simples de duas mãos / gesto (stroke `currentColor`, 24×24, cantos round, mesma espessura ~1.8 dos ícones atuais). Não usar um ícone genérico de “idioma” — o botão precisa continuar lendo como Libras. Texto do botão permanece “Libras”.

### 8.2 Substituições (texto dos botões permanece)

| Onde | Hoje | Trocar por |
|---|---|---|
| `MapViewer` galeria | `⚙️ Editar mapas` | `<SettingsIcon /> Editar mapas` |
| `MapViewer` overlay | `⬅ Voltar` | `<BackIcon /> Voltar` |
| `MapViewer` overlay | `⚙️ Editar` | `<SettingsIcon /> Editar` |
| `PoiDetailPanel` | `🔊 Ouvir` | `<SpeakIcon /> Ouvir` |
| `PoiDetailPanel` | `🤟 Libras` | `<LibrasIcon /> Libras` |
| `RoutePanel` título | `🧭 Traçar rota` | `<RouteIcon /> Traçar rota` (ícone inline no título, mesma cor do texto) |
| `RoutePanel` sucesso | `✅ {rotaTexto}` | `<SuccessIcon className="h-4 w-4 text-[#22c55e]" /> {rotaTexto}` — texto verde igual |
| `RoutePanel` | `🔊 Ouvir` | `<SpeakIcon /> Ouvir` |
| `MapPoiEditor` sidebar | `⬅ Voltar` | `<BackIcon /> Voltar` |
| `MapPoiEditor` | `💾 Salvar mapa` | `<SaveIcon /> Salvar mapa` |
| `MapEditor` empty | `🗺️` | `<MapEmptyIcon className="h-10 w-10 mx-auto mb-3 opacity-50" />` no lugar do `text-4xl` |
| `MapEditor` delete | `✕` | `<CloseIcon className="h-3.5 w-3.5" />` no botão 7×7 — `title="Apagar mapa"` igual |

Todos esses botões passam a `inline-flex items-center justify-center gap-1.5` (ou `gap-2`) para ícone + label alinharem. Não aumente `px`/`py` a ponto de mudar o tamanho do botão de forma visível.

**Não substitua** caracteres que não são emoji de UI (nenhum outro no src). Não adicione ícone em botões que hoje são só texto (“Salvar novo mapa”, “Selecionar”, “Cancelar”, “Limpar rota”, “Login”, “Sair”).

---

## 9. Comentários esperados (padrão)

No topo de cada arquivo novo:

```js
/**
 * ViewerMap — canvas Leaflet do visualizador indoor.
 * CRS Simple; origem das coordenadas é o FeatureCollection salvo no mapa.
 * Clique em sala/ponto alimenta origem ou destino conforme alvoAtivo (ref na page).
 */
```

Outros pontos que merecem uma linha:

- `mapsStorage.js`: “único I/O dos mapas; pages não falam com localStorage”
- `snap.js`: tolerância 15 no CRS da planta
- `MapSetup.jsx`: Draw Control só para edit/delete; desenho de ponto/área/corredor é manual
- `graph.js`: não tocar; a faixa do corredor é visual, a rota segue o eixo
- `MapSplitLayout.jsx`: no flex, `min-h-0` no filho é o que permite o mapa + painel caberem em `100svh`
- `InvalidateMapSize.jsx`: Leaflet mede o container na montagem; no mobile o flex define a altura depois

Não comente setters, maps de className, nem “renderiza o componente X”.

---

## 10. Ordem de implementação (obrigatória)

1. `mapsStorage.js` + trocar imports nas 3 pages  
2. `mapUi.js`, `mapConstants.js`, `geo.js`, `speech.js` + `viewport-fit=cover`  
3. Quebrar `PageLayout` (modos rolável vs mapa) + barrel + `MobileNav`  
4. `MapCard`, `EmptyState`, botões, `MapSplitLayout`; enxugar `MapEditor` já rolável no telefone  
5. Componentes do Viewer + `InvalidateMapSize`; enxugar `MapViewer` já no split responsivo  
6. Editor: styles, snap, MapSetup, canvas, forms, sidebar no `MapSplitLayout`; enxugar `MapPoiEditor` (sem footer duplicado)  
7. Heroicons + `Icons.jsx` + troca dos emojis (incluindo hamburger)  
8. Build, lint, checklist **desktop + 375px + 768px**  

Não comece pelos ícones. Ícones por último evita rebase em className de botão que ainda vai se mover. Cada fase já entrega o bloco usável no telefone — não acumular “depois eu faço o mobile”.

---

## 11. Checklist de comportamento (obrigatório no fim)

Percorra com `npm run dev`. Se algo diferir do main atual, reverta essa parte.

**MapEditor `/` e `/map-editor`**

- [ ] Header logado, tema claro/escuro, fundo `AuthBackground`
- [ ] Upload sem arquivo → `alert("Selecione uma imagem primeiro!")`
- [ ] Salvar cria mapa, grava no localStorage, navega para `/map-editor/:id/pontos`
- [ ] Card abre o editor; ✕ pede confirm e apaga
- [ ] Empty state com ícone (não emoji) + “Nenhum mapa criado ainda.”
- [ ] Texto “Sem backend nesta versão…” permanece

**MapPoiEditor `/map-editor/:id/pontos`**

- [ ] Mapa inexistente → mensagem vermelha + Voltar
- [ ] Ferramentas: selecionar, ponto (snap), área (duplo clique), corredor (snap + duplo clique)
- [ ] Preview da faixa do corredor muda com o slider 20–200
- [ ] Salvar ponto / salvar corredor / cancelar
- [ ] “Salvar mapa” → `alert('Mapa salvo neste navegador!')` e persiste features
- [ ] Voltar → `/map-editor`

**MapViewer `/map-viewer` e `/map-viewer/:id`**

- [ ] Galeria lista os mesmos mapas; card abre o viewer; “Editar mapas” → `/map-editor`
- [ ] Mapa inexistente → “Mapa não encontrado neste navegador.”
- [ ] Clique define origem depois destino (e vice-versa); mesmo POI nos dois → erro “Origem e destino são o mesmo local.”
- [ ] Rota desenha em âmbar; fitBounds; checkbox acessível com as mesmas mensagens de erro
- [ ] Ouvir / Libras (alert VLibras) / Limpar rota
- [ ] Overlay Voltar e Editar (`/map-editor/:id/pontos`)

**Ícones**

- [ ] Nenhum emoji nos botões/títulos listados na §8.2
- [ ] Ícones na cor do texto do botão, alinhados, tamanho próximo ao texto

**Tamanho**

- [ ] `wc -l src/pages/*.jsx` → cada page < 200
- [ ] Arquivos novos < 200; se `MapSetup.jsx` estourar, já deve ter sido partido

**Responsivo (DevTools: 375×812, 768×1024, 1280×800, e rotação)**

- [ ] Nenhuma tela corta conteúdo com `overflow-hidden` sem área interna rolável
- [ ] Header &lt; 768px: hamburger abre os mesmos links; ≥768px: nav central igual à atual
- [ ] `MapEditor` 375px: form empilhado, lista 1 coluna, scroll até o último card por cima do footer
- [ ] Galeria Viewer 375px: 1 coluna; título + “Editar mapas” quebram linha sem sair da tela
- [ ] Viewer com mapa 375px: mapa visível na primeira tela; painel POI/rota rola na faixa de baixo; Voltar/Editar não saem da safe-area; rota continua calculando e desenhando
- [ ] Editor 375px: mapa visível na primeira tela; ferramentas na faixa inferior rolável; dá para criar ponto/área/corredor e salvar
- [ ] Rotação paisagem: mapa preenche, `invalidateSize` rodou (clique no POI acerta o local)
- [ ] Desktop ≥1024px: Viewer e Editor continuam lado a lado, visual equivalente ao atual

---

## 12. Fora de escopo (não fazer agora)

- Mexer em `src/lib/graph.js` (algoritmo, densify, sew, smoothPath)
- Trocar dataURL por upload real / API
- Unificar Viewer e Editor num único mapa
- Adicionar VLibras de verdade (o alert fica)
- Redesenhar paleta, tipografia ou identidade visual
- Inventar bottom tabs, PWA ou “modo touch” com ferramentas novas de desenho
- Remover `App.css` (legado Vite; irrelevante para as pages)
- Criar README novo ou reescrever este plano

Adaptar empilhamento, hamburger, `min-h-0`, safe-area e `invalidateSize` **não** é redesenho — é a fase de deixar o sistema responsivo.

Quando o backend existir: implementar só o corpo de `mapsStorage.js` (e o `FileReader` do upload). Pages e componentes de mapa não precisam saber se a fonte é `localStorage` ou HTTP.
