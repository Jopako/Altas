<<<<<<< HEAD
<div align="center">
  <h1>ALTAS</h1>
  <p>Alunos: João Paulo Kowalski, Julia Luzzi Baldissera & Samuel Castilho Pereira </p>
</div>

# Introdução
A complexidade arquitetônica de instituições de ensino contemporâneas, frequentemente compostas por múltiplos blocos, níveis e setores administrativos, impõe desafios significativos à mobilidade e à localização espacial de seus usuários. Para alunos ingressantes, servidores e visitantes, a dificuldade em identificar serviços institucionais e estruturas de apoio pode gerar desorientação e comprometer a eficiência das atividades cotidianas. Nesse cenário, a transformação de plantas arquitetônicas estáticas em interfaces digitais dinâmicas surge como uma solução estratégica para democratizar o acesso à informação espacial.

# Funcionalidade e Objetivos

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

## Techs
### Front / Backend:  ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
### DataBase:  ![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
=======
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
>>>>>>> 7c62233 (ADD: Estrutura inicial)
