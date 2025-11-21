# 🎯 StarWin - Deploy no Render

## 📋 Pré-requisitos

1. Conta no [Render](https://render.com) (gratuita)
2. Conta no [Cloudinary](https://cloudinary.com) (gratuita - opcional)
3. Repositório GitHub conectado

---

## 🚀 Passo a Passo - Deploy no Render

### 1️⃣ **Criar Web Service**

1. Acesse [Render Dashboard](https://dashboard.render.com)
2. Clique em **"New +"** → **"Web Service"**
3. Conecte seu repositório GitHub `StarWin`
4. Configure:

```
Name: starwin
Region: Ohio (US East) ou qualquer
Branch: branch-developed
Root Directory: (deixe vazio)
Environment: Node
Build Command: npm install && npm run build
Start Command: node server/index.js
```

---

### 2️⃣ **Configurar Variáveis de Ambiente**

No painel do Render, vá em **Environment** e adicione:

#### ⚙️ Obrigatórias:

```bash
NODE_ENV=production
PORT=10000  # Render define automaticamente
```

#### 🖼️ Cloudinary (OPCIONAL - apenas para produção):

Se quiser salvar comprovantes permanentemente:

1. Acesse [Cloudinary Dashboard](https://cloudinary.com/console)
2. Copie suas credenciais em **Account Details**
3. Adicione no Render:

```bash
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=seu_api_secret
```

> **⚠️ SEM Cloudinary:** App funcionará normalmente usando localStorage (dados ficam no navegador)

---

### 3️⃣ **Deploy Automático**

Clique em **"Create Web Service"** e aguarde o deploy (5-10 min).

Render irá:

- ✅ Instalar dependências
- ✅ Fazer build do Vite
- ✅ Iniciar servidor Node.js
- ✅ Gerar URL: `https://starwin.onrender.com`

---

## 🔧 Desenvolvimento Local

### Sem Cloudinary (Recomendado):

```bash
npm install
npm run dev      # Frontend (Vite)
npm run server   # Backend (Node.js)
```

App usará **localStorage** automaticamente.

### Com Cloudinary (Opcional):

```bash
cp .env.example .env
# Edite .env com suas credenciais Cloudinary
npm run dev
npm run server
```

---

## 📱 Funcionalidades

### ✅ Funcionam em TODOS os cenários:

- Login/Logout
- Dashboard
- Chat em tempo real (Socket.IO)
- Solicitações de depósito/saque
- Gestão de usuários (admin)
- Notificações

### 🖼️ Upload de Comprovantes:

| Ambiente                | Cloudinary          | localStorage    |
| ----------------------- | ------------------- | --------------- |
| **Local dev**           | ❌ Não configurado  | ✅ Funciona     |
| **Render (sem config)** | ❌ Não configurado  | ✅ Funciona     |
| **Render (com config)** | ✅ URLs permanentes | ❌ Desabilitado |

---

## 🐛 Troubleshooting

### Erro: "Cannot GET /"

- Verifique `Build Command` e `Start Command`
- Certifique-se que `dist/` foi gerado no build

### Comprovantes não aparecem

- **Local:** Verifique se servidor backend está rodando (`npm run server`)
- **Render:** Verifique logs em "Logs" no dashboard

### WebSocket não conecta

- Render suporta WebSockets nativamente
- Verifique se `PORT` está correto no `.env` (deve ser automático)

---

## 📞 Suporte

Problemas? Abra uma issue no GitHub!
