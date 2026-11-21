let audio;
let muted = false;

export function unlock() {
  audio ??= new AudioContext();
  if (audio.state === 'suspended') audio.resume().catch(() => {});
}

export function toggleSound() {
  muted = !muted;
  return muted;
}

export function cue(name, balance = 0, volume = 1) {
  if (!audio || audio.state !== 'running' || muted) return;
  const notes = {
    step: [[0, 112, 47, .085, 'triangle', .085]],
    toss: [[0, 730, 310, .15, 'triangle', .11], [.062, 1030, 580, .09, 'sine', .07]],
    tape: [[0, 440, 443, .19, 'sine', .12], [.095, 660, 666, .32, 'triangle', .075]],
    relay: [[0, 116, 60, .34, 'sawtooth', .085], [.12, 330, 85, .46, 'triangle', .12]],
    alarm: [[0, 188, 412, .26, 'sawtooth', .09], [.3, 188, 412, .28, 'sawtooth', .07]],
    exit: [[0, 220, 220, .5, 'sine', .13], [.12, 330, 330, .62, 'sine', .1], [.24, 440, 440, .8, 'triangle', .065]],
  };
  for (const [offset, pitch, end, duration, wave, gain] of notes[name]) {
    const start = audio.currentTime + offset;
    const oscillator = audio.createOscillator();
    const envelope = audio.createGain();
    const pan = audio.createStereoPanner();
    oscillator.type = wave;
    oscillator.frequency.setValueAtTime(pitch, start);
    oscillator.frequency.exponentialRampToValueAtTime(end, start + duration);
    envelope.gain.setValueAtTime(.0001, start);
    envelope.gain.exponentialRampToValueAtTime(Math.max(.0002, volume * gain), start + .009);
    envelope.gain.exponentialRampToValueAtTime(.0001, start + duration);
    pan.pan.value = balance;
    oscillator.connect(envelope).connect(pan).connect(audio.destination);
    oscillator.start(start);
    oscillator.stop(start + duration);
  }
}
