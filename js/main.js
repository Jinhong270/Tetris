import { Game } from './game.js';
import { Renderer } from './renderer.js';
import { InputHandler } from './input.js';
import { COLS, ROWS, CELL_SIZE, BOARD_BGS, DEFAULT_BOARD_BG } from './constants.js';

let audioCtx = null;
let animationId = null;
let toastTimer = null;

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
        const now = ctx.currentTime;
        gain.gain.setValueAtTime(volume, now);
        gain.gain.linearRampToValueAtTime(0.001, now + duration / 1000);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + duration / 1000 + 0.05);
    } catch (_) {
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
const toastEl = document.getElementById('toast');
const canvasWrapper = document.querySelector('.canvas-wrapper');
const body = document.body;

function detectTouchSupport() {
    return (
        'ontouchstart' in window ||
        (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) ||
        (window.matchMedia && window.matchMedia('(pointer: coarse)').matches)
    );
}

const isTouchDevice = detectTouchSupport();
if (isTouchDevice) {
    body.classList.add('touch-device');
    const touchControls = document.getElementById('touchControls');
    if (touchControls) touchControls.setAttribute('aria-hidden', 'false');
}

const game = new Game();
game.loadSpeedLevel();
const renderer = new Renderer(gameCanvas, nextCanvas);

function showToast(message, duration = 2800) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toastEl.classList.remove('show');
    }, duration);
}

function updatePauseButton() {
    if (!pauseButton) return;
    if (game.isActive()) {
        pauseButton.classList.remove('hidden');
        pauseButton.textContent = game.state === 'paused' ? '继续' : '暂停';
    } else {
        pauseButton.classList.add('hidden');
    }
}

function syncPauseUI() {
    updatePauseButton();
    renderer.render(game);
}

function handlePauseToggle() {
    if (!game.isActive()) return;
    const next = game.togglePause();
    playSound(next === 'paused' ? 400 : 600, 60, 'square', 0.25);
    if (next === 'paused') {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        syncPauseUI();
    } else {
        syncPauseUI();
        if (!animationId) animationId = requestAnimationFrame(gameLoop);
    }
}

function startGame() {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    game.start();
    if (game.state === 'playing') {
        if (startButton) startButton.textContent = '重新开始';
        updatePauseButton();
        playSound(880, 150, 'square', 0.35);
        animationId = requestAnimationFrame(gameLoop);
    }
    updateHighScoreDisplay();
    renderer.render(game);
}

function handleCanvasClick() {
    if (game.state === 'idle' || game.state === 'gameover') {
        startGame();
        return;
    }
    if (game.state === 'paused') {
        handlePauseToggle();
    }
}

const input = new InputHandler(game, isTouchDevice, handlePauseToggle);

function gameLoop(timestamp) {
    if (game.state === 'paused') {
        renderer.render(game);
        animationId = null;
        return;
    }
    game.update(timestamp);
    renderer.render(game);
    if (game.state === 'gameover') {
        updateHighScoreDisplay();
        updatePauseButton();
        animationId = null;
        return;
    }
    animationId = requestAnimationFrame(gameLoop);
}

function resizeCanvas() {
    const maxWidth = Math.min(300, window.innerWidth * 0.92, window.innerHeight * 0.48);
    const scale = maxWidth / (COLS * CELL_SIZE);
    gameCanvas.style.width = `${COLS * CELL_SIZE * scale}px`;
    gameCanvas.style.height = `${ROWS * CELL_SIZE * scale}px`;
}

function updateHighScoreDisplay() {
    if (highScoreDisplay) {
        highScoreDisplay.textContent = String(game.highScore || 0);
    }
}

function applyTheme(theme) {
    body.className = body.className.replace(/theme-\w+/g, '').trim();
    body.classList.add(`theme-${theme}`);
    if (isTouchDevice) body.classList.add('touch-device');
    localStorage.setItem('tetrisTheme', theme);
}

function loadTheme() {
    const saved = localStorage.getItem('tetrisTheme');
    if (saved) applyTheme(saved);
}

function applyBoardBg(key) {
    if (!renderer.setBoardBg(key)) return;
    localStorage.setItem('tetrisBoardBg', key);
    document.querySelectorAll('.board-swatch').forEach(el => {
        el.classList.toggle('active', el.dataset.boardBg === key);
    });
    if (canvasWrapper) canvasWrapper.style.background = BOARD_BGS[key].color;
    if (nextCanvas) nextCanvas.style.background = BOARD_BGS[key].color;
    renderer.render(game);
}

function loadBoardBg() {
    const saved = localStorage.getItem('tetrisBoardBg');
    const key = saved && BOARD_BGS[saved] ? saved : DEFAULT_BOARD_BG;
    applyBoardBg(key);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

if (startButton) {
    startButton.addEventListener('click', startGame);
}

if (pauseButton) {
    pauseButton.addEventListener('click', handlePauseToggle);
}

if (canvasWrapper) {
    canvasWrapper.addEventListener('click', handleCanvasClick);
    canvasWrapper.classList.add('clickable-board');
}
if (gameCanvas) {
    gameCanvas.addEventListener('click', (e) => {
        e.stopPropagation();
        handleCanvasClick();
    });
}

document.querySelectorAll('.swatch[data-theme]').forEach(swatch => {
    swatch.addEventListener('click', (e) => {
        const theme = e.currentTarget.dataset.theme;
        if (theme) applyTheme(theme);
    });
});

document.querySelectorAll('.board-swatch').forEach(swatch => {
    swatch.addEventListener('click', (e) => {
        const key = e.currentTarget.dataset.boardBg;
        if (key) {
            applyBoardBg(key);
            playSound(480, 40, 'square', 0.12);
        }
    });
});

const speedButtons = document.querySelectorAll('.speed-btn');
speedButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const level = e.currentTarget.dataset.speed;
        if (!level) return;

        if (!game.canChangeSpeed()) {
            if (game.state === 'playing') {
                game.pause();
                if (animationId) {
                    cancelAnimationFrame(animationId);
                    animationId = null;
                }
                syncPauseUI();
            }
            showToast('游戏进行中无法调节速度，请等待本局结束后再试。游戏已暂停。');
            playSound(220, 120, 'square', 0.25);
            return;
        }

        if (game.setSpeedLevel(level)) {
            speedButtons.forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            updateHighScoreDisplay();
            renderer.render(game);
            playSound(520, 50, 'square', 0.15);
        }
    });
});

const initialSpeedBtn = document.querySelector(`[data-speed="${game.speedLevel}"]`);
if (initialSpeedBtn) initialSpeedBtn.classList.add('active');

loadTheme();
loadBoardBg();
updateHighScoreDisplay();
updatePauseButton();
renderer.render(game);
