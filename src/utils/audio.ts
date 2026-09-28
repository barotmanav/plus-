/**
 * Web Audio API synthesizer for instant alert chimes and emergency broadcast sirens
 */
export function playNotificationSound(type: 'NORMAL' | 'IMPORTANT' | 'EMERGENCY' = 'NORMAL') {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === 'EMERGENCY') {
      // 3-tone urgent ascending/descending emergency siren chime
      const tones = [880, 587.33, 880, 587.33, 880];
      tones.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.16);

        gain.gain.setValueAtTime(0.15, ctx.currentTime + index * 0.16);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (index + 1) * 0.16);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + index * 0.16);
        osc.stop(ctx.currentTime + (index + 1) * 0.16);
      });
    } else if (type === 'IMPORTANT') {
      // 2-tone pleasant high chime
      [523.25, 659.25].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);

        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.28);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.3);
      });
    } else {
      // Gentle notification pop
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    }
  } catch {
    // Ignore audio context auto-play restrictions before user gesture
  }
}
