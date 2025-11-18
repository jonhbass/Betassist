/**
 * Gera e persiste um ID único para visitantes externos
 * Formato: usuario1, usuario2, usuario3, etc.
 */

const VISITOR_ID_KEY = 'VISITOR_ID';
const VISITOR_COUNTER_KEY = 'VISITOR_COUNTER';

/**
 * Obtém ou cria um ID de visitante único
 * @returns {string} ID do visitante (ex: 'usuario1')
 */
export function getOrCreateVisitorId() {
  // Verifica se já existe um ID armazenado
  const existingId = localStorage.getItem(VISITOR_ID_KEY);
  if (existingId) {
    return existingId;
  }

  // Se não existe, gera um novo ID
  const counter = getNextCounter();
  const newId = `usuario${counter}`;

  // Armazena o ID para uso futuro
  localStorage.setItem(VISITOR_ID_KEY, newId);

  return newId;
}

/**
 * Obtém o próximo número do contador global de visitantes
 * @returns {number}
 */
function getNextCounter() {
  try {
    const stored = localStorage.getItem(VISITOR_COUNTER_KEY);
    const current = stored ? parseInt(stored, 10) : 0;
    const next = current + 1;
    localStorage.setItem(VISITOR_COUNTER_KEY, next.toString());
    return next;
  } catch (e) {
    // Fallback para timestamp se houver erro
    return Date.now() % 10000;
  }
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
    !username || username === 'Visitante' || username.startsWith('usuario')
  );
}
