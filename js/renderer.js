import { COLS, ROWS, CELL_SIZE, PREVIEW_CELL_SIZE } from './constants.js';

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
        ctx.fillStyle = color;
        ctx.fillRect(x * size, y * size, size, size);
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fillRect(x * size, y * size, size, 2);
        ctx.fillRect(x * size, y * size, 2, size);
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect(x * size, y * size + size - 2, size, 2);
        ctx.fillRect(x * size + size - 2, y * size, 2, size);
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x * size + 0.5, y * size + 0.5, size - 1, size - 1);
        ctx.restore();
    }

    drawBoard(grid) {
        const ctx = this.gameCtx;
        ctx.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
        ctx.fillStyle = '#0f0f0a';
        ctx.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
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
        ctx.globalAlpha = 0.2;
        for (let r = 0; r < matrix.length; r++) {
            for (let c = 0; c < matrix[r].length; c++) {
                if (matrix[r][c]) {
                    const drawY = ghostY + r;
                    if (drawY >= 0) {
                        ctx.fillStyle = piece.color;
                        ctx.fillRect((x + c) * size, drawY * size, size, size);
                        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
                        ctx.lineWidth = 1;
                        ctx.strokeRect((x + c) * size + 0.5, drawY * size + 0.5, size - 1, size - 1);
                    }
                }
            }
        }
        ctx.restore();
    }

    render(game) {
        this.drawBoard(game.board.grid);
        if (game.currentPiece && game.state === 'playing') {
            const ghostY = game.getGhostY();
            if (ghostY !== game.currentY) this.drawGhost(this.gameCtx, game.currentPiece, game.currentX, ghostY, CELL_SIZE);
            this.drawPiece(this.gameCtx, game.currentPiece, game.currentX, game.currentY, CELL_SIZE);
        }
        this.drawNext(game.nextPiece);
        this.updateStats(game);
        if (game.state === 'gameover') this.drawGameOver();
        else if (game.state === 'idle') this.drawIdle();
    }

    drawNext(nextPiece) {
        const ctx = this.nextCtx;
        ctx.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        ctx.fillStyle = '#0f0f0a';
        ctx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        if (!nextPiece) return;
        const matrix = nextPiece.getMatrix();
        const rows = matrix.length;
        const cols = matrix[0].length;
        const offsetX = (5 - cols) / 2;
        const offsetY = (5 - rows) / 2;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (matrix[r][c]) this.drawCell(ctx, offsetX + c, offsetY + r, PREVIEW_CELL_SIZE, nextPiece.color);
            }
        }
    }

    updateStats(game) {
        document.getElementById('scoreDisplay').textContent = game.score;
        document.getElementById('levelDisplay').textContent = game.level;
        document.getElementById('linesDisplay').textContent = game.lines;
    }

    drawOverlay(text, subText) {
        const ctx = this.gameCtx;
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
        ctx.fillStyle = '#e0e0c0';
        ctx.font = 'bold 20px "Press Start 2P", cursive';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 6;
        ctx.fillText(text, this.gameCanvas.width / 2, this.gameCanvas.height / 2 - 12);
        ctx.font = '10px "Press Start 2P", cursive';
        ctx.fillStyle = '#b0b090';
        ctx.fillText(subText, this.gameCanvas.width / 2, this.gameCanvas.height / 2 + 20);
        ctx.restore();
    }

    drawGameOver() {
        this.drawOverlay('游戏结束', '点击按钮重新开始');
    }

    drawIdle() {
        this.drawOverlay('俄罗斯方块', '按开始游戏');
    }
}
