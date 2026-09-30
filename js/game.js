import { Board } from './board.js';
import { Piece } from './piece.js';
import { PIECE_TYPES, COLS, SPEED_LEVELS, DEFAULT_SPEED, SCORE_MAP } from './constants.js';
import { playClearSound, playGameOverSound } from './audio.js';

const HIGH_SCORES_KEY = 'tetrisHighScores';

function storeGet(key) {
    try {
        return localStorage.getItem(key);
    } catch (_) {
        return null;
    }
}

function storeSet(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch (_) {
    }
}

function reducedMotion() {
    return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export class Game {
    constructor() {
        this.board = new Board();
        this.currentPiece = null;
        this.nextPiece = null;
        this.currentX = 0;
        this.currentY = 0;
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.state = 'idle';
        this.lastDropTime = 0;
        this.softDropActive = false;
        this.speedLevel = DEFAULT_SPEED;
        this.dropInterval = SPEED_LEVELS[this.speedLevel].drop;
        this.highScore = 0;
        this.isNewRecord = false;
        this.bag = [];
        this.clearingRows = null;
        this.clearingUntil = 0;
        this.clearingDuration = 0;
        this.pauseStarted = 0;
        this.onClearStart = null;
        this.loadHighScore();
    }

    isActive() {
        return this.state === 'playing' || this.state === 'paused';
    }

    canChangeSpeed() {
        return this.state === 'idle' || this.state === 'gameover';
    }

    randomPiece() {
        if (this.bag.length === 0) {
            this.bag = PIECE_TYPES.slice();
            for (let i = this.bag.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                const tmp = this.bag[i];
                this.bag[i] = this.bag[j];
                this.bag[j] = tmp;
            }
        }
        return new Piece(this.bag.pop());
    }

    setSpeedLevel(level) {
        if (!SPEED_LEVELS[level]) return false;
        if (!this.canChangeSpeed()) return false;
        if (this.speedLevel === level) return true;
        this.speedLevel = level;
        this.dropInterval = SPEED_LEVELS[level].drop;
        this.isNewRecord = false;
        storeSet('tetrisSpeed', level);
        this.loadHighScore();
        return true;
    }

    loadSpeedLevel() {
        const saved = storeGet('tetrisSpeed');
        if (saved && SPEED_LEVELS[saved]) {
            this.speedLevel = saved;
            this.dropInterval = SPEED_LEVELS[saved].drop;
        }
        this.loadHighScore();
    }

    getAllHighScores() {
        try {
            const raw = storeGet(HIGH_SCORES_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && typeof parsed === 'object') return parsed;
            }
        } catch (_) {
        }
        const legacy = storeGet('tetrisHighScore');
        if (legacy) {
            const n = parseInt(legacy, 10);
            if (!isNaN(n) && n > 0) {
                const migrated = { normal: n };
                storeSet(HIGH_SCORES_KEY, JSON.stringify(migrated));
                return migrated;
            }
        }
        return {};
    }

    loadHighScore() {
        const all = this.getAllHighScores();
        const val = all[this.speedLevel];
        this.highScore = typeof val === 'number' ? val : parseInt(val, 10) || 0;
    }

    saveHighScore() {
        const all = this.getAllHighScores();
        const prev = typeof all[this.speedLevel] === 'number'
            ? all[this.speedLevel]
            : parseInt(all[this.speedLevel], 10) || 0;
        if (this.score > prev) {
            all[this.speedLevel] = this.score;
            this.highScore = this.score;
            this.isNewRecord = this.score > 0;
            storeSet(HIGH_SCORES_KEY, JSON.stringify(all));
        } else {
            this.highScore = prev;
            this.isNewRecord = false;
        }
    }

    start() {
        this.board.reset();
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.lastDropTime = performance.now();
        this.softDropActive = false;
        this.bag = [];
        this.clearingRows = null;
        this.clearingUntil = 0;
        this.clearingDuration = 0;
        this.pauseStarted = 0;
        this.isNewRecord = false;
        this.dropInterval = SPEED_LEVELS[this.speedLevel].drop;
        this.loadHighScore();
        this.nextPiece = this.randomPiece();
        this.state = 'playing';
        this.spawnPiece();
    }

    returnToIdle() {
        this.board.reset();
        this.currentPiece = null;
        this.nextPiece = null;
        this.currentX = 0;
        this.currentY = 0;
        this.softDropActive = false;
        this.lastDropTime = 0;
        this.clearingRows = null;
        this.clearingUntil = 0;
        this.clearingDuration = 0;
        this.pauseStarted = 0;
        this.dropInterval = SPEED_LEVELS[this.speedLevel].drop;
        this.loadHighScore();
        this.state = 'idle';
    }

    shiftPauseClock() {
        const now = performance.now();
        const delta = this.pauseStarted ? now - this.pauseStarted : 0;
        if (this.clearingUntil) this.clearingUntil += delta;
        this.lastDropTime = now;
        this.pauseStarted = 0;
    }

    pause() {
        if (this.state !== 'playing') return false;
        this.state = 'paused';
        this.pauseStarted = performance.now();
        return true;
    }

    resume() {
        if (this.state !== 'paused') return false;
        this.shiftPauseClock();
        this.state = 'playing';
        return true;
    }

    togglePause() {
        if (this.state === 'playing') {
            this.pause();
            return 'paused';
        }
        if (this.state === 'paused') {
            this.resume();
            return 'playing';
        }
        return this.state;
    }

    spawnPiece() {
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.randomPiece();
        const matrix = this.currentPiece.getMatrix();
        let minRow = matrix.length;
        for (let r = 0; r < matrix.length; r++) {
            for (let c = 0; c < matrix[r].length; c++) {
                if (matrix[r][c]) minRow = Math.min(minRow, r);
            }
        }
        const x = Math.floor(COLS / 2) - Math.floor(matrix[0].length / 2);
        const y = -minRow;
        this.currentX = x;
        this.currentY = y;
        if (this.board.isGameOver(matrix, x, y)) {
            this.state = 'gameover';
            this.currentPiece = null;
            this.saveHighScore();
            playGameOverSound();
        }
    }

    moveLeft() {
        if (this.state !== 'playing' || !this.currentPiece) return false;
        const newX = this.currentX - 1;
        if (this.board.isValidPosition(this.currentPiece.getMatrix(), newX, this.currentY)) {
            this.currentX = newX;
            return true;
        }
        return false;
    }

    moveRight() {
        if (this.state !== 'playing' || !this.currentPiece) return false;
        const newX = this.currentX + 1;
        if (this.board.isValidPosition(this.currentPiece.getMatrix(), newX, this.currentY)) {
            this.currentX = newX;
            return true;
        }
        return false;
    }

    rotate() {
        if (this.state !== 'playing' || !this.currentPiece) return false;
        const rotatedMatrix = this.currentPiece.getRotatedMatrix();
        const kicks = [0, -1, 1, -2, 2];
        for (const kick of kicks) {
            const testX = this.currentX + kick;
            if (this.board.isValidPosition(rotatedMatrix, testX, this.currentY)) {
                this.currentPiece.applyRotation();
                this.currentX = testX;
                return true;
            }
        }
        return false;
    }

    moveDown() {
        if (this.state !== 'playing' || !this.currentPiece) return false;
        const newY = this.currentY + 1;
        if (this.board.isValidPosition(this.currentPiece.getMatrix(), this.currentX, newY)) {
            this.currentY = newY;
            return true;
        }
        return false;
    }

    hardDrop() {
        if (this.state !== 'playing' || !this.currentPiece) return;
        let dropDistance = 0;
        while (this.board.isValidPosition(this.currentPiece.getMatrix(), this.currentX, this.currentY + 1)) {
            this.currentY++;
            dropDistance++;
        }
        this.score += dropDistance * 2;
        this.lockCurrent();
    }

    softDrop() {
        if (this.state !== 'playing' || !this.currentPiece) return false;
        if (this.moveDown()) {
            this.score += 1;
            this.lastDropTime = performance.now();
            return true;
        }
        return false;
    }

    update(timestamp) {
        if (this.state !== 'playing') return;
        if (!this.currentPiece && !this.clearingUntil) return;
        if (this.clearingUntil) {
            if (timestamp >= this.clearingUntil) this.finishClear(timestamp);
            return;
        }
        const effectiveInterval = this.softDropActive
            ? Math.max(50, this.dropInterval / 20)
            : this.dropInterval;
        if (timestamp - this.lastDropTime >= effectiveInterval) {
            const moved = this.moveDown();
            if (!moved) this.lockCurrent();
            this.lastDropTime = timestamp;
        }
    }

    registerClear(count) {
        if (count <= 0) return { gained: 0, levelUp: false };
        const prevLevel = this.level;
        this.lines += count;
        const gained = (SCORE_MAP[count] || 0) * this.level;
        this.score += gained;
        this.level = Math.floor(this.lines / 10) + 1;
        this.dropInterval = Math.max(
            80,
            SPEED_LEVELS[this.speedLevel].drop - (this.level - 1) * 50
        );
        return { gained, levelUp: this.level > prevLevel };
    }

    lockCurrent() {
        if (!this.currentPiece) return;
        this.board.lockPiece(
            this.currentPiece.getMatrix(),
            this.currentX,
            this.currentY,
            this.currentPiece.color
        );
        const rows = this.board.getFullRows();
        this.currentPiece = null;
        this.softDropActive = false;
        if (rows.length > 0) {
            const { gained, levelUp } = this.registerClear(rows.length);
            const dur = reducedMotion() ? 40 : (rows.length >= 4 ? 380 : 220);
            this.clearingRows = rows;
            this.clearingDuration = dur;
            this.clearingUntil = performance.now() + dur;
            playClearSound(rows.length);
            if (this.onClearStart) this.onClearStart(rows, gained, levelUp);
            return;
        }
        this.spawnPiece();
    }

    finishClear(timestamp) {
        this.board.clearLines();
        this.clearingRows = null;
        this.clearingUntil = 0;
        this.clearingDuration = 0;
        this.spawnPiece();
        this.softDropActive = false;
        this.lastDropTime = timestamp;
    }

    getGhostY() {
        if (!this.currentPiece) return this.currentY;
        let ghostY = this.currentY;
        while (this.board.isValidPosition(this.currentPiece.getMatrix(), this.currentX, ghostY + 1)) {
            ghostY++;
        }
        return ghostY;
    }

    setSoftDrop(active) {
        this.softDropActive = active;
    }
}
