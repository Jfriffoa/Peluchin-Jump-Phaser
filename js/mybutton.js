class ImageButton extends Phaser.GameObjects.Image {
    #onPressed = null;

    constructor(scene, x, y, texture, onPressed = null) {
        super(scene, x, y, texture);
        this.setInteractive();

        this.isDown = false;
        this.#onPressed = onPressed;

        this.on('pointerdown', () => { this.isDown = true; });
        this.on('pointerup',   () => { this.isDown = false; });
        this.on('pointerout',  () => { this.isDown = false; });
    }

    onPointerOver(callback) {
        this.on('pointerover', callback);
    }

    onPointerOut(callback) {
        this.on('pointerout', callback);
    }

    onPointerDown(callback) {
        this.on('pointerdown', callback);
    }

    onPointerUp(callback) {
        this.on('pointerup', callback);
    }

    onPressed(callback) {
        this.#onPressed = callback;
    }

    update(time, delta){
        if (this.#onPressed != null && this.isDown){
            this.#onPressed(time, delta);
        }
    }
}