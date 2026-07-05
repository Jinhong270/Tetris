import { Game } from './game.js';
import { Renderer } from './renderer.js';
import { InputHandler } from './input.js';
import { COLS, ROWS, CELL_SIZE } from './constants.js';

const gameCanvas = document.getElementById('gameCanvas');
const nextCanvas = document.getElementById('nextCanvas');
const startButton = document.getElementById('startButton');
const body = document.body;

const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
if (isTouchDevice) {
    body.classList.add('touch-device');
}

const game = new Game();
const renderer = new Renderer(gameCanvas, nextCanvas);
const input = new InputHandler(game, isTouchDevice);

let animationId = null;

function gameLoop(timestamp) {
    game.update(timestamp);
    renderer.render(game);
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
    game.start();
    animationId = requestAnimationFrame(gameLoop);
});

document.querySelectorAll('.swatch').forEach(swatch => {
    swatch.addEventListener('click', (e) => {
        const theme = e.target.dataset.theme;
        body.className = body.className.replace(/theme-\w+/g, '');
        body.classList.add(`theme-${theme}`);
        if (isTouchDevice) body.classList.add('touch-device');
    });
});

renderer.render(game);
