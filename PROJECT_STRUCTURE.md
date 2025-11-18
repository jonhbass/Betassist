# Betassist - Estrutura de Organização

## 📁 Estrutura Atual do Projeto

```
Betassist/
├── .github/                  # GitHub workflows e configs
├── .vscode/                  # Configurações do VSCode
├── public/                   # Assets públicos estáticos
├── server/                   # Backend Node.js + Socket.IO
│   ├── data/                # Dados JSON (proposta)
│   ├── chat-main.json       # Chat público
│   ├── chat-support.json    # Chat de suporte admin
│   ├── users.json           # Usuários cadastrados
│   └── index.js             # Servidor Express + Socket.IO
│
├── src/
│   ├── assets/              # Imagens, ícones, banners
│   │   └── banners/
│   │
│   ├── componets/           # ⚠️ TYPO: deveria ser "components"
│   │   ├── admin-support/   # Feature: Suporte Admin
│   │   │   ├── hooks/
│   │   │   ├── utils/
│   │   │   ├── AdminSupport.jsx
│   │   │   ├── ThreadList.jsx
│   │   │   ├── ThreadView.jsx
│   │   │   └── admin-support.css
│   │   ├── Chat.jsx
│   │   ├── Carrossel.jsx
│   │   ├── Footer.jsx
│   │   ├── Modal.jsx
│   │   ├── Sidebar.jsx
│   │   ├── SupportButton.jsx
│   │   ├── Toast.jsx
│   │   ├── Topbar.jsx
│   │   └── index.js         # ✅ Barrel export
│   │
│   ├── css/                 # Estilos globais e componentes
│   │   ├── variables.css    # ✅ Variáveis CSS
│   │   ├── App.css          # Reset e estilos globais
│   │   ├── Dashboard.css
│   │   ├── Login.css
│   │   ├── admin.css
│   │   ├── sidebar.css
│   │   ├── chat.css
│   │   ├── carrossel.css
│   │   ├── footer.css
│   │   └── supportButton.css
│   │
│   ├── pages/               # Páginas da aplicação
│   │   ├── AdminDashboard.jsx
│   │   ├── AdminLogin.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Login.jsx
│   │   ├── Support.jsx
│   │   └── index.js         # ✅ Barrel export
│   │
│   ├── routers/             # Configuração de rotas
│   │   └── routers.jsx
│   │
│   ├── utils/               # Utilitários globais
│   │   ├── auth.js          # Autenticação
│   │   ├── socket.js        # Socket.IO client
│   │   └── index.js         # ✅ Barrel export
│   │
│   ├── App.jsx              # Componente raiz
│   └── main.jsx             # Entry point
│
├── .env                     # Variáveis de ambiente
├── .prettierrc              # Configuração Prettier
├── eslint.config.js         # Configuração ESLint
├── package.json
├── vite.config.js           # ✅ Com path aliases
├── README.md
├── REORGANIZATION_PLAN.md   # 📋 Plano de reorganização
└── IMPROVEMENTS_APPLIED.md  # ✅ Melhorias aplicadas
```

## 🎯 Convenções Adotadas

### Nomenclatura:

- **Componentes**: PascalCase (ex: `Dashboard.jsx`, `SupportButton.jsx`)
- **Utilitários**: camelCase (ex: `auth.js`, `socket.js`)
- **CSS**: kebab-case ou componentName.css (ex: `sidebar.css`)
- **Pastas**: kebab-case (ex: `admin-support/`)

### Estrutura de Componentes:

```
Component/
├── index.jsx        # Componente principal
├── Component.css    # Estilos do componente
└── Component.test.jsx # Testes (futuro)
```

### Imports:

- **Absolutos com alias**: `import { Chat } from '@components'`
- **Relativos para mesmo nível**: `import './Component.css'`

## 🔧 Path Aliases Configurados

| Alias         | Path              | Uso          |
| ------------- | ----------------- | ------------ |
| `@`           | `./src`           | Raiz do src  |
| `@components` | `./src/componets` | Componentes  |
| `@pages`      | `./src/pages`     | Páginas      |
| `@utils`      | `./src/utils`     | Utilitários  |
| `@hooks`      | `./src/hooks`     | Custom hooks |
| `@styles`     | `./src/css`       | Estilos      |
| `@assets`     | `./src/assets`    | Assets       |

## 📊 Métricas do Projeto

- **Total de Componentes**: ~15
- **Total de Páginas**: 5
- **Total de Estilos CSS**: 9 arquivos
- **Features Principais**: Dashboard, Admin Support, Chat, Carrossel

## 🚀 Próximas Melhorias

1. [ ] Renomear `componets` → `components`
2. [ ] Mover CSS para junto dos componentes
3. [ ] Criar pasta `src/hooks` para hooks globais
4. [ ] Adicionar testes unitários
5. [ ] Implementar TypeScript (opcional)
6. [ ] Documentar componentes com JSDoc

## 📚 Referências

- [React File Structure Best Practices](https://react.dev/learn/thinking-in-react)
- [Vite Path Aliases](https://vitejs.dev/config/shared-options.html#resolve-alias)
- [Barrel Exports Pattern](https://basarat.gitbook.io/typescript/main-1/barrel)
