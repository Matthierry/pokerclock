let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  audioCtx = audioCtx ?? new AudioContext();
  return audioCtx;
}

function schedulePulse(ctx: AudioContext, startAt: number, duration: number, fromHz: number, toHz: number, peakGain: number): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'square';
  osc.frequency.setValueAtTime(fromHz, startAt);
  osc.frequency.exponentialRampToValueAtTime(toHz, startAt + duration);

  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(peakGain, startAt + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startAt);
  osc.stop(startAt + duration);
}

export function primeLevelUpAudio(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') {
    void ctx.resume().catch(() => {});
  }
}

export function playLevelUpAlert(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const start = () => {
    const now = ctx.currentTime + 0.01;

    schedulePulse(ctx, now, 0.55, 700, 980, 0.3);
    schedulePulse(ctx, now + 0.9, 0.55, 760, 1040, 0.3);
    schedulePulse(ctx, now + 1.8, 1.1, 820, 1140, 0.34);
  };

  if (ctx.state === 'suspended') {
    void ctx.resume().then(start).catch(() => {});
    return;
  }

  start();
}
