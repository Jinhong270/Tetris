import { COLS, ROWS, CELL_SIZE, PREVIEW_CELL_SIZE, SPEED_LEVELS } from './constants.js';

export class Renderer {
    constructor(gameCanvas, nextCanvas) {
        this.gameCtx = gameCanvas.getContext('2d');
        this.nextCtx = nextCanvas.getContext('2d');
        this.gameCanvas = gameCanvas;
        this.nextCanvas = nextCanvas;
        this.gameCanvas.width = COLS * CELL_SIZE;
        this.gameCanvas.height = ROWS * CELL_SIZE;
        this.nextCanvas.width = 5 * PREVIEW_CELL_SIZE;
        this.nextCanvas.height = 5 * PREVIEW_CELL_SIZE;
    }

    drawCell(ctx, x, y, size, color, alpha = 1) {
        ctx.save();
        ctx.globalAlpha = alpha;
        const px = x * size;
        const py = y * size;
        ctx.fillStyle = color;
        ctx.fillRect(px, py, size, size);
        ctx.fillStyle = 'rgba(255,255,255,0.28)';
        ctx.fillRect(px, py, size, 2);
        ctx.fillRect(px, py, 2, size);
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillRect(px, py + size - 2, size, 2);
        ctx.fillRect(px + size - 2, py, 2, size);
        ctx.strokeStyle = 'rgba(0,0,0,0.45)';
        ctx.lineWidth = 1;
        ctx.strokeRect(px + 0.5, py + 0.5, size - 1, size - 1);
        ctx.restore();
    }

    drawBoard(grid) {
        const ctx = this.gameCtx;
        const w = this.gameCanvas.width;
        const h = this.gameCanvas.height;
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#0a0a12';
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 0.5;
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                ctx.strokeRect(col * CELL_SIZE + 0.5, row * CELL_SIZE + 0.5, CELL_SIZE - 1, CELL_SIZE - 1);
            }
        }
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const cell = grid[row][col];
                if (cell !== 0) this.drawCell(ctx, col, row, CELL_SIZE, cell);
            }
        }
    }

    drawPiece(ctx, piece, x, y, size, alpha = 1) {
        const matrix = piece.getMatrix();
        for (let r = 0; r < matrix.length; r++) {
            for (let c = 0; c < matrix[r].length; c++) {
                if (matrix[r][c]) {
                    const drawY = y + r;
                    if (drawY >= 0) this.drawCell(ctx, x + c, drawY, size, piece.color, alpha);
                }
            }
        }
    }

    drawGhost(ctx, piece, x, ghostY, size) {
        const matrix = piece.getMatrix();
        ctx.save();
        ctx.globalAlpha = 0.22;
        for (let r = 0; r < matrix.length; r++) {
            for (let c = 0; c < matrix[r].length; c++) {
                if (!matrix[r][c]) continue;
                const drawY = ghostY + r;
                if (drawY < 0) continue;
                ctx.fillStyle = piece.color;
                ctx.fillRect((x + c) * size, drawY * size, size, size);
                ctx.strokeStyle = 'rgba(255,255,255,0.35)';
                ctx.lineWidth = 1;
                ctx.strokeRect((x + c) * size + 0.5, drawY * size + 0.5, size - 1, size - 1);
            }
        }
        ctx.restore();
    }

    render(game) {
        this.drawBoard(game.board.grid);
        if (game.currentPiece && game.isActive()) {
            if (game.state === 'playing') {
                const ghostY = game.getGhostY();
                if (ghostY !== game.currentY) {
                    this.drawGhost(this.gameCtx, game.currentPiece, game.currentX, ghostY, CELL_SIZE);
                }
            }
            this.drawPiece(this.gameCtx, game.currentPiece, game.currentX, game.currentY, CELL_SIZE);
        }
        this.drawNext(game.nextPiece);
        this.updateStats(game);
        if (game.state === 'gameover') this.drawOverlay('游戏结束', '点击重新开始');
        else if (game.state === 'idle') this.drawOverlay('TETRIS', '点击开始游戏');
        else if (game.state === 'paused') this.drawOverlay('已暂停', '点击继续');
    }

    drawNext(nextPiece) {
        const ctx = this.nextCtx;
        const w = this.nextCanvas.width;
        const h = this.nextCanvas.height;
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#0a0a12';
        ctx.fillRect(0, 0, w, h);
        if (!nextPiece) return;
        const matrix = nextPiece.getMatrix();
        const rows = matrix.length;
        const cols = matrix[0].length;
        const offsetX = (5 - cols) / 2;
        const offsetY = (5 - rows) / 2;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (matrix[r][c]) {
                    this.drawCell(ctx, offsetX + c, offsetY + r, PREVIEW_CELL_SIZE, nextPiece.color);
                }
            }
        }
    }

    updateStats(game) {
        const scoreEl = document.getElementById('scoreDisplay');
        const levelEl = document.getElementById('levelDisplay');
        const linesEl = document.getElementById('linesDisplay');
        const speedEl = document.getElementById('speedDisplay');
        if (scoreEl) scoreEl.textContent = String(game.score);
        if (levelEl) levelEl.textContent = String(game.level);
        if (linesEl) linesEl.textContent = String(game.lines);
        if (speedEl) speedEl.textContent = SPEED_LEVELS[game.speedLevel].label;
    }

    drawOverlay(text, subText) {
        const ctx = this.gameCtx;
        const w = this.gameCanvas.width;
        const h = this.gameCanvas.height;
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.78)';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#e8c547';
        ctx.font = 'bold 18px "Press Start 2P", cursive';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(232, 197, 71, 0.6)';
        ctx.shadowBlur = 8;
        ctx.fillText(text, w / 2, h / 2 - 14);
        ctx.font = '9px "Press Start 2P", cursive';
        ctx.fillStyle = '#c8c0b0';
        ctx.shadowBlur = 4;
        ctx.fillText(subText, w / 2, h / 2 + 18);
        ctx.restore();
    }
}
