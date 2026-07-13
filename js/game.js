import { Board } from './board.js';
import { Piece } from './piece.js';
import { PIECE_TYPES, COLS, SPEED_LEVELS, DEFAULT_SPEED, SCORE_MAP } from './constants.js';

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
        this.loadHighScore();
    }

    isActive() {
        return this.state === 'playing' || this.state === 'paused';
    }

    canChangeSpeed() {
        return this.state === 'idle' || this.state === 'gameover';
    }

    randomPiece() {
        const type = PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)];
        return new Piece(type);
    }

    setSpeedLevel(level) {
        if (!SPEED_LEVELS[level]) return false;
        if (!this.canChangeSpeed()) return false;
        this.speedLevel = level;
        this.dropInterval = SPEED_LEVELS[level].drop;
        localStorage.setItem('tetrisSpeed', level);
        return true;
    }

    loadSpeedLevel() {
        const saved = localStorage.getItem('tetrisSpeed');
        if (saved && SPEED_LEVELS[saved]) {
            this.speedLevel = saved;
            this.dropInterval = SPEED_LEVELS[saved].drop;
        }
    }

    loadHighScore() {
        const saved = localStorage.getItem('tetrisHighScore');
        this.highScore = saved ? parseInt(saved, 10) : 0;
    }

    saveHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('tetrisHighScore', String(this.highScore));
        }
    }

    start() {
        this.board.reset();
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.lastDropTime = performance.now();
        this.softDropActive = false;
        this.dropInterval = SPEED_LEVELS[this.speedLevel].drop;
        this.nextPiece = this.randomPiece();
        this.state = 'playing';
        this.spawnPiece();
    }

    pause() {
        if (this.state === 'playing') {
            this.state = 'paused';
            return true;
        }
        return false;
    }

    resume() {
        if (this.state === 'paused') {
            this.state = 'playing';
            this.lastDropTime = performance.now();
            return true;
        }
        return false;
    }

    togglePause() {
        if (this.state === 'playing') {
            this.state = 'paused';
            return 'paused';
        }
        if (this.state === 'paused') {
            this.state = 'playing';
            this.lastDropTime = performance.now();
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
            if (window.playGameOverSound) window.playGameOverSound();
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
        if (this.state !== 'playing' || !this.currentPiece) return;
        if (this.moveDown()) {
            this.score += 1;
            this.lastDropTime = performance.now();
        }
    }

    update(timestamp) {
        if (this.state !== 'playing' || !this.currentPiece) return;
        const effectiveInterval = this.softDropActive
            ? Math.max(50, this.dropInterval / 20)
            : this.dropInterval;
        if (timestamp - this.lastDropTime >= effectiveInterval) {
            const moved = this.moveDown();
            if (!moved) this.lockCurrent();
            this.lastDropTime = timestamp;
        }
    }

    lockCurrent() {
        if (!this.currentPiece) return;
        this.board.lockPiece(
            this.currentPiece.getMatrix(),
            this.currentX,
            this.currentY,
            this.currentPiece.color
        );
        const cleared = this.board.clearLines();
        if (cleared > 0) {
            this.lines += cleared;
            this.score += SCORE_MAP[cleared] * this.level;
            this.level = Math.floor(this.lines / 10) + 1;
            this.dropInterval = Math.max(
                80,
                SPEED_LEVELS[this.speedLevel].drop - (this.level - 1) * 50
            );
            if (window.playClearSound) window.playClearSound(cleared);
        }
        this.spawnPiece();
        this.softDropActive = false;
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
