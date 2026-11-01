import { COLS, ROWS, SPEED_LEVELS, BOARD_BGS, DEFAULT_BOARD_BG } from './constants.js';
import { t } from './i18n.js';

function ctx2d(canvas) {
    try {
        return canvas.getContext('2d', { alpha: false }) || canvas.getContext('2d');
    } catch (_) {
        return canvas.getContext('2d');
    }
}

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

function paintCell(size, color) {
    const cv = document.createElement('canvas');
    cv.width = size;
    cv.height = size;
    const ctx = cv.getContext('2d');
    const pad = Math.max(1, Math.round(size / 24));
    const w = size - pad * 2;
    roundRect(ctx, pad, pad, w, w, Math.max(2, size * 0.18));
    ctx.fillStyle = color;
    ctx.fill();
    const g = ctx.createLinearGradient(0, pad, 0, pad + w);
    g.addColorStop(0, 'rgba(255,255,255,0.5)');
    g.addColorStop(0.45, 'rgba(255,255,255,0.06)');
    g.addColorStop(1, 'rgba(0,0,0,0.4)');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.lineWidth = Math.max(1, size / 16);
    ctx.strokeStyle = 'rgba(255,255,255,0.26)';
    ctx.stroke();
    if (size >= 18) {
        roundRect(ctx, pad + size * 0.14, pad + size * 0.12, size * 0.22, size * 0.09, size * 0.045);
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.fill();
    }
    return cv;
}

function motionReduced() {
    return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export class Renderer {
    constructor(gameCanvas, nextCanvas) {
        this.gameCanvas = gameCanvas;
        this.nextCanvas = nextCanvas;
        this.gameCtx = ctx2d(gameCanvas);
        this.nextCtx = ctx2d(nextCanvas);
        this.boardBgKey = DEFAULT_BOARD_BG;
        this.boardBg = BOARD_BGS[DEFAULT_BOARD_BG].color;
        this.particles = [];
        this.sprites = new Map();
        this.lockFx = null;
        this.layer = null;
        this.cell = 30;
        this.pcell = 22;
        this.scoreEl = document.getElementById('scoreDisplay');
        this.levelEl = document.getElementById('levelDisplay');
        this.linesEl = document.getElementById('linesDisplay');
        this.speedEl = document.getElementById('speedDisplay');
        this.highEl = document.getElementById('highScoreDisplay');
        this.meterEl = document.getElementById('levelMeter');
        this.last = { score: null, level: null, lines: null, speed: null, high: null, meter: null };
        this.resize(30, 1);
    }

    resize(cell, dpr) {
        this.cell = Math.max(8, cell);
        const nextW = this.nextCanvas.clientWidth || 110;
        this.pcell = Math.max(6, Math.floor((nextW * dpr) / 5));
        this.gameCanvas.width = this.cell * COLS;
        this.gameCanvas.height = this.cell * ROWS;
        this.nextCanvas.width = this.pcell * 5;
        this.nextCanvas.height = this.pcell * 5;
        this.sprites.clear();
        this.buildLayer();
    }

    buildLayer() {
        const w = this.gameCanvas.width;
        const h = this.gameCanvas.height;
        const cv = document.createElement('canvas');
        cv.width = w;
        cv.height = h;
        const ctx = cv.getContext('2d');
        ctx.fillStyle = this.boardBg;
        ctx.fillRect(0, 0, w, h);
        const shade = ctx.createLinearGradient(0, 0, 0, h);
        shade.addColorStop(0, 'rgba(255,255,255,0.06)');
        shade.addColorStop(0.3, 'rgba(255,255,255,0)');
        shade.addColorStop(1, 'rgba(0,0,0,0.3)');
        ctx.fillStyle = shade;
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = Math.max(1, Math.round(this.cell / 30));
        ctx.beginPath();
        for (let c = 1; c < COLS; c++) {
            const x = c * this.cell + 0.5;
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
        }
        for (let r = 1; r < ROWS; r++) {
            const y = r * this.cell + 0.5;
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
        }
        ctx.stroke();
        const vg = ctx.createRadialGradient(w / 2, h * 0.42, h * 0.18, w / 2, h / 2, h * 0.72);
        vg.addColorStop(0, 'rgba(0,0,0,0)');
        vg.addColorStop(1, 'rgba(0,0,0,0.34)');
        ctx.fillStyle = vg;
        ctx.fillRect(0, 0, w, h);
        this.layer = cv;
    }

    setBoardBg(key) {
        if (!BOARD_BGS[key]) return false;
        this.boardBgKey = key;
        this.boardBg = BOARD_BGS[key].color;
        this.buildLayer();
        return true;
    }

    clearFx() {
        this.particles.length = 0;
        this.lockFx = null;
    }

    noteLock(cells, color, matrix, x, fromY, toY) {
        const trail = fromY != null && toY > fromY ? { matrix, x, y0: fromY, y1: toY } : null;
        this.lockFx = { cells, color, trail, at: performance.now() };
    }

    burst(rows, grid) {
        if (motionReduced()) return;
        const k = this.cell / 30;
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            for (let col = 0; col < COLS; col++) {
                const color = grid[row][col];
                if (!color) continue;
                for (let n = 0; n < 2; n++) {
                    this.particles.push({
                        x: (col + Math.random()) * this.cell,
                        y: (row + Math.random()) * this.cell,
                        vx: (Math.random() - 0.5) * 5.2 * k,
                        vy: (-Math.random() * 3.4 - 0.3) * k,
                        life: 1,
                        color,
                        size: (3 + Math.random() * 3) * k
                    });
                }
            }
        }
        if (this.particles.length > 160) this.particles.splice(0, this.particles.length - 160);
    }

    sprite(size, color) {
        const key = size + color;
        let s = this.sprites.get(key);
        if (!s) {
            s = paintCell(size, color);
            this.sprites.set(key, s);
        }
        return s;
    }

    drawCell(ctx, x, y, size, color) {
        ctx.drawImage(this.sprite(size, color), Math.round(x * size), Math.round(y * size));
    }

    drawBoard(grid) {
        const ctx = this.gameCtx;
        ctx.drawImage(this.layer, 0, 0);
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const cell = grid[row][col];
                if (cell !== 0) this.drawCell(ctx, col, row, this.cell, cell);
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
        const pad = Math.max(2, Math.round(size * 0.1));
        ctx.save();
        ctx.lineWidth = Math.max(1.5, size * 0.07);
        ctx.strokeStyle = piece.color;
        ctx.fillStyle = piece.color;
        for (let r = 0; r < matrix.length; r++) {
            for (let c = 0; c < matrix[r].length; c++) {
                if (!matrix[r][c]) continue;
                const drawY = ghostY + r;
                if (drawY < 0) continue;
                roundRect(ctx, (x + c) * size + pad, drawY * size + pad, size - pad * 2, size - pad * 2, size * 0.14);
                ctx.globalAlpha = 0.12;
                ctx.fill();
                ctx.globalAlpha = 0.55;
                ctx.stroke();
            }
        }
        ctx.restore();
    }

    drawClearFlash(rows, until, duration) {
        if (!rows || !rows.length || !duration) return;
        const p = Math.min(1, Math.max(0, 1 - (until - performance.now()) / duration));
        const ctx = this.gameCtx;
        const w = this.gameCanvas.width;
        const half = (w / 2) * Math.min(1, p * 2.2);
        ctx.save();
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < rows.length; i++) {
            const y = rows[i] * this.cell;
            ctx.globalAlpha = 0.28 * (1 - p);
            ctx.fillRect(0, y, w, this.cell);
            ctx.globalAlpha = 0.95 * (1 - p * p);
            ctx.fillRect(w / 2 - half, y, half * 2, this.cell);
        }
        ctx.restore();
    }

    drawLockFx() {
        const fx = this.lockFx;
        if (!fx) return;
        const age = performance.now() - fx.at;
        if (age > 240) {
            this.lockFx = null;
            return;
        }
        const k = 1 - age / 240;
        const ctx = this.gameCtx;
        const s = this.cell;
        ctx.save();
        if (fx.trail) {
            const { matrix, x, y0, y1 } = fx.trail;
            for (let c = 0; c < matrix[0].length; c++) {
                let top = -1;
                for (let r = 0; r < matrix.length; r++) {
                    if (matrix[r][c]) {
                        top = r;
                        break;
                    }
                }
                if (top < 0) continue;
                const a = Math.max(0, (y0 + top) * s);
                const b = (y1 + top) * s;
                if (b <= a) continue;
                const g = ctx.createLinearGradient(0, a, 0, b);
                g.addColorStop(0, 'rgba(255,255,255,0)');
                g.addColorStop(1, fx.color);
                ctx.globalAlpha = 0.55 * k;
                ctx.fillStyle = g;
                ctx.fillRect((x + c) * s + s * 0.15, a, s * 0.7, b - a);
            }
        }
        ctx.globalAlpha = 0.75 * k;
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < fx.cells.length; i++) {
            const cx = fx.cells[i][0];
            const cy = fx.cells[i][1];
            if (cy >= 0) ctx.fillRect(cx * s, cy * s, s, s);
        }
        ctx.restore();
    }

    updateParticles() {
        const k = this.cell / 30;
        const next = [];
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.16 * k;
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
                    this.drawGhost(this.gameCtx, game.currentPiece, game.currentX, ghostY, this.cell);
                }
            }
            this.drawPiece(this.gameCtx, game.currentPiece, game.currentX, game.currentY, this.cell);
        }
        if (game.state === 'playing') this.drawLockFx();
        this.updateParticles();
        this.drawParticles();
        this.drawNext(game.nextPiece);
        this.updateStats(game);
    }

    drawNext(nextPiece) {
        const ctx = this.nextCtx;
        ctx.fillStyle = this.boardBg;
        ctx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        if (!nextPiece) return;
        const matrix = nextPiece.getMatrix();
        const rows = matrix.length;
        const cols = matrix[0].length;
        const offsetX = (5 - cols) / 2;
        const offsetY = (5 - rows) / 2;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (matrix[r][c]) this.drawCell(ctx, offsetX + c, offsetY + r, this.pcell, nextPiece.color);
            }
        }
    }
}
