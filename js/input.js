export class InputHandler {
    constructor(game, isTouchDevice, onPauseToggle) {
        this.game = game;
        this.isTouch = isTouchDevice;
        this.onPauseToggle = onPauseToggle;
        this._repeatInterval = null;
        this._repeatTimeout = null;
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
        if (this.isTouch) {
            this.bindTouchButtons();
        }
    }

    handleKeyDown(e) {
        if (e.code === 'KeyP' || e.code === 'Escape') {
            e.preventDefault();
            if (this.game.isActive() && this.onPauseToggle) {
                this.onPauseToggle();
            }
            return;
        }
        if (this.game.state !== 'playing') return;
        switch (e.code) {
            case 'ArrowLeft':
                e.preventDefault();
                if (this.game.moveLeft() && window.playMoveSound) window.playMoveSound();
                break;
            case 'ArrowRight':
                e.preventDefault();
                if (this.game.moveRight() && window.playMoveSound) window.playMoveSound();
                break;
            case 'ArrowDown':
                e.preventDefault();
                if (!e.repeat) this.game.setSoftDrop(true);
                this.game.softDrop();
                if (window.playMoveSound) window.playMoveSound();
                break;
            case 'ArrowUp':
            case 'KeyX':
            case 'KeyW':
                e.preventDefault();
                if (!e.repeat && this.game.rotate() && window.playRotateSound) {
                    window.playRotateSound();
                }
                break;
            case 'Space':
                e.preventDefault();
                if (!e.repeat) {
                    this.game.hardDrop();
                    if (window.playDropSound) window.playDropSound();
                }
                break;
            default:
                break;
        }
    }

    handleKeyUp(e) {
        if (e.code === 'ArrowDown') {
            e.preventDefault();
            this.game.setSoftDrop(false);
        }
    }

    stopRepeat() {
        if (this._repeatTimeout) {
            clearTimeout(this._repeatTimeout);
            this._repeatTimeout = null;
        }
        if (this._repeatInterval) {
            clearInterval(this._repeatInterval);
            this._repeatInterval = null;
        }
    }

    startRepeat(action, initialDelay = 160, interval = 55) {
        this.stopRepeat();
        action();
        this._repeatTimeout = setTimeout(() => {
            this._repeatInterval = setInterval(() => {
                if (this.game.state !== 'playing') {
                    this.stopRepeat();
                    return;
                }
                action();
            }, interval);
        }, initialDelay);
    }

    bindPointer(element, onStart, onEnd) {
        if (!element) return;
        const start = (e) => {
            e.preventDefault();
            onStart();
        };
        const end = (e) => {
            e.preventDefault();
            onEnd();
        };
        element.addEventListener('pointerdown', start);
        element.addEventListener('pointerup', end);
        element.addEventListener('pointerleave', end);
        element.addEventListener('pointercancel', end);
        element.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    bindTouchButtons() {
        const left = document.getElementById('btnLeft');
        const right = document.getElementById('btnRight');
        const down = document.getElementById('btnDown');
        const rotateBtn = document.getElementById('btnRotate');
        const drop = document.getElementById('btnHardDrop') || document.getElementById('btnDrop');
        const pauseTouch = document.getElementById('btnPauseTouch');

        this.bindPointer(
            left,
            () => this.startRepeat(() => {
                if (this.game.moveLeft() && window.playMoveSound) window.playMoveSound();
            }),
            () => this.stopRepeat()
        );

        this.bindPointer(
            right,
            () => this.startRepeat(() => {
                if (this.game.moveRight() && window.playMoveSound) window.playMoveSound();
            }),
            () => this.stopRepeat()
        );

        this.bindPointer(
            down,
            () => {
                this.game.setSoftDrop(true);
                this.startRepeat(() => {
                    this.game.softDrop();
                    if (window.playMoveSound) window.playMoveSound();
                }, 80, 40);
            },
            () => {
                this.game.setSoftDrop(false);
                this.stopRepeat();
            }
        );

        this.bindPointer(
            rotateBtn,
            () => {
                if (this.game.state === 'playing' && this.game.rotate() && window.playRotateSound) {
                    window.playRotateSound();
                }
            },
            () => {}
        );

        this.bindPointer(
            drop,
            () => {
                if (this.game.state === 'playing') {
                    this.game.hardDrop();
                    if (window.playDropSound) window.playDropSound();
                }
            },
            () => {}
        );

        this.bindPointer(
            pauseTouch,
            () => {
                if (this.game.isActive() && this.onPauseToggle) this.onPauseToggle();
            },
            () => {}
        );
    }
}
