import { Board } from './board.js';
import { Piece } from './piece.js';
import { PIECE_TYPES, COLS, ROWS } from './constants.js';

const SCORE_MAP = [0, 100, 300, 500, 800];

export class Game {
    constructor() {
        this.board = new Board();
        this.currentPiece = null;
        this.nextPiece = null;
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.state = 'idle';
        this.dropInterval = 1000;
        this.lastDropTime = 0;
        this.softDropActive = false;
    }

    randomPiece() {
        const type = PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)];
        return new Piece(type);
    }

    start() {
        this.board.reset();
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.dropInterval = 1000;
        this.lastDropTime = 0;
        this.softDropActive = false;
        this.nextPiece = this.randomPiece();
        this.spawnPiece();
        this.state = 'playing';
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
        }
    }

    moveLeft() {
        if (this.state !== 'playing' || !this.currentPiece) return;
        const newX = this.currentX - 1;
        if (this.board.isValidPosition(this.currentPiece.getMatrix(), newX, this.currentY)) {
            this.currentX = newX;
        }
    }

    moveRight() {
        if (this.state !== 'playing' || !this.currentPiece) return;
        const newX = this.currentX + 1;
        if (this.board.isValidPosition(this.currentPiece.getMatrix(), newX, this.currentY)) {
            this.currentX = newX;
        }
    }

    rotate() {
        if (this.state !== 'playing' || !this.currentPiece) return;
        const rotatedMatrix = this.currentPiece.getRotatedMatrix();
        let testX = this.currentX;
        if (this.board.isValidPosition(rotatedMatrix, testX, this.currentY)) {
            this.currentPiece.applyRotation();
            this.currentX = testX;
            return;
        }
        testX = this.currentX - 1;
        if (this.board.isValidPosition(rotatedMatrix, testX, this.currentY)) {
            this.currentPiece.applyRotation();
            this.currentX = testX;
            return;
        }
        testX = this.currentX + 1;
        if (this.board.isValidPosition(rotatedMatrix, testX, this.currentY)) {
            this.currentPiece.applyRotation();
            this.currentX = testX;
        }
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
        const effectiveInterval = this.softDropActive ? Math.max(50, this.dropInterval / 20) : this.dropInterval;
        if (timestamp - this.lastDropTime >= effectiveInterval) {
            const moved = this.moveDown();
            if (!moved) this.lockCurrent();
            this.lastDropTime = timestamp;
        }
    }

    lockCurrent() {
        if (!this.currentPiece) return;
        this.board.lockPiece(this.currentPiece.getMatrix(), this.currentX, this.currentY, this.currentPiece.color);
        const cleared = this.board.clearLines();
        if (cleared > 0) {
            this.lines += cleared;
            this.score += SCORE_MAP[cleared] * this.level;
            this.level = Math.floor(this.lines / 10) + 1;
            this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 80);
        }
        this.spawnPiece();
        this.softDropActive = false;
    }

    getGhostY() {
        if (!this.currentPiece) return this.currentY;
        let ghostY = this.currentY;
        while (this.board.isValidPosition(this.currentPiece.getMatrix(), this.currentX, ghostY + 1)) ghostY++;
        return ghostY;
    }

    setSoftDrop(active) {
        this.softDropActive = active;
    }
}
