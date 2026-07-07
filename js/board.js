import { COLS, ROWS } from './constants.js';

export class Board {
    constructor() {
        this.grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    }

    reset() {
        this.grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    }

    isValidPosition(matrix, x, y) {
        for (let r = 0; r < matrix.length; r++) {
            for (let c = 0; c < matrix[r].length; c++) {
                if (!matrix[r][c]) continue;
                const boardCol = x + c;
                const boardRow = y + r;
                if (boardRow < 0) continue;
                if (boardCol < 0 || boardCol >= COLS || boardRow >= ROWS) return false;
                if (this.grid[boardRow][boardCol] !== 0) return false;
            }
        }
        return true;
    }

    lockPiece(matrix, x, y, color) {
        for (let r = 0; r < matrix.length; r++) {
            for (let c = 0; c < matrix[r].length; c++) {
                if (!matrix[r][c]) continue;
                const boardCol = x + c;
                const boardRow = y + r;
                if (boardRow < 0 || boardRow >= ROWS || boardCol < 0 || boardCol >= COLS) continue;
                this.grid[boardRow][boardCol] = color;
            }
        }
    }

    clearLines() {
        let linesCleared = 0;
        for (let row = ROWS - 1; row >= 0; row--) {
            if (this.grid[row].every(cell => cell !== 0)) {
                this.grid.splice(row, 1);
                this.grid.unshift(new Array(COLS).fill(0));
                row++;
                linesCleared++;
            }
        }
        return linesCleared;
    }

    isGameOver(matrix, x, y) {
        return !this.isValidPosition(matrix, x, y);
    }
}
