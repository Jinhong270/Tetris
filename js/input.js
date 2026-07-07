export class InputHandler {
    constructor(game, isTouchDevice) {
        this.game = game;
        this.isTouch = isTouchDevice;
        this._repeatInterval = null;

        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);

        if (this.isTouch) {
            this.bindTouchButtons();
        }
    }

    handleKeyDown(e) {
        if (this.game.state !== 'playing') return;
        switch (e.code) {
            case 'ArrowLeft': 
                e.preventDefault(); 
                this.game.moveLeft(); 
                if (window.playMoveSound) window.playMoveSound();
                break;
            case 'ArrowRight': 
                e.preventDefault(); 
                this.game.moveRight(); 
                if (window.playMoveSound) window.playMoveSound();
                break;
            case 'ArrowDown':
                e.preventDefault();
                if (!e.repeat) this.game.setSoftDrop(true);
                this.game.softDrop();
                if (window.playMoveSound) window.playMoveSound();
                break;
            case 'ArrowUp':
                e.preventDefault();
                if (!e.repeat) this.game.rotate();
                if (window.playRotateSound) window.playRotateSound();
                break;
            case 'Space':
                e.preventDefault();
                if (!e.repeat) this.game.hardDrop();
                if (window.playDropSound) window.playDropSound();
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
        if (this._repeatInterval) {
            clearInterval(this._repeatInterval);
            this._repeatInterval = null;
        }
    }

    bindTouchButtons() {
        const left = document.getElementById('btnLeft');
        const right = document.getElementById('btnRight');
        const down = document.getElementById('btnDown');
        const rotateBtn = document.getElementById('btnRotate');
        const drop = document.getElementById('btnDrop');

        const startRepeat = (action) => {
            this.stopRepeat();
            action();
            this._repeatInterval = setInterval(() => {
                if (this.game.state === 'playing') action();
            }, 50);
        };

        const bindButton = (element, startAction, endAction) => {
            element.addEventListener('touchstart', (e) => {
                e.preventDefault();
                startAction();
            });
            element.addEventListener('touchend', (e) => {
                e.preventDefault();
                endAction();
            });
            element.addEventListener('touchcancel', (e) => {
                e.preventDefault();
                endAction();
            });
        };

        bindButton(left, () => startRepeat(() => { this.game.moveLeft(); if (window.playMoveSound) window.playMoveSound(); }), () => this.stopRepeat());
        bindButton(right, () => startRepeat(() => { this.game.moveRight(); if (window.playMoveSound) window.playMoveSound(); }), () => this.stopRepeat());
        
        bindButton(down, 
            () => {
                this.game.setSoftDrop(true);
                startRepeat(() => { this.game.softDrop(); if (window.playMoveSound) window.playMoveSound(); });
            },
            () => {
                this.game.setSoftDrop(false);
                this.stopRepeat();
            }
        );

        rotateBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.game.state === 'playing') {
                this.game.rotate();
                if (window.playRotateSound) window.playRotateSound();
            }
        });

        drop.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.game.state === 'playing') {
                this.game.hardDrop();
                if (window.playDropSound) window.playDropSound();
            }
        });
    }
}
