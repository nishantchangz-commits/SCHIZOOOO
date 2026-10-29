// Subtle Web Audio synthesizer for calming breathing and somatic cues
let audioCtx: AudioContext | null = null;

export function playSoothingChime(frequency: number = 432, durationSeconds: number = 1.2) {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    // Warm, soothing harmonic sine wave
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);

    // Smooth envelope: soft rise and long gentle decay
    gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.12, audioCtx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + durationSeconds);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + durationSeconds);
  } catch (err) {
    // Audio contexts might be blocked until user gesture, fail quietly without disrupting UI
    console.debug('Audio chime notification muted or unavailable:', err);
  }
}
