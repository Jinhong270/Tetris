let audioCtx = null;
let muted = false;
let lastMoveAt = 0;

function context() {
    if (!audioCtx) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return null;
        audioCtx = new Ctx();
    }
    return audioCtx;
}

export function loadMuted() {
    try {
        muted = localStorage.getItem('tetrisMuted') === '1';
    } catch (_) {
        muted = false;
    }
    return muted;
}

export function isMuted() {
    return muted;
}

export function toggleMuted() {
    muted = !muted;
    try {
        localStorage.setItem('tetrisMuted', muted ? '1' : '0');
    } catch (_) {
    }
    return muted;
}

export function playSound(frequency, duration = 80, type = 'square', volume = 0.3) {
    if (muted) return;
    try {
        const ctx = context();
        if (!ctx) return;
        if (ctx.state === 'suspended') ctx.resume();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        osc.type = type;
        osc.frequency.value = frequency;
        filter.type = 'lowpass';
        filter.frequency.value = 1400;
        const now = ctx.currentTime;
        gain.gain.setValueAtTime(volume, now);
        gain.gain.linearRampToValueAtTime(0.0001, now + duration / 1000);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + duration / 1000 + 0.02);
    } catch (_) {
    }
}

export function playMoveSound() {
    const now = performance.now();
    if (now - lastMoveAt < 50) return;
    lastMoveAt = now;
    playSound(440, 28, 'square', 0.08);
}

export function playRotateSound() {
    playSound(660, 50, 'square', 0.16);
}

export function playDropSound() {
    playSound(196, 36, 'square', 0.2);
    setTimeout(() => playSound(98, 80, 'square', 0.14), 28);
}

export function playClearSound(lines) {
    playSound(523, 80, 'square', 0.2);
    setTimeout(() => playSound(659, 80, 'square', 0.2), 70);
    if (lines >= 4) {
        setTimeout(() => playSound(784, 90, 'square', 0.22), 140);
        setTimeout(() => playSound(1046, 150, 'square', 0.24), 210);
    }
}

export function playGameOverSound() {
    playSound(196, 220, 'sawtooth', 0.26);
    setTimeout(() => playSound(155, 260, 'sawtooth', 0.22), 180);
    setTimeout(() => playSound(123, 340, 'sawtooth', 0.18), 360);
}

export function playStartSound() {
    playSound(523, 60, 'square', 0.16);
    setTimeout(() => playSound(659, 60, 'square', 0.16), 60);
    setTimeout(() => playSound(784, 110, 'square', 0.18), 120);
}

export function playUiSound() {
    playSound(620, 36, 'square', 0.1);
}
