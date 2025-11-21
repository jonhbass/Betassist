# Plano de Reorganização do Projeto StarWin

## Estrutura Atual vs Proposta

### ❌ Problemas Atuais:

1. Pasta `componets` (typo) ao invés de `components`
2. CSS não modularizado (todos em `src/css/`)
3. Falta de organização por feature/domínio
4. Arquivo `chat.json` não utilizado no servidor
5. Sem barrel exports (index.js)

### ✅ Estrutura Proposta:

```
src/
├── components/           # Componentes reutilizáveis (UI)
│   ├── common/          # Componentes genéricos
│   │   ├── Modal/
│   │   │   ├── index.jsx
│   │   │   └── Modal.css
│   │   ├── Toast/
│   │   │   ├── index.jsx
│   │   │   └── Toast.css
│   │   └── Footer/
│   │       ├── index.jsx
│   │       └── footer.css
│   │
│   ├── layout/          # Componentes de layout
│   │   ├── Topbar/
│   │   │   ├── index.jsx
│   │   │   └── Topbar.css
│   │   └── Sidebar/
│   │       ├── index.jsx
│   │       └── sidebar.css
│   │
│   ├── chat/            # Feature: Chat
│   │   ├── Chat/
│   │   │   ├── index.jsx
│   │   │   └── chat.css
│   │   ├── SupportButton/
│   │   │   ├── index.jsx
│   │   │   └── supportButton.css
│   │   └── SupportChatModal/
│   │       ├── index.jsx
│   │       └── SupportChatModal.css
│   │
│   ├── carousel/        # Feature: Carrossel
│   │   └── Carrossel/
│   │       ├── index.jsx
│   │       └── carrossel.css
│   │
│   └── modals/          # Modais específicos
│       ├── LoadModal/
│       │   └── index.jsx
│       ├── WithdrawModal/
│       │   └── index.jsx
│       └── HistoryModal/
│           └── index.jsx
│
├── features/            # Features complexas
│   └── admin-support/
│       ├── components/
│       │   ├── AdminSupport.jsx
│       │   ├── ThreadList.jsx
│       │   ├── ThreadView.jsx
│       │   └── UserSupport.jsx
│       ├── hooks/
│       │   ├── useAdminSupport.jsx
│       │   ├── useAutoScroll.js
│       │   ├── useKnownUsers.js
│       │   ├── useLocalStorage.js
│       │   └── useSocketMessages.js
│       ├── utils/
│       │   ├── apiService.js
│       │   └── threadHelpers.js
│       └── styles/
│           └── admin-support.css
│
├── pages/               # Páginas/Views
│   ├── Login/
│   │   ├── index.jsx
│   │   └── Login.css
│   ├── Dashboard/
│   │   ├── index.jsx
│   │   └── Dashboard.css
│   ├── AdminLogin/
│   │   └── index.jsx
│   ├── AdminDashboard/
│   │   └── index.jsx
│   └── Support/
│       └── index.jsx
│
├── routes/              # Configuração de rotas
│   └── index.jsx
│
├── hooks/               # Custom hooks globais
│   └── (hooks compartilhados)
│
├── utils/               # Utilitários globais
│   ├── auth.js
│   └── socket.js
│
├── styles/              # Estilos globais
│   ├── global.css
│   └── variables.css
│
├── assets/              # Assets estáticos
│   ├── images/
│   ├── icons/
│   └── banners/
│
├── App.jsx
└── main.jsx

server/
├── routes/              # Rotas da API (proposta futura)
├── controllers/         # Controllers (proposta futura)
├── data/                # Arquivos de dados
│   ├── chat-main.json
│   ├── chat-support.json
│   └── users.json
└── index.js
```

## Ações Imediatas Recomendadas:

### 1. Corrigir typo "componets" → "components"

```bash
# Renomear pasta
git mv src/componets src/components
```

### 2. Criar barrel exports (index.js)

Facilita imports: `import { Modal, Toast } from '@/components/common'`

### 3. Mover CSS para junto dos componentes

Princípio: "Colocation" - arquivos relacionados próximos

### 4. Limpar arquivos não utilizados

- `server/chat.json` (já temos chat-main.json e chat-support.json)

### 5. Adicionar path aliases no vite.config.js

```js
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
    '@components': path.resolve(__dirname, './src/components'),
    '@pages': path.resolve(__dirname, './src/pages'),
    '@utils': path.resolve(__dirname, './src/utils'),
    '@hooks': path.resolve(__dirname, './src/hooks'),
    '@features': path.resolve(__dirname, './src/features'),
  }
}
```

## Benefícios:

1. **Escalabilidade**: Estrutura clara para crescimento
2. **Manutenibilidade**: Fácil localizar e modificar código
3. **Reusabilidade**: Componentes bem organizados
4. **Performance**: Tree-shaking melhorado
5. **DX**: Imports mais limpos e intuitivos

## Migração Gradual:

Como o projeto está em desenvolvimento ativo, recomendo migração em fases:

**Fase 1**: Corrigir typo e adicionar path aliases
**Fase 2**: Mover CSS para junto dos componentes
**Fase 3**: Criar estrutura de features
**Fase 4**: Implementar barrel exports

---

**Nota**: Esta reorganização segue padrões da comunidade React e projetos como Next.js, Remix, e guidelines do próprio time React.
