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
            case 'ArrowLeft': e.preventDefault(); this.game.moveLeft(); break;
            case 'ArrowRight': e.preventDefault(); this.game.moveRight(); break;
            case 'ArrowDown':
                e.preventDefault();
                if (!e.repeat) this.game.setSoftDrop(true);
                this.game.softDrop();
                break;
            case 'ArrowUp':
                e.preventDefault();
                if (!e.repeat) this.game.rotate();
                break;
            case 'Space':
                e.preventDefault();
                if (!e.repeat) this.game.hardDrop();
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

        left.addEventListener('touchstart', (e) => {
            e.preventDefault();
            startRepeat(() => this.game.moveLeft());
        });
        left.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.stopRepeat();
        });
        left.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            this.stopRepeat();
        });

        right.addEventListener('touchstart', (e) => {
            e.preventDefault();
            startRepeat(() => this.game.moveRight());
        });
        right.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.stopRepeat();
        });
        right.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            this.stopRepeat();
        });

        down.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.game.setSoftDrop(true);
            startRepeat(() => this.game.softDrop());
        });
        down.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.game.setSoftDrop(false);
            this.stopRepeat();
        });
        down.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            this.game.setSoftDrop(false);
            this.stopRepeat();
        });

        rotateBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.game.state === 'playing') this.game.rotate();
        });

        drop.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.game.state === 'playing') this.game.hardDrop();
        });
    }
}
