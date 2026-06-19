<div align="center">
<img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=600&size=48&pause=100&color=378ADD&center=true&vCenter=true&width=435&lines=Altas" alt="Typing SVG" />
  <p>Alunos: João Paulo Kowalski, Julia Luzzi Baldissera & Samuel Castilho Pereira </p>
</div>

# Introdução
A complexidade arquitetônica de instituições de ensino contemporâneas, frequentemente compostas por múltiplos blocos, níveis e setores administrativos, impõe desafios significativos à mobilidade e à localização espacial de seus usuários. Para alunos ingressantes, servidores e visitantes, a dificuldade em identificar serviços institucionais e estruturas de apoio pode gerar desorientação e comprometer a eficiência das atividades cotidianas. Nesse cenário, a transformação de plantas arquitetônicas estáticas em interfaces digitais dinâmicas surge como uma solução estratégica para democratizar o acesso à informação espacial.

# Funcionalidades e Objetivos

## Objetivos:

Desenvolver uma aplicação web de arquitetura generalista capaz de processar plantas arquitetônicas estáticas e convertê-las em mapas interativos navegáveis, integrando informações institucionais e recursos de acessibilidade para otimizar a orientação espacial em ambientes educacionais.

## Funcionalidades Principais:
Motor de Ingestão e Processamento de Dados:

- Upload de imagens de planta para uso como base visual do mapa interativo.
- Organização dos mapas em camadas editáveis sobre a imagem da planta.
- Persistência das edições em GeoJSON para manter pontos e áreas salvos por mapa.

Módulo Administrativo e Edição:

- Interface administrativa para cadastrar mapas e editar pontos de interesse diretamente sobre a planta.
- Separação do fluxo administrativo em duas etapas: uma tela para criação/listagem de mapas e outra para edição de pontos de interesse e áreas mapeadas.
- Criação de POIs por ponto específico ou por área livre desenhada sobre a planta, com persistência em GeoJSON.

Interface de Navegação Interativa (Frontend):

- Visualização dinâmica do mapa com controles de zoom e movimentação (pan), utilizando a biblioteca Leaflet.
- Prototipagem rápida de interfaces e funções lógicas, permitindo validações constantes e ajustes de usabilidade sem ciclos extensos de desenvolvimento manual.

Favoritos:

- Usuários visitantes podem favoritar pontos de interesse na visualização do mapa.
- Administradores não usam a lista de favoritos.
- Os favoritos são salvos no backend como pares `mapId:poiId` por usuário.
  
Manutenção e Autonomia:

- Painel de controle para que a própria instituição possa atualizar informações de salas ou mudanças de layout sem a necessidade de um desenvolvedor externo.

## Tecnologias Utilizadas

### Frontend:
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
- **Bibliotecas auxiliares**: React-Leaflet, Leaflet-Draw, Axios, React Router DOM.

### Backend:
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)
- **Controle de Sessão e Segurança**: JSON Web Tokens (JWT) e criptografia SHA-256 nativa do Node.js.
- **Upload de Arquivos**: Multer.
- **Favoritos**: armazenamento por usuário no backend, com validação de role e associação `mapId:poiId`.

### Ambiente e Banco de Dados:
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)

---

## Como Executar o Projeto com Docker Compose

O projeto pode ser executado em dois modos:

- `Desenvolvimento`: frontend com Vite e backend expostos separadamente.
- `Produção`: frontend servido pelo Nginx e backend acessado via proxy reverso.

### Pré-requisitos
- Docker instalado.
- Docker Compose instalado.

### Modo Desenvolvimento

1. **Configuração de Variáveis de Ambiente**:
   Crie um arquivo `.env` na raiz do projeto baseado no `.env.example` (ou mantenha as variáveis locais ativas). Exemplo de estrutura:
   ```env
   PORT=3000
   FRONTEND_URL=http://localhost:5173
   JWT_SECRET=dev-secret
   GOOGLE_CLIENT_ID=seu_client_id
   GOOGLE_CLIENT_SECRET=seu_client_secret
   MS_CLIENT_ID=seu_ms_client_id
   MS_CLIENT_SECRET=seu_ms_client_secret
   ```

2. **Subir os Contêineres**:
   Execute o comando abaixo no terminal da raiz do projeto para compilar e iniciar tanto o frontend quanto o backend em segundo plano:
   ```bash
   docker compose up --build -d
   ```

3. **Acessar a Aplicação**:
   - **Frontend de produção via Nginx**: [http://localhost](http://localhost)
   - **Frontend em desenvolvimento**: [http://localhost:5173](http://localhost:5173)
   - **Backend (API)**: [http://localhost:3000](http://localhost:3000)

4. **Verificar os Logs**:
   Para acompanhar a atividade das APIs ou eventuais logs de depuração:
   ```bash
   docker compose logs -f
   ```

5. **Parar a Aplicação**:
   Para pausar a execução dos serviços e liberar as portas do host:
   ```bash
   docker compose down
   ```

### Modo Produção

Use este modo quando quiser rodar o frontend compilado com Nginx e a API atrás do proxy reverso.

```bash
# Subir produção
docker compose -f docker-compose.prod.yml up --build -d

# Ver logs
docker compose -f docker-compose.prod.yml logs -f

# Derrubar
docker compose -f docker-compose.prod.yml down

# Ver status
docker compose -f docker-compose.prod.yml ps
```

## Nginx E Produção

O ambiente de produção usa o Nginx como servidor estático do frontend. O arquivo [`frontend/nginx.conf`](frontend/nginx.conf) faz duas coisas:

- Sirve a SPA a partir de `/usr/share/nginx/html`.
- Redireciona chamadas em `/api` para o serviço `backend` na porta `3000`.

Isso permite publicar o frontend e a API no mesmo host sem depender de CORS entre origens diferentes.

## Documentação da API
### Registrar usuário
  
POST /auth/register

### Login
POST /auth/login

Autentica o usuário e retorna um token JWT.

### Listar Mapas
GET /maps

### Buscar mapa por ID
GET /maps/:id

### Atualizar elementos do mapa, exemplo: Pontos de interesse
PUT /maps/:id/features

Exemplo de requisição:
```
{ "type": "FeatureCollection", "features": [] }
```

### Listar favoritos
GET /auth/favorites

## Documentação: 
  - Acesso ao artigo do Projeto ALTAS.
  - Acesso ao [Plano de Projeto](https://github.com/Jopako/Altas/wiki).
