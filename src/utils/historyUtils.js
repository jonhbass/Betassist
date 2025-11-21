/**
 * Utilitário para gerenciar histórico de transações dos usuários
 */

/**
 * Adiciona uma bonificação ao histórico do usuário
 * @param {string} username - Nome do usuário
 * @param {number} amount - Valor da bonificação
 * @param {string} message - Mensagem descritiva
 */
export function addBonusToHistory(
  username,
  amount,
  message = 'Bonificación de bienvenida'
) {
  try {
    const history = JSON.parse(localStorage.getItem('USER_HISTORY') || '[]');

    history.push({
      id: Date.now(),
      user: username,
      date: new Date().toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      amount: amount,
      type: 'Bonificaciones',
      message: message,
      status: 'Exitosa',
      canClaim: false,
    });

    localStorage.setItem('USER_HISTORY', JSON.stringify(history));
    console.log(`✅ Bonificação adicionada para ${username}: $${amount}`);
    return true;
  } catch (error) {
    console.error('Erro ao adicionar bonificação:', error);
    return false;
  }
}

/**
 * Obtém o histórico de um usuário específico
 * @param {string} username - Nome do usuário
 * @returns {Array} Lista de transações do usuário
 */
export function getUserHistory(username) {
  try {
    const allHistory = JSON.parse(localStorage.getItem('USER_HISTORY') || '[]');
    return allHistory.filter((item) => item.user === username);
  } catch (error) {
    console.error('Erro ao obter histórico:', error);
    return [];
  }
}

/**
 * Limpa o histórico de todos os usuários
 */
export function clearAllHistory() {
  localStorage.removeItem('USER_HISTORY');
  console.log('🗑️ Histórico limpo');
}
