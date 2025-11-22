let socket = null;
let urlUsed = null;

// Determinar URL do servidor - em produção usa a mesma origem
function getServerUrl() {
  // Se estiver em desenvolvimento (localhost)
  if (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1')
  ) {
    return import.meta.env.VITE_API_URL || 'http://localhost:4000';
  }
  // Em produção, usa a mesma origem (Render serve frontend e backend juntos)
  return typeof window !== 'undefined'
    ? window.location.origin
    : 'http://localhost:4000';
}

export async function ensureSocket(url) {
  // Se não fornecer URL, usa a detecção automática
  if (!url) {
    url = getServerUrl();
  }

  if (socket && url === urlUsed) return socket;
  urlUsed = url;

  console.log('🌐 Conectando socket ao servidor:', url);

  const mod = await import('socket.io-client');
  const ioFn = mod.io || mod.default || mod;
  socket = ioFn(url, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 20000,
    autoConnect: true,
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function on(event, cb) {
  if (!socket) return;
  socket.on(event, cb);
}

export function off(event, cb) {
  if (!socket) return;
  socket.off(event, cb);
}

export function emit(event, payload) {
  if (!socket) return;
  socket.emit(event, payload);
}
