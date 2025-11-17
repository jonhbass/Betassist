let socket = null;
let urlUsed = null;

export async function ensureSocket(
  url = import.meta.env.VITE_API_URL || 'http://localhost:4000'
) {
  if (socket && url === urlUsed) return socket;
  urlUsed = url;
  const mod = await import('socket.io-client');
  const ioFn = mod.io || mod.default || mod;
  socket = ioFn(url);
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
