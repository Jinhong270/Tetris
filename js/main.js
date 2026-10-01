import { bootI18n, t } from './i18n.js';
import { Game } from './game.js';
import { Renderer } from './renderer.js';
import { InputHandler } from './input.js';
import { COLS, ROWS, CELL_SIZE, BOARD_BGS, DEFAULT_BOARD_BG } from './constants.js';
import {
    loadMuted,
    isMuted,
    toggleMuted,
    playSound,
    playStartSound,
    playUiSound
} from './audio.js';

await bootI18n();

const CLEAR_KEYS = [null, 'clear1', 'clear2', 'clear3', 'clear4'];
const THEMES = ['classic', 'gray', 'green', 'blue', 'wheat', 'arcade', 'dark'];

let animationId = null;
let toastTimer = null;
let resizeTick = 0;

const gameCanvas = document.getElementById('gameCanvas');
const nextCanvas = document.getElementById('nextCanvas');
const startButton = document.getElementById('startButton');
const pauseButton = document.getElementById('pauseButton');
const toastEl = document.getElementById('toast');
const screenEl = document.querySelector('.screen');
const body = document.body;
const soundButton = document.getElementById('soundButton');
const optionsPanel = document.getElementById('optionsPanel');
const optionsToggle = document.getElementById('optionsToggle');
const screenOverlay = document.getElementById('screenOverlay');
const overlayKicker = document.getElementById('overlayKicker');
const overlayTitle = document.getElementById('overlayTitle');
const overlaySub = document.getElementById('overlaySub');
const overlayStats = document.getElementById('overlayStats');
const overlayScore = document.getElementById('overlayScore');
const overlayLines = document.getElementById('overlayLines');
const overlayBest = document.getElementById('overlayBest');
const recordBadge = document.getElementById('recordBadge');
const floatText = document.getElementById('floatText');
const fxFlash = document.getElementById('fxFlash');
const levelStat = document.getElementById('levelStat');
const touchPause = document.getElementById('btnPauseTouch');
const speedPanel = document.querySelector('.speed-panel');
const nextWrap = document.querySelector('.next-wrap');

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

loadMuted();

const game = new Game();
game.loadSpeedLevel();
const renderer = new Renderer(gameCanvas, nextCanvas);

function motionReduced() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function pulse(el, className) {
    if (!el) return;
    el.classList.remove(className);
    void el.offsetWidth;
    el.classList.add(className);
}

function showFloat(text) {
    if (!floatText) return;
    floatText.textContent = text;
    pulse(floatText, 'show');
}

game.onClearStart = (rows, gained, levelUp) => {
    renderer.burst(rows, game.board.grid);
    const name = CLEAR_KEYS[rows.length] ? t(CLEAR_KEYS[rows.length]) : '';
    showFloat(name ? `${name} +${gained}` : `+${gained}`);
    if (rows.length >= 4 && !motionReduced()) {
        pulse(fxFlash, 'boom');
        pulse(screenEl, 'shake');
    }
    if (levelUp) pulse(levelStat, 'level-up');
};

function showToast(message, duration = 2800) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toastEl.classList.remove('show');
    }, duration);
}

function viewportSize() {
    const vv = window.visualViewport;
    return {
        w: vv ? vv.width : window.innerWidth,
        h: vv ? vv.height : window.innerHeight
    };
}

function landscapeCompact() {
    const { w, h } = viewportSize();
    return h <= 540 && w > h && w <= 860;
}

function narrowLayout() {
    const { w } = viewportSize();
    return w <= 860 && !landscapeCompact();
}

function syncBodyState() {
    body.classList.remove('is-idle', 'is-playing', 'is-paused', 'is-gameover');
    body.classList.add(`is-${game.state}`);
}

function syncPauseButton() {
    if (pauseButton) {
        if (game.isActive()) {
            pauseButton.classList.remove('hidden');
            pauseButton.textContent = game.state === 'paused' ? t('resume') : t('pause');
        } else {
            pauseButton.classList.add('hidden');
        }
    }
    if (startButton) {
        startButton.textContent = game.state === 'idle' ? t('start') : t('restart');
    }
    if (touchPause) {
        const paused = game.state === 'paused';
        touchPause.classList.toggle('is-paused', paused);
        touchPause.setAttribute('aria-label', paused ? t('resume') : t('pause'));
    }
}

function syncOverlay() {
    if (!screenOverlay) return;
    const show = game.state !== 'playing';
    screenOverlay.classList.toggle('visible', show);
    screenOverlay.setAttribute('aria-hidden', show ? 'false' : 'true');
    screenOverlay.dataset.mode = game.state;
    if (overlayStats) overlayStats.classList.toggle('hidden', game.state !== 'gameover');
    if (recordBadge) {
        recordBadge.classList.toggle('hidden', !(game.state === 'gameover' && game.isNewRecord));
    }
    if (game.state === 'idle') {
        setKicker(t('kickerReady'));
        setOverlayTitle(t('titleIdle'));
        if (overlaySub) overlaySub.textContent = t('subIdle');
    } else if (game.state === 'paused') {
        setKicker(t('kickerPause'));
        setOverlayTitle(t('titlePause'));
        if (overlaySub) overlaySub.textContent = t('subPause');
    } else if (game.state === 'gameover') {
        setKicker(t('kickerOver'));
        setOverlayTitle(t('titleOver'));
        if (overlaySub) overlaySub.textContent = t('subOver');
        if (overlayScore) overlayScore.textContent = String(game.score);
        if (overlayLines) overlayLines.textContent = String(game.lines);
        if (overlayBest) overlayBest.textContent = String(game.highScore || 0);
    }
}

function syncSpeedLock() {
    const locked = !game.canChangeSpeed();
    document.querySelectorAll('.speed-btn').forEach((btn) => {
        const on = btn.dataset.speed === game.speedLevel;
        btn.classList.toggle('active', on);
        btn.classList.toggle('locked', locked);
        btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
}

function syncChrome() {
    syncBodyState();
    syncPauseButton();
    syncOverlay();
    syncSpeedLock();
}

function isAscii(text) {
    return /^[\u0020-\u007E]+$/.test(text);
}

function setKicker(text) {
    if (!overlayKicker) return;
    overlayKicker.textContent = text;
    overlayKicker.classList.toggle('pixel', isAscii(text));
}

function setOverlayTitle(text) {
    if (!overlayTitle) return;
    overlayTitle.textContent = text;
    overlayTitle.classList.toggle('latin', isAscii(text));
}

function setOptionsOpen(open) {
    if (!optionsPanel || !optionsToggle) return;
    const show = !narrowLayout() || open;
    optionsPanel.classList.toggle('open', show);
    optionsToggle.setAttribute('aria-expanded', show ? 'true' : 'false');
    optionsToggle.textContent = show && narrowLayout() ? t('optionsClose') : t('options');
}

function noteState(next) {
    if (!narrowLayout()) {
        setOptionsOpen(true);
        return;
    }
    if (next === 'playing') setOptionsOpen(false);
}

function resizeCanvas() {
    const { w: vw, h: vh } = viewportSize();
    const narrow = narrowLayout();
    const land = landscapeCompact();
    const bezelPad = narrow ? 16 : 22;
    let availableW;
    let availableH;
    if (land) {
        availableH = vh - 28;
        availableW = Math.max(120, vw - 280);
    } else if (narrow) {
        const touchBar = document.getElementById('touchControls');
        const dock = body.classList.contains('touch-device') && touchBar
            && getComputedStyle(touchBar).display !== 'none'
            ? touchBar.offsetHeight
            : 0;
        const top = document.querySelector('.topbar');
        const topH = top ? top.offsetHeight : 44;
        const score = document.querySelector('.stat-score');
        const statH = score ? score.offsetHeight : 52;
        const speedH = speedPanel ? speedPanel.offsetHeight : 56;
        const nextH = nextWrap ? nextWrap.offsetHeight : 0;
        const hud = statH + Math.max(speedH, nextH) + 12;
        const actions = document.querySelector('.action-buttons');
        const actionsH = actions ? actions.offsetHeight : 48;
        const optionsH = optionsPanel && optionsPanel.classList.contains('open')
            ? optionsPanel.offsetHeight + 8
            : 0;
        const hint = document.getElementById('controlsHint');
        const hintH = hint && getComputedStyle(hint).display !== 'none' ? hint.offsetHeight : 0;
        availableW = vw - 32 - bezelPad;
        availableH = vh - dock - topH - hud - actionsH - optionsH - hintH - 28 - bezelPad;
    } else {
        availableW = Math.min(340, vw - 440);
        availableH = vh - 150;
    }
    let width = Math.min(availableW, availableH / 2);
    const cap = land ? 300 : (narrow ? 480 : 340);
    if (!Number.isFinite(width)) width = 220;
    width = Math.max(150, Math.min(width, cap));
    width = Math.round(width / 4) * 4;
    const scale = width / (COLS * CELL_SIZE);
    const cssW = Math.round(COLS * CELL_SIZE * scale);
    const cssH = Math.round(ROWS * CELL_SIZE * scale);
    if (gameCanvas.style.width === `${cssW}px` && gameCanvas.style.height === `${cssH}px`) return;
    gameCanvas.style.width = `${cssW}px`;
    gameCanvas.style.height = `${cssH}px`;
}

function syncSoundButton() {
    if (!soundButton) return;
    const muted = isMuted();
    soundButton.classList.toggle('is-muted', muted);
    soundButton.setAttribute('aria-pressed', muted ? 'true' : 'false');
    soundButton.setAttribute('aria-label', muted ? t('soundOn') : t('soundOff'));
}

function applyTheme(theme) {
    for (let i = 0; i < THEMES.length; i++) body.classList.remove(`theme-${THEMES[i]}`);
    body.classList.add(`theme-${theme}`);
    try {
        localStorage.setItem('tetrisTheme', theme);
    } catch (_) {
    }
    document.querySelectorAll('[data-theme]').forEach((el) => {
        const on = el.dataset.theme === theme;
        el.classList.toggle('active', on);
        el.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
}

function loadTheme() {
    let saved = null;
    try {
        saved = localStorage.getItem('tetrisTheme');
    } catch (_) {
    }
    if (saved && THEMES.includes(saved)) applyTheme(saved);
    else applyTheme('classic');
}

function applyBoardBg(key, quiet) {
    if (!renderer.setBoardBg(key)) return;
    try {
        localStorage.setItem('tetrisBoardBg', key);
    } catch (_) {
    }
    document.querySelectorAll('.board-swatch').forEach((el) => {
        const on = el.dataset.boardBg === key;
        el.classList.toggle('active', on);
        el.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    const color = BOARD_BGS[key].color;
    gameCanvas.style.background = color;
    nextCanvas.style.background = color;
    renderer.render(game);
    if (!quiet) playUiSound();
}

function loadBoardBg() {
    let saved = null;
    try {
        saved = localStorage.getItem('tetrisBoardBg');
    } catch (_) {
    }
    const key = saved && BOARD_BGS[saved] ? saved : DEFAULT_BOARD_BG;
    applyBoardBg(key, true);
}

function stopLoop() {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
}

function gameLoop(timestamp) {
    if (game.state === 'paused') {
        renderer.render(game);
        syncChrome();
        animationId = null;
        return;
    }
    const before = game.state;
    game.update(timestamp);
    renderer.render(game);
    syncChrome();
    if (game.state !== 'playing') {
        if (before !== game.state) noteState(game.state);
        resizeCanvas();
        renderer.clearFx();
        renderer.render(game);
        syncChrome();
        animationId = null;
        return;
    }
    animationId = requestAnimationFrame(gameLoop);
}

function startGame() {
    stopLoop();
    renderer.clearFx();
    game.start();
    noteState(game.state);
    syncChrome();
    resizeCanvas();
    renderer.render(game);
    if (game.state === 'playing') {
        playStartSound();
        animationId = requestAnimationFrame(gameLoop);
    }
}

function returnToTitle() {
    stopLoop();
    renderer.clearFx();
    game.returnToIdle();
    noteState('idle');
    syncChrome();
    resizeCanvas();
    renderer.render(game);
    playSound(330, 80, 'square', 0.12);
}

function handleStartButton() {
    if (game.state === 'idle') {
        startGame();
        return;
    }
    returnToTitle();
}

function handleBoardAction() {
    if (game.state === 'gameover') {
        returnToTitle();
        return;
    }
    if (game.state === 'idle') {
        startGame();
        return;
    }
    if (game.state === 'paused') handlePauseToggle();
}

function handlePauseToggle() {
    if (!game.isActive()) return;
    const next = game.togglePause();
    playSound(next === 'paused' ? 392 : 587, 50, 'square', 0.16);
    syncChrome();
    renderer.render(game);
    if (next === 'paused') {
        stopLoop();
    } else if (next === 'playing' && !animationId) {
        animationId = requestAnimationFrame(gameLoop);
    }
}

new InputHandler(game, isTouchDevice, handlePauseToggle, handleBoardAction);

function onResize() {
    cancelAnimationFrame(resizeTick);
    resizeTick = requestAnimationFrame(() => {
        if (!narrowLayout()) setOptionsOpen(true);
        resizeCanvas();
    });
}

window.addEventListener('resize', onResize);
window.addEventListener('orientationchange', () => setTimeout(onResize, 80));
if (window.visualViewport) window.visualViewport.addEventListener('resize', onResize);

if (startButton) {
    startButton.addEventListener('click', () => {
        handleStartButton();
        startButton.blur();
    });
}

if (pauseButton) {
    pauseButton.addEventListener('click', () => {
        handlePauseToggle();
        pauseButton.blur();
    });
}

const boardShell = document.querySelector('.canvas-wrapper');
if (boardShell) boardShell.addEventListener('click', handleBoardAction);

if (soundButton) {
    soundButton.addEventListener('click', () => {
        toggleMuted();
        syncSoundButton();
        if (!isMuted()) playUiSound();
        soundButton.blur();
    });
}

if (optionsToggle) {
    optionsToggle.addEventListener('click', () => {
        const open = !(optionsPanel && optionsPanel.classList.contains('open') && narrowLayout());
        setOptionsOpen(open);
        resizeCanvas();
        optionsToggle.blur();
    });
}

document.querySelectorAll('[data-theme]').forEach((swatch) => {
    swatch.addEventListener('click', () => {
        const theme = swatch.dataset.theme;
        if (!theme) return;
        applyTheme(theme);
        playUiSound();
        swatch.blur();
    });
});

document.querySelectorAll('.board-swatch').forEach((swatch) => {
    swatch.addEventListener('click', () => {
        const key = swatch.dataset.boardBg;
        if (key) applyBoardBg(key, false);
        swatch.blur();
    });
});

document.querySelectorAll('.speed-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
        const level = btn.dataset.speed;
        if (!level) return;
        btn.blur();
        if (!game.canChangeSpeed()) {
            if (game.state === 'playing') {
                game.pause();
                stopLoop();
                syncChrome();
                renderer.render(game);
            }
            showToast(t('toastSpeed'));
            playSound(220, 100, 'square', 0.18);
            return;
        }
        if (game.setSpeedLevel(level)) {
            syncChrome();
            renderer.render(game);
            playUiSound();
        }
    });
});

document.addEventListener('visibilitychange', () => {
    if (document.hidden && game.state === 'playing') handlePauseToggle();
});

loadTheme();
loadBoardBg();
syncSoundButton();
noteState(game.state);
syncChrome();
resizeCanvas();
renderer.render(game);
