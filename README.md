# Altas

> Plataforma interativa para criação, gerenciamento e visualização de mapas indoor e de campus, com suporte a rotas e acessibilidade integrada.

---

##  Principais Funcionalidades

- **Visualizador Interativo (`MapViewer`)**: Navegação fluida em mapas utilizando Leaflet, busca de locais, listagem e seleção de pontos de interesse (POIs).
- **Cálculo de Rotas Indoor**: Traçado inteligente de rotas e caminhos entre blocos, áreas e pontos do campus.
- **Editor de Mapas e POIs (`MapEditor` / `MapPoiEditor`)**: Ferramentas vetoriais para desenhar camadas, polígonos, blocos, pontos de interesse e gerenciar fotos/mídias associadas.
- **Gestão de Workspaces e Autenticação**: Organização de mapas em workspaces (públicos ou privados), com login unificado via OAuth (Google) e controle de permissões.
- **Backend Modular**: API em Node.js/Express documentada com Swagger (`/api-docs`), persistência no MongoDB e upload local de mídias.

---

## Recursos de Acessibilidade

Para tornar a navegação indoor inclusiva para pessoas com deficiência visual e auditiva, foram adicionados os seguintes recursos:

1. **Audiodescrição via Text-to-Speech (TTS)**:
   - **Narração de POIs e Fotos**: Leitura de descrições dos pontos de interesse e legendas de fotos diretamente na interface e no modal expandido de detalhes.
   - **Provedores de Voz (ElevenLabs & Google TTS)**: Endpoint backend (`/api/tts`) flexível, com vozes naturais configuráveis via variáveis de ambiente.
   - **Otimização com Cache**: Armazenamento em memória das sínteses geradas no backend para respostas instantâneas e menor consumo de requisições.
   - **Controles de Áudio**: Ações intuitivas no frontend para ouvir ou interromper o áudio sob demanda (`playTextToSpeech` / `stopTextToSpeech`).

2. **Suporte a Libras com VLibras**:
   - Integração do widget oficial **VLibras** (`vlibras-plugin` e `vlibras-player-webjs`).
   - Permite a tradução instantânea de textos e informações do mapa para a Língua Brasileira de Sinais através de um avatar 3D acessível a qualquer momento.

---

## Tecnologias Utilizadas

- **Frontend**: React 19, Vite, Tailwind CSS v4, Leaflet, React-Leaflet, Heroicons, VLibras Player.
- **Backend**: Node.js, Express, MongoDB (Mongoose/Driver nativo), Swagger UI, Axios.
- **Serviços de TTS**: ElevenLabs API / Google Cloud Text-to-Speech.

---

## Como Executar

### 1. Pré-requisitos
- Node.js (versão 18+)
- Instância do MongoDB rodando localmente ou conexão remota (MongoDB Atlas)

### 2. Backend
```bash
cd server
npm install
# Crie e configure o arquivo .env com base nas variáveis do projeto
npm run dev
```
*Acesse a documentação Swagger em: `http://localhost:3000/api-docs`*

### 3. Frontend
```bash
# Na raiz do projeto
npm install
npm run dev
```
*Acesse o frontend em: `http://localhost:5173`*

---

## Variáveis de Ambiente Essenciais (Backend - `server/.env`)

```env
PORT=3000
FRONTEND_URL=http://localhost:5173
JWT_SECRET=seu_jwt_secret
MONGO_URI=mongodb://localhost:27017/altas

# Acessibilidade (TTS)
TTS_PROVIDER=elevenlabs # ou google
ELEVENLABS_API_KEY=sua_chave
ELEVENLABS_VOICE_ID=pNInz6obpgDQGcFmaJgB
# GOOGLE_TTS_API_KEY=sua_chave (caso use o provider google)
```
