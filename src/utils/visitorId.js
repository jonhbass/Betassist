/**
 * Gera e persiste um ID único para visitantes externos
 * Formato: visitante_<uuid> para garantir unicidade entre dispositivos
 */

const VISITOR_ID_KEY = 'VISITOR_ID';

/**
 * Gera um UUID v4 simples
 * @returns {string}
 */
function generateUUID() {
  // Usa crypto.randomUUID se disponível (navegadores modernos)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback para geração manual
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Obtém ou cria um ID de visitante único
 * @returns {string} ID do visitante (ex: 'visitante_a1b2c3d4')
 */
export function getOrCreateVisitorId() {
  // Verifica se já existe um ID armazenado
  const existingId = localStorage.getItem(VISITOR_ID_KEY);
  if (existingId) {
    return existingId;
  }

  // Se não existe, gera um novo ID único
  const uuid = generateUUID();
  // Usa os primeiros 8 caracteres do UUID para um ID mais curto mas ainda único
  const shortId = uuid.replace(/-/g, '').substring(0, 8);
  const newId = `visitante_${shortId}`;

  // Armazena o ID para uso futuro
  localStorage.setItem(VISITOR_ID_KEY, newId);

  return newId;
}

/**
 * Limpa o ID do visitante (útil após fazer login com sucesso)
 */
export function clearVisitorId() {
  localStorage.removeItem(VISITOR_ID_KEY);
}

/**
 * Verifica se o usuário atual é um visitante externo
 * @param {string} username
 * @returns {boolean}
 */
export function isVisitor(username) {
  return (
    !username ||
    username === 'Visitante' ||
    username.startsWith('usuario') ||
    username.startsWith('visitante_')
  );
}
