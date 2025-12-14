/**
 * Utilitário de sons de notificação para admins
 * Usa Web Audio API para gerar sons curtos e suaves
 * Compatível com iOS/Safari e Android
 */

let audioContext = null;
let isAudioUnlocked = false;
let unlockAttempted = false;

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

/**
 * Verifica se estamos em um dispositivo iOS
 */
function isIOS() {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

/**
 * Verifica se estamos em Safari
 */
function isSafari() {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

// Inicializa o AudioContext (necessário após interação do usuário)
function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

/**
 * Tenta resumir o AudioContext se estiver suspenso
 */
async function resumeAudioContext() {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch (e) {
      console.warn('Não foi possível resumir AudioContext:', e);
    }
  }
  return ctx;
}

/**
 * Desbloqueia o AudioContext no iOS/Safari
 * Toca um som silencioso para "esquentar" o contexto
 */
async function unlockAudio() {
  if (isAudioUnlocked) return true;

  try {
    const ctx = await resumeAudioContext();

    // Criar e tocar um buffer vazio/silencioso para desbloquear
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);

    // Em iOS, também precisamos criar um oscillator silencioso
    if (isIOS() || isSafari()) {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      gainNode.gain.value = 0; // Silencioso
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.start(0);
      oscillator.stop(ctx.currentTime + 0.001);
    }

    isAudioUnlocked = true;
    console.log('🔊 Áudio desbloqueado para notificações');
    return true;
  } catch (e) {
    console.warn('Falha ao desbloquear áudio:', e);
    return false;
  }
}

/**
 * Configura listeners para desbloquear áudio na primeira interação
 */
function setupUnlockListeners() {
  if (unlockAttempted) return;
  unlockAttempted = true;

  const events = ['touchstart', 'touchend', 'click', 'keydown'];

  const unlockHandler = async () => {
    await unlockAudio();
    // Remove listeners após desbloquear
    if (isAudioUnlocked) {
      events.forEach((event) => {
        document.removeEventListener(event, unlockHandler, { capture: true });
      });
    }
  };

  events.forEach((event) => {
    document.addEventListener(event, unlockHandler, {
      capture: true,
      passive: true,
    });
  });
}

// Configura listeners automaticamente quando o módulo é carregado
if (typeof window !== 'undefined') {
  setupUnlockListeners();
}

/**
 * Gera um som curto e suave
 * @param {number} frequency - Frequência em Hz
 * @param {number} duration - Duração em segundos
 * @param {string} type - Tipo de onda: 'sine', 'square', 'triangle', 'sawtooth'
 * @param {number} volume - Volume de 0 a 1
 */
async function playTone(
  frequency,
  duration = 0.15,
  type = 'sine',
  volume = 0.3
) {
  try {
    // Garantir que o áudio está desbloqueado
    if (!isAudioUnlocked) {
      await unlockAudio();
    }

    const ctx = await resumeAudioContext();
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
  message: async () => {
    await playTone(523.25, 0.1, 'sine', 0.25); // C5
    setTimeout(() => playTone(659.25, 0.15, 'sine', 0.2), 100); // E5
  },

  // Som de depósito - tom mais grave e reconfortante
  deposit: async () => {
    await playTone(392, 0.12, 'sine', 0.25); // G4
    setTimeout(() => playTone(523.25, 0.18, 'sine', 0.2), 120); // C5
  },

  // Som de saque - tom de alerta suave
  withdraw: async () => {
    await playTone(440, 0.1, 'sine', 0.25); // A4
    setTimeout(() => playTone(554.37, 0.12, 'sine', 0.2), 80); // C#5
    setTimeout(() => playTone(659.25, 0.15, 'sine', 0.18), 160); // E5
  },

  // Som de notificação geral - único tom suave
  notification: async () => {
    await playTone(587.33, 0.2, 'sine', 0.25); // D5
  },
};

/**
 * Toca o som de notificação do tipo especificado
 * @param {'message' | 'deposit' | 'withdraw' | 'notification'} type - Tipo de notificação
 */
export async function playNotificationSound(type = 'notification') {
  // Verificar se o som está habilitado
  if (!isSoundEnabled()) return;

  const soundFn = soundConfigs[type] || soundConfigs.notification;
  await soundFn();
}

/**
 * Pré-inicializa o AudioContext (chamar após primeira interação do usuário)
 * Isso evita problemas com a política de autoplay
 */
export async function initAudioContext() {
  await unlockAudio();
}

/**
 * Verifica se o áudio foi desbloqueado (útil para UI feedback)
 */
export function isAudioReady() {
  return isAudioUnlocked;
}

/**
 * Força o desbloqueio do áudio - chamar em resposta a um toque/clique
 * @returns {Promise<boolean>} Se o desbloqueio foi bem-sucedido
 */
export async function forceUnlockAudio() {
  return await unlockAudio();
}

export default {
  playNotificationSound,
  initAudioContext,
  isSoundEnabled,
  setSoundEnabled,
  toggleSound,
  isAudioReady,
  forceUnlockAudio,
};
