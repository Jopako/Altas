<div align="center">
  <h1>ALTAS</h1>
  <p>Alunos: João Paulo Kowalski, Julia Luzzi Baldissera & Samuel Castilho Pereira </p>
</div>

# Introdução
A complexidade arquitetônica de instituições de ensino contemporâneas, frequentemente compostas por múltiplos blocos, níveis e setores administrativos, impõe desafios significativos à mobilidade e à localização espacial de seus usuários. Para alunos ingressantes, servidores e visitantes, a dificuldade em identificar serviços institucionais e estruturas de apoio pode gerar desorientação e comprometer a eficiência das atividades cotidianas. Nesse cenário, a transformação de plantas arquitetônicas estáticas em interfaces digitais dinâmicas surge como uma solução estratégica para democratizar o acesso à informação espacial.

# Funcionalidades e Objetivos

## Objetivos:

Desenvolver uma aplicação web de arquitetura generalista capaz de processar plantas arquitetônicas estáticas e convertê-las em mapas interativos navegáveis, integrando informações institucionais e recursos de acessibilidade para otimizar a orientação espacial em ambientes educacionais.

## Funcionalidades Principais:
Motor de Ingestão e Processamento de Dados:

- Conversão automatizada de plantas em formato PDF para formatos vetoriais (SVG ou GeoJSON).
- Extração de elementos geométricos para a criação de camadas navegáveis.
- Sistema de georreferenciamento interno para alinhar as coordenadas da planta ao sistema de navegação digital.

Módulo Administrativo e Edição:

- Interface intuitiva para que gestores possam cadastrar e editar Pontos de Interesse (POIs), como salas de aula, laboratórios e banheiros.
- Ferramentas de limpeza visual para ocultar elementos técnicos irrelevantes da planta original e destacar rotas de circulação.
- Gestão de pavimentos, permitindo a visualização alternada de diferentes andares do mesmo edifício.
  
Interface de Navegação Interativa (Frontend):

- Visualização dinâmica do mapa com controles de zoom e movimentação (pan), utilizando a biblioteca Leaflet.
- Sistema de busca rápida para localização de setores, servidores ou serviços específicos.
- Filtro de Acessibilidade: Camada específica para visualização de rampas, elevadores e rotas adaptadas.
- Prototipagem rápida de interfaces e funções lógicas, permitindo validações constantes e ajustes de usabilidade sem ciclos extensos de desenvolvimento manual.
  
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

### Ambiente e Banco de Dados:
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)

---

## Como Executar o Projeto com Docker Compose

O projeto está totalmente conteinerizado com **Docker**, o que elimina a necessidade de configurar dependências locais do Node.js na sua máquina de desenvolvimento.

### Pré-requisitos
- Docker instalado.
- Docker Compose instalado.

### Passo a Passo

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
   - **Frontend (Visualização/Login)**: [http://localhost:5173](http://localhost:5173)
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
