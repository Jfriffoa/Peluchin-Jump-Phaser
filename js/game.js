class GameScene extends Phaser.Scene {
    velocityY = -900;
    following = false;
    dead = false;

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
        for (let i = 0; i < 10; i++){
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

        // Camera Stuff
        this.lastUpScroll = this.cameras.main.centerY;
        this.deltaScroll = this.cameras.main.displayHeight * 0.1;
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
        if (this.dead)
            return;

        // Update Buttons
        this.buttons.forEach((item, _) => { item.update(); });
        this.updateCamera();
        this.warpPlayer();

        //Check Death
        if (this.player.getBounds().top > this.cameras.main.scrollY + this.cameras.main.displayHeight)
            this.gameOver();

        this.clearClouds();
    }

    updateCamera(){
        // Move Camera (C2 code)
        if (this.player.y < this.lastUpScroll) { // Going Up
            this.lastUpScroll = this.player.y;
            // Move the Camera
            this.cameras.main.scrollY = this.player.y - this.cameras.main.displayHeight/2;
            // Move the buttons as well
            this.buttons.forEach((item, _) => { item.y = this.cameras.main.scrollY; });
            // Move the bg FOR NOW
            this.background.y = this.cameras.main.scrollY;
        } else if (this.player.y > this.cameras.main.centerY) { // Going Down
            let downScroll = Math.abs(this.lastUpScroll - this.player.y);
            if (downScroll < this.deltaScroll) {
                // Move the Camera
                this.cameras.main.scrollY = this.player.y - this.cameras.main.displayHeight/2;
                // Move the buttons as well
                this.buttons.forEach((item, _) => { item.y = this.cameras.main.scrollY; });
                // Move the bg FOR NOW
                this.background.y = this.cameras.main.scrollY;
            }
        }

        //console.log("Camera down? " + this.player.y + " > " + this.cameras.main.centerY + " | " + this.lastUpScroll);
    }

    warpPlayer(){
        //Warp Left
        if (this.player.x < this.cameras.main.scrollX){
            this.player.x = this.cameras.main.scrollX + this.cameras.main.displayWidth;
        }

        //Warp Right
        if (this.player.x > this.cameras.main.scrollX + this.cameras.main.displayWidth){
            this.player.x = this.cameras.main.scrollX;
        }

    }

    movePlayer(dx){
        let velocity = this.cameras.main.displayWidth * 0.3;
        this.player.setVelocityX(velocity * dx);

        if (dx != 0) {
            this.player.setFlipX(dx == -1);
        }
    }

    playerHitPlatform(player, platform){
        if (platform.getBounds().top < player.getBounds().bottom) {
            return;
        }

        player.setVelocityY(this.velocityY);
    }

    clearClouds() {
        this.platforms.children.each((cloud) => {
            if (cloud.getBounds().top > this.cameras.main.scrollY + this.cameras.main.displayHeight + this.deltaScroll) {
                cloud.destroy();
            }
        });
    }

    gameOver() {
        this.dead = true;
        console.log("GAME OVER");

        this.player.disableBody(true, true);
        this.showGameOverScreen();
    }

    showGameOverScreen(){
        let y = this.cameras.main.scrollY + this.cameras.main.centerY;
        let logo = this.add.image(this.cameras.main.centerX, y, 'logo').setOrigin(0.5, 0.5);
        logo.setDisplaySize(this.cameras.main.displayWidth - 100, 100);
        logo.setScale(logo.scaleX);
    }
}