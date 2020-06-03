
class GameScene extends Phaser.Scene {
    #player;
    #btns = [];

    constructor() {
        super({
            key: 'Game',
            active: false
        });
    }

    // Load Assets here?
    preload() {
        this.load.image('sky', 'assets/sky.png');
    }

    create() {
        let centerX = this.cameras.main.worldView.x + this.cameras.main.worldView.width / 2;

        // Background
        this.add.image(400, 300, 'sky');

        this.#player = this.physics.add.sprite(centerX, 450, 'player-idle');
        this.#player.setBounce(0.2);
        this.#player.setCollideWorldBounds(true);

        // Add Buttons
        let btn1 = new ImageButton(this, 100, 100, this.make.renderTexture(100, 100));
        btn1.onPressed((time, delta) => {
            this.movePlayer(-1);
        });
        this.add.existing(btn1);
        this.#btns.push(btn1);

        let btn2 = new ImageButton(this, 300, 100, this.make.renderTexture(100, 100));
        btn2.onPressed((time, delta) => {
            this.movePlayer(1);
        });
        this.add.existing(btn2);
        this.#btns.push(btn2);

        this.#btns.forEach((item, idx) => {
            item.onPointerUp( () => { this.movePlayer(0) });
        });
    }

    update(time, delta){
        this.#btns.forEach((item, idx) => {
            item.update();
        });
    }

    movePlayer(dx){
        let velocity = 100;
        this.#player.setVelocityX(velocity * dx);
    }
}