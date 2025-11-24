/* eslint-env node */
/* global process */
import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import bcrypt from 'bcrypt';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { uploadReceipt, uploadImage } from './cloudinary.js';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();

// Em produção, confiar no proxy do Railway para identificar protocolo
app.enable('trust proxy');

// Middleware para forçar HTTPS e redirecionar para www em produção
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    const host = req.headers.host || '';
    const proto = req.headers['x-forwarded-proto'] || 'http';

    // Se acessar pelo domínio raiz (sem www), redirecionar para www
    if (host === 'starwin.site') {
      return res.redirect(301, `https://www.starwin.site${req.url}`);
    }

    // Se não for HTTPS, redirecionar para HTTPS
    if (proto !== 'https') {
      return res.redirect(`https://${host}${req.url}`);
    }
  }
  next();
});

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Aumentar limite para base64

// Configuração de diretório de dados (suporte a volumes persistentes)
const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'server');

// Garantir que o diretório de dados existe
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DATA = path.join(DATA_DIR, 'users.json');
const CHAT_MAIN = path.join(DATA_DIR, 'chat-main.json');
const CHAT_SUPPORT = path.join(DATA_DIR, 'chat-support.json');
const DEPOSITS = path.join(DATA_DIR, 'deposits.json');
const WITHDRAWALS = path.join(DATA_DIR, 'withdrawals.json');
const ADMINS = path.join(DATA_DIR, 'admins.json');
const BANNERS = path.join(DATA_DIR, 'banners.json');
const CONFIG = path.join(DATA_DIR, 'config.json');
const PORT =
  typeof process !== 'undefined' && process.env && process.env.PORT
    ? process.env.PORT
    : 8080;

function readUsers() {
  try {
    const raw = fs.readFileSync(DATA, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeUsers(list) {
  fs.writeFileSync(DATA, JSON.stringify(list, null, 2), 'utf-8');
}

function readChatMain() {
  try {
    const raw = fs.readFileSync(CHAT_MAIN, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeChatMain(list) {
  fs.writeFileSync(CHAT_MAIN, JSON.stringify(list, null, 2), 'utf-8');
}

function readChatSupport() {
  try {
    const raw = fs.readFileSync(CHAT_SUPPORT, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeChatSupport(list) {
  fs.writeFileSync(CHAT_SUPPORT, JSON.stringify(list, null, 2), 'utf-8');
}

function readDeposits() {
  try {
    const raw = fs.readFileSync(DEPOSITS, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeDeposits(list) {
  fs.writeFileSync(DEPOSITS, JSON.stringify(list, null, 2), 'utf-8');
}

function readWithdrawals() {
  try {
    const raw = fs.readFileSync(WITHDRAWALS, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeWithdrawals(list) {
  fs.writeFileSync(WITHDRAWALS, JSON.stringify(list, null, 2), 'utf-8');
}

function readBanners() {
  try {
    const raw = fs.readFileSync(BANNERS, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeBanners(list) {
  fs.writeFileSync(BANNERS, JSON.stringify(list, null, 2), 'utf-8');
}

function readAdmins() {
  try {
    const raw = fs.readFileSync(ADMINS, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAdmins(list) {
  fs.writeFileSync(ADMINS, JSON.stringify(list, null, 2), 'utf-8');
}

function readConfig() {
  try {
    const raw = fs.readFileSync(CONFIG, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function writeConfig(data) {
  fs.writeFileSync(CONFIG, JSON.stringify(data, null, 2), 'utf-8');
}

app.get('/health', (req, res) => res.json({ ok: true }));

// Return users (only usernames)
app.get('/users', (req, res) => {
  const users = readUsers();
  res.json(users.map((u) => ({ username: u.username })));
});

// Return specific user details (balance, history)
app.get('/users/:username', (req, res) => {
  const { username } = req.params;
  const users = readUsers();
  const user = users.find(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  );
  if (!user) return res.status(404).json({ error: 'not found' });

  res.json({
    username: user.username,
    balance: user.balance || 0,
    history: user.history || [],
  });
});

// Chat history - retorna mensagens de suporte (admin/user)
app.get('/messages', (req, res) => {
  const msgs = readChatSupport();
  res.json(msgs);
});

// Chat principal - mensagens do chat geral
app.get('/messages/main', (req, res) => {
  const msgs = readChatMain();
  res.json(msgs);
});

// Create user (username + password)
app.post('/users', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'missing' });
  const users = readUsers();
  if (users.some((u) => u.username.toLowerCase() === username.toLowerCase()))
    return res.status(409).json({ error: 'exists' });
  const hash = await bcrypt.hash(password, 10);
  users.push({ username, passwordHash: hash });
  writeUsers(users);
  res.status(201).json({ ok: true });
});

// Login endpoint (verify password)
app.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'missing' });
  const users = readUsers();
  const u = users.find(
    (x) => x.username.toLowerCase() === username.toLowerCase()
  );
  if (!u) return res.status(401).json({ error: 'invalid' });
  try {
    const ok = await bcrypt.compare(
      String(password),
      String(u.passwordHash || '')
    );
    if (!ok) return res.status(401).json({ error: 'invalid' });
    return res.json({ ok: true });
  } catch (err) {
    console.error('login error', err);
    return res.status(500).json({ error: 'error' });
  }
});

// Update user password
app.put('/users/:username', async (req, res) => {
  const username = req.params.username;
  const { password } = req.body || {};
  if (!password) return res.status(400).json({ error: 'missing' });
  const users = readUsers();
  const idx = users.findIndex((u) => u.username === username);
  if (idx === -1) return res.status(404).json({ error: 'not_found' });
  users[idx].passwordHash = await bcrypt.hash(password, 10);
  writeUsers(users);
  res.json({ ok: true });
});

// Delete user
app.delete('/users/:username', (req, res) => {
  const username = req.params.username;
  let users = readUsers();
  users = users.filter((u) => u.username !== username);
  writeUsers(users);
  res.json({ ok: true });
});

// Sync endpoint: replace all users (used by front-end fallback)
app.post('/users/sync', (req, res) => {
  const list = Array.isArray(req.body) ? req.body : [];
  // If received plain users with passwords in cleartext, hash them
  const mapped = list.map((u) => ({
    username: u.username,
    passwordHash: u.password
      ? bcrypt.hashSync(String(u.password), 10)
      : u.passwordHash || '',
  }));
  writeUsers(mapped);
  res.json({ ok: true });
});

// Upload de comprovante de depósito
app.post('/upload-receipt', async (req, res) => {
  try {
    const { base64Image, username, amount, holder } = req.body;

    if (!base64Image || !username || !amount || !holder) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }

    // Upload para Cloudinary (ou retorna base64 se não configurado)
    const receiptUrl = await uploadReceipt(base64Image);

    // Retorna URL ou base64 para o frontend salvar
    res.json({
      ok: true,
      receiptUrl,
      message: receiptUrl.startsWith('http')
        ? 'Upload realizado com sucesso'
        : 'Usando armazenamento local',
    });
  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ error: 'Erro no upload do comprovante' });
  }
});

// --- DEPOSITS ---
app.get('/deposits', (req, res) => {
  res.json(readDeposits());
});

app.post('/deposits', (req, res) => {
  const data = req.body || {};
  const list = readDeposits();
  // Ensure ID
  const newItem = { ...data, id: data.id || Date.now() };
  list.push(newItem);
  writeDeposits(list);
  res.status(201).json({ ok: true, item: newItem });
});

app.put('/deposits/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body || {};
  const list = readDeposits();
  const idx = list.findIndex((i) => String(i.id) === String(id));
  if (idx === -1) return res.status(404).json({ error: 'not found' });

  const oldStatus = list[idx].status;
  const newStatus = updates.status;

  list[idx] = { ...list[idx], ...updates };
  writeDeposits(list);

  // Se aprovado, atualizar saldo e histórico do usuário
  if (newStatus === 'Aprobada' && oldStatus !== 'Aprobada') {
    const amount = Number(list[idx].amount);
    const username = list[idx].user;

    const users = readUsers();
    const userIdx = users.findIndex(
      (u) => u.username.toLowerCase() === username.toLowerCase()
    );

    if (userIdx !== -1) {
      const user = users[userIdx];
      user.balance = (user.balance || 0) + amount;

      if (!user.history) user.history = [];
      user.history.push({
        id: Date.now(),
        type: 'Recarga',
        amount: amount,
        date: new Date().toLocaleString('es-AR'),
        status: 'Exitosa',
        message: updates.adminMessage || 'Depósito aprovado',
        canClaim: false,
      });

      writeUsers(users);

      const io = req.app.get('io');
      if (io) {
        io.emit('user:update', {
          username: user.username,
          balance: user.balance,
          history: user.history,
        });

        io.emit('notification:new', {
          id: Date.now(),
          username: user.username,
          type: 'deposit_approved',
          amount: amount,
          message: updates.adminMessage || 'Depósito aprovado',
          date: new Date().toLocaleString('es-AR'),
        });
      }
    }
  }

  res.json({ ok: true, item: list[idx] });
});

// --- WITHDRAWALS ---
app.get('/withdrawals', (req, res) => {
  res.json(readWithdrawals());
});

app.post('/withdrawals', (req, res) => {
  const data = req.body || {};
  const list = readWithdrawals();
  const newItem = { ...data, id: data.id || Date.now() };
  list.push(newItem);
  writeWithdrawals(list);
  res.status(201).json({ ok: true, item: newItem });
});

app.put('/withdrawals/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body || {};
  const list = readWithdrawals();
  const idx = list.findIndex((i) => String(i.id) === String(id));
  if (idx === -1) return res.status(404).json({ error: 'not found' });

  const oldStatus = list[idx].status;
  const newStatus = updates.status;

  list[idx] = { ...list[idx], ...updates };
  writeWithdrawals(list);

  // Se aprovado, atualizar saldo e histórico do usuário
  if (newStatus === 'Aprobada' && oldStatus !== 'Aprobada') {
    const amount = Number(list[idx].amount);
    const username = list[idx].user;

    const users = readUsers();
    const userIdx = users.findIndex(
      (u) => u.username.toLowerCase() === username.toLowerCase()
    );

    if (userIdx !== -1) {
      const user = users[userIdx];

      // SUBTRAIR O VALOR DO SALDO
      const currentBalance = user.balance || 0;
      const newBalance = Math.max(0, currentBalance - amount);
      user.balance = newBalance;

      console.log(
        `💸 Retiro aprovado: ${username} - Saldo anterior: $${currentBalance} → Nuevo saldo: $${newBalance}`
      );

      if (!user.history) user.history = [];
      user.history.push({
        id: Date.now(),
        type: 'Retiro',
        amount: amount,
        date: new Date().toLocaleString('es-AR'),
        status: 'Exitosa',
        message: updates.adminMessage || 'Retiro aprovado',
        canClaim: false,
      });

      writeUsers(users);

      const io = req.app.get('io');
      if (io) {
        // Emitir atualização de saldo e histórico
        io.emit('user:update', {
          username: user.username,
          balance: user.balance,
          history: user.history,
        });

        // Emitir notificação de retirada aprovada
        io.emit('notification:new', {
          id: Date.now(),
          username: user.username,
          type: 'withdraw_approved',
          amount: amount,
          message: `Tu solicitud de retiro de $${amount.toLocaleString(
            'es-AR'
          )} fue aprobada!`,
          date: new Date().toLocaleString('es-AR'),
        });
      }
    }
  }

  res.json({ ok: true, item: list[idx] });
});

// --- ADMINS ---
app.get('/admins', (req, res) => {
  res.json(readAdmins());
});

app.post('/admins', (req, res) => {
  const data = req.body || {};
  const list = readAdmins();
  if (
    list.some(
      (a) => a.username.toLowerCase() === (data.username || '').toLowerCase()
    )
  ) {
    return res.status(409).json({ error: 'Username already exists' });
  }
  const newItem = { ...data, id: data.id || Date.now() };
  list.push(newItem);
  writeAdmins(list);
  res.status(201).json({ ok: true, item: newItem });
});

app.put('/admins/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body || {};
  const list = readAdmins();
  const idx = list.findIndex((i) => String(i.id) === String(id));
  if (idx === -1) return res.status(404).json({ error: 'not found' });

  list[idx] = { ...list[idx], ...updates };
  writeAdmins(list);
  res.json({ ok: true, item: list[idx] });
});

app.delete('/admins/:id', (req, res) => {
  const { id } = req.params;
  let list = readAdmins();
  list = list.filter((i) => String(i.id) !== String(id));
  writeAdmins(list);
  res.json({ ok: true });
});

// --- BANNERS ---
// (Routes merged below with Cloudinary support)

// --- BANNERS ---
app.get('/banners', (req, res) => {
  res.json(readBanners());
});

app.post('/banners', async (req, res) => {
  try {
    const banner = req.body || {};
    if (!banner.url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Se for base64 (upload de arquivo), enviar para Cloudinary
    if (banner.url.startsWith('data:image')) {
      console.log('📤 Uploading banner to Cloudinary...');
      const cloudinaryUrl = await uploadImage(banner.url, 'starwin-banners');
      banner.url = cloudinaryUrl;
    }

    const list = readBanners();
    const next = [...list, banner];
    writeBanners(next);
    res.json(next);
  } catch (error) {
    console.error('Error saving banner:', error);
    res.status(500).json({ error: 'Failed to save banner' });
  }
});

app.delete('/banners/:id', (req, res) => {
  const { id } = req.params;
  const list = readBanners();
  const next = list.filter((b) => String(b.id) !== String(id));
  writeBanners(next);
  res.json(next);
});

// --- CONFIG (CBU) ---
app.get('/config', (req, res) => {
  res.json(readConfig());
});

app.post('/config', (req, res) => {
  const data = req.body || {};
  const current = readConfig();
  const next = { ...current, ...data };
  writeConfig(next);
  res.json({ ok: true, config: next });
});

// Create HTTP server and attach socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log('socket connected', socket.id);

  // send current chat history (support messages)
  socket.emit('chat:history', readChatSupport());
  // send main chat history
  socket.emit('chat:main-history', readChatMain());

  // Send current chat enabled state
  const config = readConfig();
  socket.emit('chat:state-changed', { enabled: config.chatEnabled !== false });

  socket.on('chat:message', (msg) => {
    try {
      console.log('server received chat:message (support)', msg);
      const list = readChatSupport();
      const next = [...list, msg];
      writeChatSupport(next);
      io.emit('chat:message', msg);
    } catch (e) {
      console.error('support chat write failed', e);
    }
  });

  socket.on('chat:main-message', (msg) => {
    try {
      console.log('server received chat:main-message', msg);
      const list = readChatMain();
      const next = [...list, msg];
      writeChatMain(next);
      io.emit('chat:main-message', msg);
    } catch (e) {
      console.error('main chat write failed', e);
    }
  });

  socket.on('chat:typing', (payload) => {
    socket.broadcast.emit('chat:typing', payload);
  });

  socket.on('chat:toggle-global', (data) => {
    console.log('⚙️ Admin alterou estado do chat globalmente:', data.enabled);
    const current = readConfig();
    const next = { ...current, chatEnabled: data.enabled };
    writeConfig(next);
    console.log('💾 Config salvo:', next);
    console.log('📡 Emitindo chat:state-changed para todos os clientes');
    io.emit('chat:state-changed', { enabled: data.enabled });
  });

  socket.on('chat:disable-global', () => {
    console.log('Admin desativou o chat globalmente');
    io.emit('chat:disabled');
  });

  socket.on('chat:clear-global', () => {
    console.log('Admin limpou o chat globalmente');
    // Limpa o histórico no servidor
    try {
      writeChatMain([]);
      console.log('Histórico do chat principal limpo no servidor');
    } catch (e) {
      console.error('Erro ao limpar chat no servidor:', e);
    }
    // Notifica todos os clientes para limparem
    io.emit('chat:cleared');
  });
});

// Persist a support message via REST and broadcast to connected sockets
app.post('/messages', (req, res) => {
  const msg = req.body || {};
  try {
    const list = readChatSupport();
    const next = [...list, msg];
    writeChatSupport(next);
    // broadcast to all connected clients
    try {
      io.emit('chat:message', msg);
    } catch {
      /* ignore if sockets not ready */
    }
    return res.status(201).json({ ok: true });
  } catch (e) {
    console.error('failed to persist message', e);
    return res.status(500).json({ error: 'failed' });
  }
});

// Persist a main chat message via REST and broadcast
app.post('/messages/main', (req, res) => {
  const msg = req.body || {};
  try {
    const list = readChatMain();
    const next = [...list, msg];
    writeChatMain(next);
    try {
      io.emit('chat:main-message', msg);
    } catch {
      /* ignore if sockets not ready */
    }
    return res.status(201).json({ ok: true });
  } catch (e) {
    console.error('failed to persist main message', e);
    return res.status(500).json({ error: 'failed' });
  }
});

// Mark admin messages in a thread as seen by a username
app.post('/messages/seen', (req, res) => {
  const { thread, username } = req.body || {};
  if (!thread || !username) return res.status(400).json({ error: 'missing' });
  try {
    const list = readChatSupport();
    const next = list.map((m) => {
      if (m.from === 'admin' && m.thread === thread) {
        const seen = Array.isArray(m.seenBy)
          ? Array.from(new Set([...(m.seenBy || []), username]))
          : [username];
        return { ...m, seenBy: seen };
      }
      return m;
    });
    writeChatSupport(next);
    try {
      // Emite o histórico completo atualizado
      io.emit('chat:history', next);
      // Emite evento específico de mensagens vistas
      io.emit('chat:messages-seen', { thread, username });
    } catch {
      void 0;
    }
    return res.json({ ok: true });
  } catch (err) {
    console.error('failed to mark seen', err);
    return res.status(500).json({ error: 'failed' });
  }
});

// Mark user messages in a thread as handled (admin acted)
app.post('/messages/mark-handled', (req, res) => {
  const { thread } = req.body || {};
  if (!thread) return res.status(400).json({ error: 'missing' });
  try {
    const list = readChatSupport();
    const target = String(thread || '').toLowerCase();
    const next = list.map((m) => {
      try {
        const mkey = String(m.thread || m.from || '').toLowerCase();
        return mkey === target && m.from !== 'admin'
          ? { ...m, handled: true }
          : m;
      } catch {
        return m;
      }
    });
    writeChatSupport(next);
    try {
      io.emit('chat:history', next);
    } catch {
      void 0;
    }
    return res.json({ ok: true });
  } catch (err) {
    console.error('failed to mark handled', err);
    return res.status(500).json({ error: 'failed' });
  }
});

// Servir arquivos estáticos do build em produção
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));

  // Rota catch-all para SPA (React Router) - deve ser a última rota
  app.use((req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

server.listen(PORT, () => {
  console.log('🚀 StarWin Server listening on port', PORT);
  console.log('📁 Environment:', process.env.NODE_ENV || 'development');
});
