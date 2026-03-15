const MUTE_KEY = 'memory-game-muted';

let muted = (() => {
  try {
    return localStorage.getItem(MUTE_KEY) === 'true';
  } catch {
    return false;
  }
})();

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

export function isMuted(): boolean {
  return muted;
}

export function setMuted(value: boolean): void {
  muted = value;
  try {
    localStorage.setItem(MUTE_KEY, String(value));
  } catch {
    // ignore
  }
}

export function toggleMute(): boolean {
  setMuted(!muted);
  return muted;
}

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', gain = 0.15, startTime = 0): void {
  if (muted) return;
  const ctx = getCtx();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(gain, ctx.currentTime + startTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start(ctx.currentTime + startTime);
  osc.stop(ctx.currentTime + startTime + duration);
}

/** 카드 뒤집기 - 짧은 "틱" 소리 */
export function playFlip(): void {
  if (muted) return;
  playTone(800, 0.08, 'square', 0.08);
}

/** 짝 맞춤 - 밝은 "딩동" 소리 */
export function playMatch(): void {
  if (muted) return;
  playTone(880, 0.15, 'sine', 0.18, 0);
  playTone(1174.66, 0.2, 'sine', 0.18, 0.1);
}

/** 짝 틀림 - 낮은 "뿅" 소리 */
export function playMismatch(): void {
  if (muted) return;
  playTone(200, 0.25, 'sawtooth', 0.1, 0);
  playTone(150, 0.3, 'sawtooth', 0.08, 0.1);
}

/** 클리어 축하 - 도미솔도 상승음 */
export function playClear(): void {
  if (muted) return;
  playTone(523.25, 0.2, 'sine', 0.15, 0);     // 도 (C5)
  playTone(659.25, 0.2, 'sine', 0.15, 0.18);   // 미 (E5)
  playTone(783.99, 0.2, 'sine', 0.15, 0.36);   // 솔 (G5)
  playTone(1046.50, 0.35, 'sine', 0.18, 0.54); // 도 (C6)
}

/** 콤보 - 짧은 상승음 */
export function playCombo(): void {
  if (muted) return;
  playTone(600, 0.1, 'triangle', 0.12, 0);
  playTone(900, 0.12, 'triangle', 0.14, 0.08);
  playTone(1200, 0.15, 'triangle', 0.12, 0.16);
}
