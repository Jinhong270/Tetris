import { COLS, ROWS, CELL_SIZE, PREVIEW_CELL_SIZE, SPEED_LEVELS, BOARD_BGS, DEFAULT_BOARD_BG } from './constants.js';
import { t } from './i18n.js';

function edgeSize(size) {
    return Math.max(1, (size * 0.14) | 0);
}

function ctx2d(canvas) {
    try {
        return canvas.getContext('2d', { alpha: false }) || canvas.getContext('2d');
    } catch (_) {
        return canvas.getContext('2d');
    }
}

export class Renderer {
    constructor(gameCanvas, nextCanvas) {
        this.gameCtx = ctx2d(gameCanvas);
        this.nextCtx = ctx2d(nextCanvas);
        this.gameCanvas = gameCanvas;
        this.nextCanvas = nextCanvas;
        this.gameCanvas.width = COLS * CELL_SIZE;
        this.gameCanvas.height = ROWS * CELL_SIZE;
        this.nextCanvas.width = 5 * PREVIEW_CELL_SIZE;
        this.nextCanvas.height = 5 * PREVIEW_CELL_SIZE;
        this.boardBgKey = DEFAULT_BOARD_BG;
        this.boardBg = BOARD_BGS[DEFAULT_BOARD_BG].color;
        this.particles = [];
        this.scoreEl = document.getElementById('scoreDisplay');
        this.levelEl = document.getElementById('levelDisplay');
        this.linesEl = document.getElementById('linesDisplay');
        this.speedEl = document.getElementById('speedDisplay');
        this.highEl = document.getElementById('highScoreDisplay');
        this.meterEl = document.getElementById('levelMeter');
        this.last = {
            score: null,
            level: null,
            lines: null,
            speed: null,
            high: null,
            meter: null
        };
    }

    setBoardBg(key) {
        if (!BOARD_BGS[key]) return false;
        this.boardBgKey = key;
        this.boardBg = BOARD_BGS[key].color;
        return true;
    }

    clearFx() {
        this.particles.length = 0;
    }

    burst(rows, grid) {
        if (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            for (let col = 0; col < COLS; col++) {
                const color = grid[row][col];
                if (!color) continue;
                for (let n = 0; n < 2; n++) {
                    this.particles.push({
                        x: (col + Math.random()) * CELL_SIZE,
                        y: (row + Math.random()) * CELL_SIZE,
                        vx: (Math.random() - 0.5) * 5.2,
                        vy: -Math.random() * 3.4 - 0.3,
                        life: 1,
                        color,
                        size: 3 + Math.random() * 3
                    });
                }
            }
        }
        if (this.particles.length > 140) {
            this.particles.splice(0, this.particles.length - 140);
        }
    }

    drawCell(ctx, x, y, size, color) {
        const px = x * size;
        const py = y * size;
        const inset = size >= 20 ? 1 : 0;
        const w = size - inset * 2;
        const h = size - inset * 2;
        const edge = edgeSize(size);
        ctx.fillStyle = color;
        ctx.fillRect(px + inset, py + inset, w, h);
        ctx.fillStyle = 'rgba(255,255,255,0.42)';
        ctx.fillRect(px + inset, py + inset, w, edge);
        ctx.fillRect(px + inset, py + inset, edge, h);
        ctx.fillStyle = 'rgba(0,0,0,0.32)';
        ctx.fillRect(px + inset, py + inset + h - edge, w, edge);
        ctx.fillRect(px + inset + w - edge, py + inset, edge, h);
        if (size >= 18) {
            ctx.fillStyle = 'rgba(255,255,255,0.34)';
            const spark = Math.max(2, (size * 0.16) | 0);
            ctx.fillRect(px + inset + edge + 1, py + inset + edge + 1, spark, spark);
        }
    }

    drawBoard(grid) {
        const ctx = this.gameCtx;
        const w = this.gameCanvas.width;
        const h = this.gameCanvas.height;
        ctx.fillStyle = this.boardBg;
        ctx.fillRect(0, 0, w, h);
        const shade = ctx.createLinearGradient(0, 0, 0, h);
        shade.addColorStop(0, 'rgba(255,255,255,0.05)');
        shade.addColorStop(0.28, 'rgba(255,255,255,0)');
        shade.addColorStop(1, 'rgba(0,0,0,0.28)');
        ctx.fillStyle = shade;
        ctx.fillRect(0, 0, w, h);
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255,255,255,0.045)';
        ctx.lineWidth = 1;
        for (let col = 1; col < COLS; col++) {
            const x = col * CELL_SIZE + 0.5;
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
        }
        for (let row = 1; row < ROWS; row++) {
            const y = row * CELL_SIZE + 0.5;
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
        }
        ctx.stroke();
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const cell = grid[row][col];
                if (cell !== 0) this.drawCell(ctx, col, row, CELL_SIZE, cell);
            }
        }
    }

    drawPiece(ctx, piece, x, y, size) {
        const matrix = piece.getMatrix();
        for (let r = 0; r < matrix.length; r++) {
            for (let c = 0; c < matrix[r].length; c++) {
                if (!matrix[r][c]) continue;
                const drawY = y + r;
                if (drawY >= 0) this.drawCell(ctx, x + c, drawY, size, piece.color);
            }
        }
    }

    drawGhost(ctx, piece, x, ghostY, size) {
        const matrix = piece.getMatrix();
        ctx.save();
        ctx.globalAlpha = 0.55;
        ctx.lineWidth = 2;
        ctx.strokeStyle = piece.color;
        for (let r = 0; r < matrix.length; r++) {
            for (let c = 0; c < matrix[r].length; c++) {
                if (!matrix[r][c]) continue;
                const drawY = ghostY + r;
                if (drawY < 0) continue;
                ctx.strokeRect((x + c) * size + 3, drawY * size + 3, size - 6, size - 6);
            }
        }
        ctx.restore();
    }

    drawClearFlash(rows, until, duration) {
        if (!rows || !rows.length || !duration) return;
        const remain = Math.max(0, until - performance.now());
        const t = 1 - remain / duration;
        const alpha = 0.22 + Math.abs(Math.sin(t * Math.PI * 3)) * 0.5;
        const ctx = this.gameCtx;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < rows.length; i++) {
            ctx.fillRect(0, rows[i] * CELL_SIZE, this.gameCanvas.width, CELL_SIZE);
        }
        ctx.restore();
    }

    updateParticles() {
        const next = [];
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.16;
            p.life -= 0.028;
            if (p.life > 0) next.push(p);
        }
        this.particles = next;
    }

    drawParticles() {
        if (!this.particles.length) return;
        const ctx = this.gameCtx;
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.size, p.size);
        }
        ctx.globalAlpha = 1;
    }

    drawVignette() {
        const ctx = this.gameCtx;
        const w = this.gameCanvas.width;
        const h = this.gameCanvas.height;
        const vg = ctx.createRadialGradient(w * 0.5, h * 0.42, h * 0.18, w * 0.5, h * 0.5, h * 0.72);
        vg.addColorStop(0, 'rgba(0,0,0,0)');
        vg.addColorStop(1, 'rgba(0,0,0,0.32)');
        ctx.fillStyle = vg;
        ctx.fillRect(0, 0, w, h);
    }

    pop(el) {
        if (!el) return;
        el.classList.remove('pop');
        void el.offsetWidth;
        el.classList.add('pop');
    }

    updateStats(game) {
        if (this.scoreEl && this.last.score !== game.score) {
            if (this.last.score !== null && game.score - this.last.score >= 40) this.pop(this.scoreEl);
            this.scoreEl.textContent = String(game.score);
            this.last.score = game.score;
        }
        if (this.levelEl && this.last.level !== game.level) {
            this.levelEl.textContent = String(game.level);
            this.last.level = game.level;
        }
        if (this.linesEl && this.last.lines !== game.lines) {
            this.linesEl.textContent = String(game.lines);
            this.last.lines = game.lines;
        }
        const speedLabel = t(SPEED_LEVELS[game.speedLevel].labelKey);
        if (this.speedEl && this.last.speed !== speedLabel) {
            this.speedEl.textContent = speedLabel;
            this.last.speed = speedLabel;
        }
        if (this.highEl && this.last.high !== game.highScore) {
            if (this.last.high !== null && game.highScore > this.last.high) this.pop(this.highEl);
            this.highEl.textContent = String(game.highScore || 0);
            this.last.high = game.highScore;
        }
        const meter = (game.lines % 10) * 10;
        if (this.meterEl && this.last.meter !== meter) {
            this.meterEl.style.width = meter + '%';
            this.last.meter = meter;
        }
    }

    render(game) {
        this.drawBoard(game.board.grid);
        if (game.clearingRows) {
            this.drawClearFlash(game.clearingRows, game.clearingUntil, game.clearingDuration);
        }
        if (game.currentPiece && game.isActive()) {
            if (game.state === 'playing') {
                const ghostY = game.getGhostY();
                if (ghostY !== game.currentY) {
                    this.drawGhost(this.gameCtx, game.currentPiece, game.currentX, ghostY, CELL_SIZE);
                }
            }
            this.drawPiece(this.gameCtx, game.currentPiece, game.currentX, game.currentY, CELL_SIZE);
        }
        this.updateParticles();
        this.drawParticles();
        this.drawVignette();
        this.drawNext(game.nextPiece);
        this.updateStats(game);
    }

    drawNext(nextPiece) {
        const ctx = this.nextCtx;
        const w = this.nextCanvas.width;
        const h = this.nextCanvas.height;
        ctx.fillStyle = this.boardBg;
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
}
