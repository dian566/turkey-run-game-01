// Turkey Run — audio: tiny WebAudio synth, no sound files, nothing fetched.
// A gobble blip on jump, a cluck arpeggio on corn, a thud on a hit, a little
// banjo-ish pluck loop for the farmyard, all behind a mute toggle.
export function createAudio() {
  let context = null;
  let muted = false;
  let musicTimer = null;
  let musicStep = 0;
  const MELODY = [392, 330, 262, 330, 392, 494, 440, 330];

  function ensure() {
    if (context) return context;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    context = new AudioContext();
    return context;
  }

  function tone(frequency, seconds, type, volume, when = 0) {
    if (muted) return;
    const ctx = ensure();
    if (!ctx) return;
    const start = ctx.currentTime + when;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + seconds);
    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start(start);
    oscillator.stop(start + seconds + 0.02);
  }

  function unlock() {
    const ctx = ensure();
    if (ctx && ctx.state === 'suspended') void ctx.resume();
  }

  function startMusic() {
    if (musicTimer) return;
    musicTimer = window.setInterval(() => {
      if (muted) return;
      const note = MELODY[musicStep % MELODY.length];
      tone(note, 0.22, 'triangle', 0.05);
      tone(note / 2, 0.22, 'sine', 0.03, 0.11);
      musicStep += 1;
    }, 260);
  }

  function stopMusic() {
    if (musicTimer) window.clearInterval(musicTimer);
    musicTimer = null;
  }

  return {
    unlock,
    startMusic,
    stopMusic,
    toggleMute() {
      muted = !muted;
      return muted;
    },
    get muted() {
      return muted;
    },
    jump() {
      tone(520, 0.12, 'square', 0.06);
      tone(780, 0.1, 'square', 0.04, 0.06);
    },
    corn() {
      tone(880, 0.08, 'sine', 0.07);
      tone(1320, 0.1, 'sine', 0.05, 0.07);
    },
    hit() {
      tone(140, 0.3, 'sawtooth', 0.12);
      tone(90, 0.35, 'square', 0.08, 0.05);
    },
    powerup() {
      [660, 880, 1100].forEach((frequency, index) => tone(frequency, 0.12, 'triangle', 0.07, index * 0.08));
    },
    caught() {
      [392, 330, 262, 196].forEach((frequency, index) => tone(frequency, 0.3, 'sawtooth', 0.08, index * 0.22));
    },
    escaped() {
      [262, 330, 392, 523, 659, 784].forEach((frequency, index) => tone(frequency, 0.25, 'triangle', 0.08, index * 0.13));
    },
  };
}
