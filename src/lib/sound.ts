let audioCtx: AudioContext | null = null;

export function playLevelUpAlert(): void {
  if (typeof window === 'undefined') return;
  audioCtx = audioCtx ?? new AudioContext();
  const now = audioCtx.currentTime;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(784, now);
  osc.frequency.exponentialRampToValueAtTime(1046, now + 0.18);
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(0.2, now + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 0.25);
}
