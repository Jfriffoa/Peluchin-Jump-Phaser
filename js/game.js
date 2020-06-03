class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Game', active: false });
    }

    preload() {
        this.load.image('player-idle', 'assets/peluchin-idle.png');
        this.load.image('player-jump', 'assets/peluchin-jumping.png');
        this.load.image('platform', 'assets/nube1-1.png');
    }

    create() {
        //Add Background
        this.background = this.add.image(0, 0, 'menubg');
        this.background.setDisplaySize(this.cameras.main.displayWidth, this.cameras.main.displayHeight);
        this.background.setScale(2 * this.background.scaleX, 2 * this.background.scaleY);

        //Add Player
        this.player = this.physics.add.sprite(this.cameras.main.centerX, this.cameras.main.centerY, 'player-idle').setOrigin(0.5, 1);
        this.player.setBounce(0.2);
        //this.player.setCollideWorldBounds(true);

        //Add Platforms
        this.platforms = this.physics.add.staticGroup();
        for (let i = 0; i < 3; i++){
            let plat = this.platforms.create(this.cameras.main.centerX, this.cameras.main.displayHeight - 500 * (i + 1), 'platform');
            plat.setDisplaySize(this.cameras.main.displayWidth * 0.3, 100);
            plat.setScale(plat.scaleX, plat.scaleX);
            plat.refreshBody();

            // console.log(plat);
            // Ajustar colisiones
            plat.body.checkCollision.top = true;
            plat.body.checkCollision.down = false;
            plat.body.checkCollision.left = false;
            plat.body.checkCollision.right = false;
        }

        // Collisions
        this.physics.add.collider(this.player, this.platforms, this.playerHitPlatform, null, this);

        // UI
        this.createUI();
    }

    // Create UI
    createUI(){
        // Add Buttons
        this.buttons = [];
        for (let i = 0; i < 2; i++){
            let btn = new ImageButton(this, this.cameras.main.displayWidth/2 * i, 0, 'transparent').setOrigin(0, 0);
            btn.setDisplaySize(this.cameras.main.displayWidth/2, this.cameras.main.displayHeight);
            btn.onPointerUp(() => { this.movePlayer(0); });
            btn.onPointerOut(() => { this.movePlayer(0); });

            this.buttons.push(btn);
            this.add.existing(btn);

            //console.log(btn);
        }

        this.buttons[0].onPressed((time, delta) => { this.movePlayer(-1); });
        this.buttons[1].onPressed((time, delta) => { this.movePlayer(1); });
    }

    update(time, delta){
        // Update Buttons
        this.buttons.forEach((item, _) => { item.update(); });
    }

    movePlayer(dx){
        console.log("moving " + dx);
        let velocity = this.cameras.main.displayWidth * 0.3;
        this.player.setVelocityX(velocity * dx);

        if (dx != 0) {
            this.player.setFlipX(dx == -1);
        }
    }

    playerHitPlatform(player, platform){
        if (platform.y < player.y)
            return;

        console.log("platform collided");
        // console.log(platform);
        player.setVelocityY(-300);
    }
}