# React project + Vite

Este projeto inclui um chat interno em real-time, com login e adm para gerenciar usuarios e senhas.
Junto ao projeto tem um espaço para envio de documentos, necessitando de um STORAGE de armazenamento.

## Administração local (admin)

Este projeto inclui um painel de administração simples para criar/remover usuários locais (apenas para desenvolvimento).

- Ao executar em desenvolvimento, defina a senha do admin com a variável de ambiente Vite: `VITE_ADMIN_PASSWORD`.
	- Crie um arquivo `.env` na raiz com, por exemplo:

		```env
		VITE_ADMIN_PASSWORD=suasenhaadmin
		```

	- Em seguida rode:

		```bash
		npm install
		npm run dev
		```

- A página de login principal (`/login`) agora aceita usuários que o admin criar. Para entrar no painel de administração navegue para `/admin-login` e use a senha definida.

Notas de segurança:
- A implementação atual é apenas para demonstração/local: os usuários e senhas são armazenados em `localStorage` em texto claro. Não use isso em produção.
- Para produção, mova o gerenciamento de usuários para um backend seguro com hashing de senhas e autenticação adequada.

## API de usuários (opcional)

Implementei um pequeno servidor Express em `server/index.js` que fornece endpoints CRUD para usuários (armazenados em `server/users.json`) com senhas em hash (bcrypt). Isso é opcional — o front-end continuará funcionando usando `localStorage` quando `VITE_USE_API` não estiver definido.

Como usar:

1. Instale dependências do servidor (na raiz do projeto):

```bash
npm install express bcrypt cors
```

2. Inicie o servidor:

```bash
npm run server
```

3. Habilite o uso da API pelo front-end criando `.env` com:

```env
VITE_USE_API=true
VITE_ADMIN_PASSWORD=suasenhaadmin
```

4. Reinicie o dev server (`npm run dev`) e abra o app. O painel admin usará o servidor em `http://localhost:4000`.

Notas:
- O servidor grava em `server/users.json`. Em um ambiente real prefira um banco de dados.
- Ainda é um exemplo de desenvolvimento; para produção providencie autenticação segura e proteção do endpoint.
