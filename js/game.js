class GameScene extends Phaser.Scene {
    cloudTypes = {
        KEY: "type",
        NORMAL: 1,
        BAD: 2
    }
    
    constructor() {
        super({ key: 'Game', active: false });
    }

    init() {
        this.jumpVelocity = -1500; // Negative is up
        this.dead = false;
        this.score = 0;
        this.starScore = 0;
    }

    preload() {
        this.load.image('player-idle', 'assets/peluchin-idle.png');
        this.load.image('player-jump', 'assets/peluchin-jumping.png');
        this.load.image('platform1', 'assets/platforms/nube1-1.png');
        this.load.image('platform2', 'assets/platforms/nube2-1.png');
        this.load.image('platform3', 'assets/platforms/nube3-1.png');
        this.load.image('platform4', 'assets/platforms/nube-mala1-1.png');
        this.load.image('platform5', 'assets/platforms/nube-mala2-1.png');
        this.load.image('platform6', 'assets/platforms/nube-mala3-1.png');
    }

    create() {
        //Add Background
        this.background = this.add.image(0, 0, 'menubg');
        this.background.setDisplaySize(this.cameras.main.displayWidth, this.cameras.main.displayHeight);
        this.background.setScale(2 * this.background.scaleX, 2 * this.background.scaleY);

        //Add Player
        this.player = this.physics.add.sprite(this.cameras.main.centerX, this.cameras.main.centerY, 'player-idle').setOrigin(0.5, 1);
        this.player.setBounce(0.2);
        let _x = this.player.displayWidth * 0.2;
        let _y = this.player.displayHeight * 0.18;
        let _w = this.player.displayWidth * 0.63;
        let _h = this.player.displayHeight * 0.78;
        this.player.body.setOffset(_x, _y);
        this.player.body.setSize(_w, _h);

        //Add Platforms
        this.platforms = this.physics.add.staticGroup();
        for (let i = 0; i < 3; i++){
            let style = Phaser.Math.Between(1, 3);
            this.lastPlatformSpawn = this.cameras.main.displayHeight - 500 * (i + 1);
            let plat = this.platforms.create(this.cameras.main.centerX, this.lastPlatformSpawn, 'platform' + style);
            plat.setDisplaySize(this.cameras.main.displayWidth * 0.3, 100);
            plat.setScale(plat.scaleX, plat.scaleX);
            plat.refreshBody();
            plat.setData(this.cloudTypes.KEY, this.cloudTypes.NORMAL);

            let _x = plat.displayWidth * 0.16;
            let _y = plat.displayHeight * 0.19;
            let _w = plat.displayWidth * 0.7;
            let _h = plat.displayHeight * 0.7;
            plat.body.setOffset(_x, _y);
            plat.body.setSize(_w, _h);

            // Ajustar colisiones
            plat.body.checkCollision.top = true;
            plat.body.checkCollision.down = false;
            plat.body.checkCollision.left = false;
            plat.body.checkCollision.right = false;
        }

        //Add Stars
        this.stars = this.physics.add.staticGroup();
        this.lastStarSpawn = this.cameras.main.scrollY;

        // Collisions
        this.physics.add.collider(this.player, this.platforms, this.playerHitPlatform, null, this);
        this.physics.add.overlap(this.player, this.stars, this.playerHitStar, null, this);

        // UI
        this.createUI();

        // Camera Stuff
        this.lastUpScroll = this.cameras.main.centerY;
        this.deltaScroll = this.cameras.main.displayHeight * 0.1;
    }

    // Create UI
    createUI(){
        // Add score text
        this.scoreText = this.add.bitmapText(this.cameras.main.displayWidth * 0.05, 12, 'set-fire', "Score: " + Math.ceil(this.score));
        this.scoreText.setTintFill(0x000000);
        this.scoreText.setFontSize(this.cameras.main.displayHeight * 0.05);
        this.scoreText.setDepth(10);

        // Add stars score
        this.starScoreText = this.add.bitmapText(this.cameras.main.displayWidth * 0.95, 12, 'set-fire', "0000");
        this.starScoreText.setOrigin(4, 0);
        this.starScoreText.setTintFill(0x000000);
        this.starScoreText.setFontSize(this.cameras.main.displayHeight * 0.05);
        this.starScoreText.setDepth(10);

        this.starScoreIcon = this.add.image(this.cameras.main.displayWidth * 0.95 - (this.starScoreText.width + 30), 10, 'estrella');
        this.starScoreIcon.setOrigin(1, 0);
        this.starScoreIcon.setDisplaySize(this.cameras.main.displayHeight * 0.05, this.cameras.main.displayHeight * 0.05);
        this.starScoreIcon.setDepth(10);
        
        this.starScoreText.setText(this.starScore);

        // Add Buttons
        this.buttons = [];
        for (let i = 0; i < 2; i++){
            let btn = new ImageButton(this, this.cameras.main.displayWidth/2 * i, 0, 'transparent').setOrigin(0, 0);
            btn.setDisplaySize(this.cameras.main.displayWidth/2, this.cameras.main.displayHeight);
            btn.onPointerUp(() => { this.movePlayer(0); });
            btn.onPointerOut(() => { this.movePlayer(0); });

            this.buttons.push(btn);
            this.add.existing(btn);
        }

        this.buttons[0].onPressed((time, delta) => { this.movePlayer(-1); });
        this.buttons[1].onPressed((time, delta) => { this.movePlayer(1); });
    }

    moveUI() {
        // Move the Scores
        this.scoreText.y = this.cameras.main.scrollY + 15;
        this.starScoreIcon.y = this.cameras.main.scrollY + 10;
        this.starScoreText.y = this.cameras.main.scrollY + 15;

        // Move the buttons
        this.buttons.forEach((item, _) => { item.y = this.cameras.main.scrollY; });

        // Move the bg FOR NOW
        this.background.y = this.cameras.main.scrollY;
    }

    update(time, delta){
        if (this.dead)
            return;

        // Update Buttons
        this.buttons.forEach((item, _) => { item.update(); });
        this.updateCamera();
        this.warpPlayer();

        // Check Spawns
        this.bottomClear();
        if (this.lastPlatformSpawn > this.cameras.main.scrollY)
            this.spawnCloud();
        if (this.lastStarSpawn > this.cameras.main.scrollY)
            this.spawnStar();

        //Check Death
        if (this.player.getBounds().top > this.cameras.main.scrollY + this.cameras.main.displayHeight)
            this.gameOver();

    }

    updateCamera(){
        // Move Camera (C2 code)
        if (this.player.y < this.lastUpScroll) { // Going Up
            this.lastUpScroll = this.player.y;
            // Move the Camera
            this.cameras.main.scrollY = this.player.y - this.cameras.main.displayHeight/2;
            this.moveUI();

            // Update Score
            this.score = this.score + (this.lastUpScroll - this.cameras.main.scrollY) / 10000;
            this.scoreText.setText("Score: " + Math.ceil(this.score));
        } else if (this.player.y > this.cameras.main.centerY) { // Going Down
            let downScroll = Math.abs(this.lastUpScroll - this.player.y);
            if (downScroll < this.deltaScroll) {
                // Move the Camera
                this.cameras.main.scrollY = this.player.y - this.cameras.main.displayHeight/2;
                this.moveUI();
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
            this.player.setFlipX(dx == 1);
        }
    }

    playerHitPlatform(player, platform){
        let delta = platform.displayHeight * 0.05;
        if (platform.body.top + delta < player.body.bottom) {
            return;
        }

        player.setVelocityY(this.jumpVelocity);

        if (platform.getData(this.cloudTypes.KEY) == this.cloudTypes.BAD) {
            platform.destroy();
        }
    }

    playerHitStar(player, star) {
        star.destroy();
        player.setVelocityY(this.jumpVelocity);
        this.starScore = this.starScore + 1;
        this.starScoreText.setText(this.starScore);
    }

    spawnCloud() {
        let type = Phaser.Math.Between(1, 2);
        let style = Phaser.Math.Between(1, 3);
        this.lastPlatformSpawn = this.lastPlatformSpawn - Phaser.Math.Between(100, 600);
        let platX = Phaser.Math.Between(0, this.cameras.main.displayWidth * 0.67) + this.cameras.main.displayWidth * 0.33/2;
        let plat = this.platforms.create(platX, this.lastPlatformSpawn, 'platform' + (type * style));
        plat.setDisplaySize(this.cameras.main.displayWidth * 0.3, 100);
        plat.setScale(plat.scaleX, plat.scaleX);
        plat.refreshBody();
        plat.setData(this.cloudTypes.KEY, type);

        // Set BBox
        let _x = plat.displayWidth * 0.16;
        let _y = plat.displayHeight * 0.19;
        let _w = plat.displayWidth * 0.7;
        let _h = plat.displayHeight * 0.7;
        plat.body.setOffset(_x, _y);
        plat.body.setSize(_w, _h);

        // Adjust Collisions
        plat.body.checkCollision.top = true;
        plat.body.checkCollision.down = false;
        plat.body.checkCollision.left = false;
        plat.body.checkCollision.right = false;
    }

    spawnStar() {
        this.lastStarSpawn = this.lastStarSpawn - Phaser.Math.Between(300, 1000);
        let x = Phaser.Math.Between(0, this.cameras.main.displayWidth * 0.95) + this.cameras.main.displayWidth * 0.05/2;
        let star = this.stars.create(x, this.lastStarSpawn, 'estrella');
        star.setDisplaySize(this.cameras.main.displayWidth * 0.1, 10);
        star.setScale(star.scaleX, star.scaleX);
        star.refreshBody();
        star.setDepth(2);
    }

    bottomClear() {
        this.platforms.children.each((cloud) => {
            if (cloud.getBounds().top > this.cameras.main.scrollY + this.cameras.main.displayHeight + this.deltaScroll) {
                cloud.destroy();
            }
        });

        this.stars.children.each((star) => {
            if (star.getBounds().top > this.cameras.main.scrollY + this.cameras.main.displayHeight + this.deltaScroll) {
                star.destroy();
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
        // Hide Prev UI
        this.scoreText.setVisible(false);
        this.starScoreIcon.setVisible(false);
        this.starScoreText.setVisible(false);

        // Draw Game Over Screen
        let y = this.cameras.main.scrollY + this.cameras.main.centerY;
        let logo = new ImageButton(this, this.cameras.main.centerX, y, 'logo').setOrigin(0.5, 0.5);
        logo.setDisplaySize(this.cameras.main.displayWidth - 100, 100);
        logo.setScale(logo.scaleX);
        this.add.existing(logo);

        //logo.onPointerUp(() => { this.scene.start('MainMenu'); });
        logo.onPointerUp(() => { this.scene.start('MainMenu'); });
    }
}