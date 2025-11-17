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
const CHAT = path.join(process.cwd(), 'server', 'chat.json');
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

function readChat() {
  try {
    const raw = fs.readFileSync(CHAT, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeChat(list) {
  fs.writeFileSync(CHAT, JSON.stringify(list, null, 2), 'utf-8');
}

app.get('/health', (req, res) => res.json({ ok: true }));

// Return users (only usernames)
app.get('/users', (req, res) => {
  const users = readUsers();
  res.json(users.map((u) => ({ username: u.username })));
});

// Chat history
app.get('/messages', (req, res) => {
  const msgs = readChat();
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

  // send current chat history
  socket.emit('chat:history', readChat());

  socket.on('chat:message', (msg) => {
    try {
      console.log('server received chat:message', msg);
      const list = readChat();
      const next = [...list, msg];
      writeChat(next);
      io.emit('chat:message', msg);
    } catch (e) {
      console.error('chat write failed', e);
    }
  });

  socket.on('chat:typing', (payload) => {
    socket.broadcast.emit('chat:typing', payload);
  });
});

// Persist a message via REST and broadcast to connected sockets
app.post('/messages', (req, res) => {
  const msg = req.body || {};
  try {
    const list = readChat();
    const next = [...list, msg];
    writeChat(next);
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

// Mark admin messages in a thread as seen by a username
app.post('/messages/seen', (req, res) => {
  const { thread, username } = req.body || {};
  if (!thread || !username) return res.status(400).json({ error: 'missing' });
  try {
    const list = readChat();
    const next = list.map((m) => {
      if (m.from === 'admin' && m.thread === thread) {
        const seen = Array.isArray(m.seenBy)
          ? Array.from(new Set([...(m.seenBy || []), username]))
          : [username];
        return { ...m, seenBy: seen };
      }
      return m;
    });
    writeChat(next);
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
    const list = readChat();
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
    writeChat(next);
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
