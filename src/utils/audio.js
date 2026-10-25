// Ambient festive sound generator using Web Audio API
// Synthesizes a soothing tanpura/sitar resonant drone with twinkling festive bell chimes

let audioCtx = null;
let isPlaying = false;
let droneNodes = [];
let chimeInterval = null;

export function toggleFestiveMusic(onStateChange) {
  if (isPlaying) {
    stopFestiveMusic();
    if (onStateChange) onStateChange(false);
    return false;
  } else {
    startFestiveMusic();
    if (onStateChange) onStateChange(true);
    return true;
  }
}

export function isMusicPlaying() {
  return isPlaying;
}

export function startFestiveMusic() {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    stopFestiveMusic();
    isPlaying = true;

    // Tanpura Sa-Pa fundamental frequencies (in C# / D: 138.59Hz Sa, 207.65Hz Pa, 277.18Hz High Sa)
    const freqs = [138.59, 207.65, 277.18, 554.37];
    const masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.01, audioCtx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(0.12, audioCtx.currentTime + 3);
    masterGain.connect(audioCtx.destination);

    droneNodes.push(masterGain);

    freqs.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      // Subtle detune for rich chorusing
      osc.detune.setValueAtTime((idx - 1.5) * 4, audioCtx.currentTime);

      // Subtle slow LFO vibrato
      const lfo = audioCtx.createOscillator();
      const lfoGain = audioCtx.createGain();
      lfo.frequency.value = 0.2 + idx * 0.1;
      lfoGain.gain.value = 1.5;
      lfo.connect(osc.frequency);
      lfo.start();

      gain.gain.value = 0.25 / freqs.length;
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start();

      droneNodes.push(osc, gain, lfo, lfoGain);
    });

    // Gentle random festive chimes (pentatonic notes)
    const pentatonic = [554.37, 622.25, 739.99, 830.61, 932.33, 1108.73];
    chimeInterval = setInterval(() => {
      if (!isPlaying || !audioCtx) return;
      playRandomChime(pentatonic[Math.floor(Math.random() * pentatonic.length)], masterGain);
    }, 2400);

  } catch (err) {
    console.warn("Audio autoplay blocked or unsupported:", err);
    isPlaying = false;
  }
}

function playRandomChime(freq, destination) {
  if (!audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.04, audioCtx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 2.5);

    osc.connect(gain);
    gain.connect(destination || audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 2.6);
  } catch (e) {
    // Ignore audio glitches
  }
}

export function stopFestiveMusic() {
  isPlaying = false;
  if (chimeInterval) {
    clearInterval(chimeInterval);
    chimeInterval = null;
  }
  droneNodes.forEach(node => {
    try {
      if (node.stop) node.stop();
      if (node.disconnect) node.disconnect();
    } catch (e) {}
  });
  droneNodes = [];
}
