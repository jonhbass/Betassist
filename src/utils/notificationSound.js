/**
 * Utilitário de sons de notificação para admins
 * Usa Web Audio API para gerar sons curtos e suaves
 */

let audioContext = null;

// Chave para persistir preferência de som
const SOUND_ENABLED_KEY = 'ADMIN_SOUND_ENABLED';

/**
 * Verifica se o som está habilitado
 * @returns {boolean}
 */
export function isSoundEnabled() {
  const stored = localStorage.getItem(SOUND_ENABLED_KEY);
  // Por padrão, som está habilitado
  return stored === null ? true : stored === 'true';
}

/**
 * Habilita ou desabilita o som
 * @param {boolean} enabled
 */
export function setSoundEnabled(enabled) {
  localStorage.setItem(SOUND_ENABLED_KEY, String(enabled));
}

/**
 * Alterna o estado do som
 * @returns {boolean} O novo estado
 */
export function toggleSound() {
  const newState = !isSoundEnabled();
  setSoundEnabled(newState);
  return newState;
}

// Inicializa o AudioContext (necessário após interação do usuário)
function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  // Resume se estiver suspenso (política de autoplay dos navegadores)
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
}

/**
 * Gera um som curto e suave
 * @param {number} frequency - Frequência em Hz
 * @param {number} duration - Duração em segundos
 * @param {string} type - Tipo de onda: 'sine', 'square', 'triangle', 'sawtooth'
 * @param {number} volume - Volume de 0 a 1
 */
function playTone(frequency, duration = 0.15, type = 'sine', volume = 0.3) {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    // Envelope suave para evitar cliques
    const now = ctx.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume, now + 0.01); // Attack rápido
    gainNode.gain.linearRampToValueAtTime(volume * 0.7, now + duration * 0.5); // Sustain
    gainNode.gain.linearRampToValueAtTime(0, now + duration); // Release suave

    oscillator.start(now);
    oscillator.stop(now + duration);
  } catch (e) {
    console.warn('Não foi possível tocar o som:', e);
  }
}

/**
 * Sons de notificação por tipo
 */
const soundConfigs = {
  // Som de nova mensagem - dois tons suaves ascendentes
  message: () => {
    playTone(523.25, 0.1, 'sine', 0.25); // C5
    setTimeout(() => playTone(659.25, 0.15, 'sine', 0.2), 100); // E5
  },

  // Som de depósito - tom mais grave e reconfortante
  deposit: () => {
    playTone(392, 0.12, 'sine', 0.25); // G4
    setTimeout(() => playTone(523.25, 0.18, 'sine', 0.2), 120); // C5
  },

  // Som de saque - tom de alerta suave
  withdraw: () => {
    playTone(440, 0.1, 'sine', 0.25); // A4
    setTimeout(() => playTone(554.37, 0.12, 'sine', 0.2), 80); // C#5
    setTimeout(() => playTone(659.25, 0.15, 'sine', 0.18), 160); // E5
  },

  // Som de notificação geral - único tom suave
  notification: () => {
    playTone(587.33, 0.2, 'sine', 0.25); // D5
  },
};

/**
 * Toca o som de notificação do tipo especificado
 * @param {'message' | 'deposit' | 'withdraw' | 'notification'} type - Tipo de notificação
 */
export function playNotificationSound(type = 'notification') {
  // Verificar se o som está habilitado
  if (!isSoundEnabled()) return;

  const soundFn = soundConfigs[type] || soundConfigs.notification;
  soundFn();
}

/**
 * Pré-inicializa o AudioContext (chamar após primeira interação do usuário)
 * Isso evita problemas com a política de autoplay
 */
export function initAudioContext() {
  getAudioContext();
}

export default {
  playNotificationSound,
  initAudioContext,
  isSoundEnabled,
  setSoundEnabled,
  toggleSound,
};
