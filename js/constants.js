export const COLS = 10;
export const ROWS = 20;
export const CELL_SIZE = 30;
export const PREVIEW_CELL_SIZE = 22;

export const SPEED_LEVELS = {
    slow: { drop: 1200, labelKey: 'speedSlow' },
    normal: { drop: 1000, labelKey: 'speedNormal' },
    fast: { drop: 700, labelKey: 'speedFast' },
    veryFast: { drop: 400, labelKey: 'speedVeryFast' },
    insane: { drop: 150, labelKey: 'speedInsane' }
};

export const DEFAULT_SPEED = 'normal';

export const BOARD_BGS = {
    black: { color: '#0a0a12' },
    navy: { color: '#0a1628' },
    green: { color: '#0c1a10' },
    purple: { color: '#160a1c' },
    brown: { color: '#1a120a' },
    slate: { color: '#12141a' },
    blue: { color: '#0a1420' },
    cream: { color: '#1c1a14' }
};

export const DEFAULT_BOARD_BG = 'black';

export const COLORS = {
    I: '#00f0f0',
    O: '#f0f000',
    T: '#a000f0',
    S: '#00f000',
    Z: '#f00000',
    J: '#0000f0',
    L: '#f0a000'
};

export const SHAPES = {
    I: [
        [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
        [[0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0]],
        [[0, 0, 0, 0], [0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0]],
        [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]]
    ],
    O: [
        [[1, 1], [1, 1]],
        [[1, 1], [1, 1]],
        [[1, 1], [1, 1]],
        [[1, 1], [1, 1]]
    ],
    T: [
        [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
        [[0, 1, 0], [0, 1, 1], [0, 1, 0]],
        [[0, 0, 0], [1, 1, 1], [0, 1, 0]],
        [[0, 1, 0], [1, 1, 0], [0, 1, 0]]
    ],
    S: [
        [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
        [[0, 1, 0], [0, 1, 1], [0, 0, 1]],
        [[0, 0, 0], [0, 1, 1], [1, 1, 0]],
        [[1, 0, 0], [1, 1, 0], [0, 1, 0]]
    ],
    Z: [
        [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
        [[0, 0, 1], [0, 1, 1], [0, 1, 0]],
        [[0, 0, 0], [1, 1, 0], [0, 1, 1]],
        [[0, 1, 0], [1, 1, 0], [1, 0, 0]]
    ],
    J: [
        [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
        [[0, 1, 1], [0, 1, 0], [0, 1, 0]],
        [[0, 0, 0], [1, 1, 1], [0, 0, 1]],
        [[0, 1, 0], [0, 1, 0], [1, 1, 0]]
    ],
    L: [
        [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
        [[0, 1, 0], [0, 1, 0], [0, 1, 1]],
        [[0, 0, 0], [1, 1, 1], [1, 0, 0]],
        [[1, 1, 0], [0, 1, 0], [0, 1, 0]]
    ]
};

export const PIECE_TYPES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
export const SCORE_MAP = [0, 40, 100, 300, 1200];
