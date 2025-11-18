/* eslint-env node */
/* global process */
import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import bcrypt from 'bcrypt';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
app.use(cors());
app.use(express.json());

const DATA = path.join(process.cwd(), 'server', 'users.json');
const CHAT_MAIN = path.join(process.cwd(), 'server', 'chat-main.json');
const CHAT_SUPPORT = path.join(process.cwd(), 'server', 'chat-support.json');
const PORT =
  typeof process !== 'undefined' && process.env && process.env.PORT
    ? process.env.PORT
    : 4000;

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

app.get('/health', (req, res) => res.json({ ok: true }));

// Return users (only usernames)
app.get('/users', (req, res) => {
  const users = readUsers();
  res.json(users.map((u) => ({ username: u.username })));
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
  if (users.some((u) => u.username === username))
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
  const u = users.find((x) => x.username === username);
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

// Create HTTP server and attach socket.io
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  console.log('socket connected', socket.id);

  // send current chat history (support messages)
  socket.emit('chat:history', readChatSupport());
  // send main chat history
  socket.emit('chat:main-history', readChatMain());

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
      io.emit('chat:history', next);
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

server.listen(PORT, () => {
  console.log('User API listening on port', PORT);
});
