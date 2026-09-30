import { playMoveSound, playRotateSound, playDropSound } from './audio.js';

export class InputHandler {
    constructor(game, isTouchDevice, onPauseToggle, onConfirm) {
        this.game = game;
        this.onPauseToggle = onPauseToggle;
        this.onConfirm = onConfirm;
        this.keys = new Set();
        this._repeatInterval = null;
        this._repeatTimeout = null;
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
        window.addEventListener('blur', this.handleBlur);
        if (isTouchDevice) this.bindTouchButtons();
    }

    handleBlur() {
        this.keys.clear();
        this.stopRepeat();
        this.game.setSoftDrop(false);
    }

    handleKeyDown(e) {
        const onControl = e.target && e.target.closest && e.target.closest('button, a, input, select, textarea');
        if (onControl && (e.code === 'Space' || e.code === 'Enter')) return;

        if (
            e.code === 'ArrowLeft' ||
            e.code === 'ArrowRight' ||
            e.code === 'ArrowDown' ||
            e.code === 'ArrowUp' ||
            e.code === 'Space'
        ) {
            e.preventDefault();
        }

        if (e.code === 'KeyP' || e.code === 'Escape') {
            e.preventDefault();
            if (this.game.isActive() && this.onPauseToggle) this.onPauseToggle();
            return;
        }

        if (e.code === 'Enter') {
            e.preventDefault();
            if (!e.repeat && this.onConfirm) this.onConfirm();
            return;
        }

        if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
            if (this.keys.has(e.code)) return;
            this.keys.add(e.code);
            this.syncHorizontal();
            return;
        }

        if (this.game.state !== 'playing') return;

        switch (e.code) {
            case 'ArrowDown':
                if (!e.repeat) this.game.setSoftDrop(true);
                if (this.game.softDrop()) playMoveSound();
                break;
            case 'ArrowUp':
            case 'KeyX':
            case 'KeyW':
                if (!e.repeat && this.game.rotate()) playRotateSound();
                break;
            case 'Space':
                if (!e.repeat) {
                    this.game.hardDrop();
                    playDropSound();
                }
                break;
            default:
                break;
        }
    }

    handleKeyUp(e) {
        if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
            this.keys.delete(e.code);
            this.syncHorizontal();
        }
        if (e.code === 'ArrowDown') {
            this.game.setSoftDrop(false);
        }
    }

    syncHorizontal() {
        this.stopRepeat();
        if (this.game.state !== 'playing') return;
        const left = this.keys.has('ArrowLeft');
        const right = this.keys.has('ArrowRight');
        if (left === right) return;
        const move = left ? () => this.game.moveLeft() : () => this.game.moveRight();
        this.startRepeat(() => {
            if (this.game.state !== 'playing') return;
            if (move()) playMoveSound();
        }, 150, 40);
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

    startRepeat(action, initialDelay = 150, interval = 40) {
        this.stopRepeat();
        action();
        this._repeatTimeout = setTimeout(() => {
            this._repeatInterval = setInterval(action, interval);
        }, initialDelay);
    }

    bindPointer(element, onStart, onEnd) {
        if (!element) return;
        let activeId = null;
        const finish = (e) => {
            if (activeId === null) return;
            if (e && e.pointerId !== undefined && e.pointerId !== activeId) return;
            activeId = null;
            window.removeEventListener('pointerup', finish);
            window.removeEventListener('pointercancel', finish);
            onEnd();
            element.blur();
        };
        const start = (e) => {
            e.preventDefault();
            if (activeId !== null) finish({ pointerId: activeId });
            activeId = e.pointerId;
            try {
                element.setPointerCapture(e.pointerId);
            } catch (_) {
            }
            window.addEventListener('pointerup', finish);
            window.addEventListener('pointercancel', finish);
            onStart();
        };
        element.addEventListener('pointerdown', start);
        element.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    bindTouchButtons() {
        const left = document.getElementById('btnLeft');
        const right = document.getElementById('btnRight');
        const down = document.getElementById('btnDown');
        const rotateBtn = document.getElementById('btnRotate');
        const drop = document.getElementById('btnHardDrop');
        const pauseTouch = document.getElementById('btnPauseTouch');

        this.bindPointer(
            left,
            () => this.startRepeat(() => {
                if (this.game.moveLeft()) playMoveSound();
            }, 150, 40),
            () => this.stopRepeat()
        );

        this.bindPointer(
            right,
            () => this.startRepeat(() => {
                if (this.game.moveRight()) playMoveSound();
            }, 150, 40),
            () => this.stopRepeat()
        );

        this.bindPointer(
            down,
            () => {
                this.game.setSoftDrop(true);
                this.startRepeat(() => {
                    if (this.game.softDrop()) playMoveSound();
                }, 70, 36);
            },
            () => {
                this.game.setSoftDrop(false);
                this.stopRepeat();
            }
        );

        this.bindPointer(
            rotateBtn,
            () => {
                if (this.game.rotate()) playRotateSound();
            },
            () => {}
        );

        this.bindPointer(
            drop,
            () => {
                if (this.game.state === 'playing') {
                    this.game.hardDrop();
                    playDropSound();
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
