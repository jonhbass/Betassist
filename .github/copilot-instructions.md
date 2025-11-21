## StarWin — Guia sucinto para agentes AI

Objetivo rápido

- Este repo é uma SPA React criada com Vite. O agente deve entender o roteamento, assets estáticos e convenções de import para fazer mudanças seguras.

Arquitetura (big picture)

- Entrypoint: `src/main.jsx` -> `src/App.jsx` (que envolve `<BrowserRouter>`).
- Rotas: `src/routers/routers.jsx` exporta `Routers` (named export) e define as rotas principais: `/login` e `/home`.
- Páginas: `src/pages/Login.jsx` (autenticação simulada, grava `localStorage.authUser`) e `src/pages/Dashboard.jsx` (lê `authUser`, mostra carrossel e botão de logout).
- Estilos: `src/css/*.css` — cada página importa seu CSS relativo (ex.: `../css/Login.css`).

Fluxos e pontos críticos

- Login: usa um array `USERS` local; quando login OK grava `localStorage.setItem('authUser', username)` e navega `navigate('/home')`.
- Logout: `Dashboard` remove `authUser` e `navigate('/login', { replace: true })`.
- Assets: imagens referenciadas em código como `'/src/assets/...` ou importadas (ex.: `import Icon from '../assets/icon.svg'`). Preferir import quando editar componentes para bundling (ex.: `import Banner from '../assets/banners/1.png'`).

Dev / Build / Lint (comandos concretos)

- Desenvolvimento (HMR): `npm run dev` (executa `vite`).
- Build de produção: `npm run build` (executa `vite build`).
- Lint: `npm run lint` (executa `eslint .`).
- Preview do build: `npm run preview` (executa `vite preview`).

Dependências principais

- React 19, React Router Dom v7, Vite + `@vitejs/plugin-react-swc`.
- package.json tem `type: "module"` — use imports ESM (já em uso no código).

Padrões e convenções do projeto

- Imports relativos: componentes e CSS usam caminhos relativos a partir de `src` (ex.: `import Login from '../pages/Login'`). Verifique o número correto de `..` quando mover arquivos.
- Roteamento: `Routers` é um componente que devolve `<Routes>`; quaisquer novas páginas devem ser adicionadas lá.
- Estado de autenticação: sistema simples baseado em `localStorage.authUser`. Ao adicionar proteção de rota, verificar `localStorage` ou implementar um contexto.
- Assets estáticos: o projeto referencia assets em `/src/assets/...`. Para robustez, prefira `import img from '../assets/...'` dentro de componentes React para que o bundler trate o arquivo.

Edição segura — dicas práticas (exemplos)

- Se adicionar rota: editar `src/routers/routers.jsx` e registrar componente importado (usar `../pages/YourPage`).
- Corrigir import de CSS: arquivos em `src/pages/*` devem usar `import '../css/Some.css'` (não `./src/css/...`).
- Ao mover `Dashboard` ou alterar carrossel: ver `src/pages/Dashboard.jsx` — o carrossel usa `slides = ['/src/assets/banners/1.png', ...]` e intervalos via `setInterval` em `useEffect`. Para usar imports estáticos, troque por `import s1 from '../assets/banners/1.png'` e use `[s1, s2]`.

Verificações rápidas que o agente pode executar

- `npm run dev` inicia vite — se rota não carregar, checar console do navegador e terminal.
- `npm run lint` para detectar imports incorretos e problemas de estilo.
- Procurar `localStorage.getItem('authUser')`/`setItem('authUser'` para localizar auth flows.

Onde olhar primeiro (arquivos chave)

- `package.json` — scripts e deps
- `src/App.jsx`, `src/main.jsx` — entry
- `src/routers/routers.jsx` — rotas
- `src/pages/Login.jsx`, `src/pages/Dashboard.jsx` — comportamento auth e carrossel
- `src/css/Dashboard.css`, `src/css/Login.css` — estilos do layout/carrossel

Perguntas úteis para o dev humano

- Deseja que o auth permaneça em localStorage ou migrar para contexto/endpoint?
- Prefere que assets do carrossel sejam importados ou mantidos como caminhos absolutos?

Quando for contribuir com PRs

- Execute `npm run lint` e verifique o app em `npm run dev`.
- Mantenha imports ESM e caminhos relativos coerentes com a posição do arquivo.

Se algo não estiver detectável aqui (ex.: scripts de CI), pergunte ao maintainer antes de alterar o pipeline.

-- Fim
