import { Game } from './game.js';
import { Renderer } from './renderer.js';
import { InputHandler } from './input.js';
import { COLS, ROWS, CELL_SIZE, SPEED_LEVELS } from './constants.js';

let audioCtx;
function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
}

function playSound(frequency, duration = 80, type = 'square', volume = 0.3) {
    try {
        const ctx = getAudioContext();
        if (ctx.state === 'suspended') ctx.resume();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        
        osc.type = type;
        osc.frequency.value = frequency;
        
        filter.type = 'lowpass';
        filter.frequency.value = 1200;
        
        gain.gain.value = volume;
        
        const now = ctx.currentTime;
        gain.gain.setValueAtTime(volume, now);
        gain.gain.linearRampToValueAtTime(0.001, now + duration / 1000);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(now);
        osc.stop(now + duration / 1000 + 0.05);
    } catch (e) {
    }
}

function playMoveSound() { playSound(440, 40, 'square', 0.15); }
function playRotateSound() { playSound(660, 60, 'sawtooth', 0.2); }
function playDropSound() { playSound(880, 100, 'square', 0.25); }
function playClearSound(lines) { 
    playSound(523, 120, 'square', 0.3); 
    setTimeout(() => playSound(659, 120, 'square', 0.3), 80);
    if (lines >= 4) setTimeout(() => playSound(784, 200, 'square', 0.35), 160);
}
function playGameOverSound() { 
    playSound(200, 300, 'sawtooth', 0.4); 
    setTimeout(() => playSound(150, 400, 'sawtooth', 0.3), 200);
}

window.playMoveSound = playMoveSound;
window.playRotateSound = playRotateSound;
window.playDropSound = playDropSound;
window.playClearSound = playClearSound;
window.playGameOverSound = playGameOverSound;

const gameCanvas = document.getElementById('gameCanvas');
const nextCanvas = document.getElementById('nextCanvas');
const startButton = document.getElementById('startButton');
const pauseButton = document.getElementById('pauseButton');
const highScoreDisplay = document.getElementById('highScoreDisplay');
const body = document.body;

const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
if (isTouchDevice) {
    body.classList.add('touch-device');
}

const game = new Game();
game.loadSpeedLevel();
const renderer = new Renderer(gameCanvas, nextCanvas);
const input = new InputHandler(game, isTouchDevice);

document.addEventListener('keydown', (e) => {
    if (e.code === 'KeyP' || e.code === 'Escape') {
        e.preventDefault();
        if (game.state === 'playing' || game.state === 'paused') {
            game.togglePause();
            if (pauseButton) {
                pauseButton.textContent = game.state === 'paused' ? '继续' : '暂停';
            }
            if (game.state === 'paused') {
                if (animationId) cancelAnimationFrame(animationId);
                renderer.render(game);
            } else if (game.state === 'playing') {
                animationId = requestAnimationFrame(gameLoop);
            }
        }
    }
});

let animationId = null;

function gameLoop(timestamp) {
    if (game.state === 'paused') {
        renderer.render(game);
        animationId = requestAnimationFrame(gameLoop);
        return;
    }
    game.update(timestamp);
    renderer.render(game);
    if (game.state === 'gameover') {
        updateHighScoreDisplay();
    }
    animationId = requestAnimationFrame(gameLoop);
}

function resizeCanvas() {
    const maxWidth = Math.min(300, window.innerWidth * 0.9, window.innerHeight * 0.45);
    const scale = maxWidth / (COLS * CELL_SIZE);
    gameCanvas.style.width = (COLS * CELL_SIZE * scale) + 'px';
    gameCanvas.style.height = (ROWS * CELL_SIZE * scale) + 'px';
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

startButton.addEventListener('click', () => {
    if (animationId) cancelAnimationFrame(animationId);
    if (game.state === 'gameover' || game.state === 'idle') {
        game.start();
        pauseButton.style.display = 'block';
        pauseButton.textContent = '暂停';
        startButton.textContent = '重新开始';
        playSound(880, 150, 'square', 0.4);
    } else {
        game.start();
        playSound(660, 80, 'square', 0.3);
    }
    animationId = requestAnimationFrame(gameLoop);
    updateHighScoreDisplay();
});

pauseButton.addEventListener('click', () => {
    if (game.state === 'playing' || game.state === 'paused') {
        game.togglePause();
        pauseButton.textContent = game.state === 'paused' ? '继续' : '暂停';
        playSound(game.state === 'paused' ? 400 : 600, 60, 'square', 0.25);
        if (game.state === 'paused') {
            if (animationId) cancelAnimationFrame(animationId);
            renderer.render(game);
        } else {
            animationId = requestAnimationFrame(gameLoop);
        }
    }
});

document.querySelectorAll('.swatch').forEach(swatch => {
    swatch.addEventListener('click', (e) => {
        const theme = e.target.dataset.theme;
        body.className = body.className.replace(/theme-\w+/g, '');
        body.classList.add(`theme-${theme}`);
        if (isTouchDevice) body.classList.add('touch-device');
    });
});

const speedButtons = document.querySelectorAll('.speed-btn');
speedButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const level = e.target.dataset.speed;
        game.setSpeedLevel(level);
        
        speedButtons.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        
        renderer.render(game);
    });
});

const initialSpeedBtn = document.querySelector(`[data-speed="${game.speedLevel}"]`);
if (initialSpeedBtn) initialSpeedBtn.classList.add('active');

function updateHighScoreDisplay() {
    if (highScoreDisplay) {
        highScoreDisplay.textContent = game.highScore || 0;
    }
}

updateHighScoreDisplay();
renderer.render(game);
