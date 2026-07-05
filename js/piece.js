import { SHAPES, COLORS } from './constants.js';

export class Piece {
    constructor(type) {
        this.type = type;
        this.rotation = 0;
        this.matrix = SHAPES[type][0];
        this.color = COLORS[type];
    }

    getMatrix() {
        return this.matrix;
    }

    getRotatedMatrix() {
        const newRotation = (this.rotation + 1) % 4;
        return SHAPES[this.type][newRotation];
    }

    applyRotation() {
        this.rotation = (this.rotation + 1) % 4;
        this.matrix = SHAPES[this.type][this.rotation];
    }

    clone() {
        const cloned = new Piece(this.type);
        cloned.rotation = this.rotation;
        cloned.matrix = this.matrix;
        cloned.color = this.color;
        return cloned;
    }
}
