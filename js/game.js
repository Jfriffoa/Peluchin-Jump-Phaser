class GameScene extends Phaser.Scene {
    cloudTypes = {
        KEY: "type",
        NORMAL: 1,
        BAD: 2
    }
    
    constructor() {
        super({ key: 'Game', active: false });
    }

    init(data) {
        this.jumpVelocity = -1500; // Negative is up
        this.dead = false;
        this.score = 0;
        this.starScore = 0;

        if (data) {
            this.scoreLeaderboard = data.scoreLeaderboard;
            this.starsLeaderboard = data.starsLeaderboard;
        } else {
            this.scoreLeaderboard = undefined;
            this.starsLeaderboard = undefined;
        }
    }

    preload() {
        this.load.image('box', 'assets/color.jpg')
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
        // Load Leaderboards
        if (this.scoreLeaderboard === undefined) {
            console.log("Load Scores");
            this.facebook.getLeaderboard('Distance');
        }

        if (this.starsLeaderboard === undefined) {
            console.log("Load Stars");
            this.facebook.getLeaderboard('Stars');
        }

        this.facebook.on('getleaderboard', (leaderboard) => {
            switch(leaderboard.name){
                case 'Distance':
                    this.scoreLeaderboard = leaderboard;
                    this.scoreLeaderboard.getPlayerScore();
                    break;
                case 'Stars':
                    this.starsLeaderboard = leaderboard;
                    this.starsLeaderboard.getPlayerScore();
                    break;
            }
            console.log("Leaderboard Loaded: " + leaderboard.name);
        });

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
        let plat = this.platforms.create(platX, this.lastPlatformSpawn, 'platform' + ((type - 1) * 3 + style));
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

        // Save Scores
        this.newHighScore = (this.starsLeaderboard.playerScore < this.starScore || this.scoreLeaderboard.playerScore < this.score);
        this.starsLeaderboard.setScore(this.starScore);
        this.scoreLeaderboard.setScore(Math.ceil(this.score));

        // Show UI
        this.showGameOverScreen();
    }

    showGameOverScreen(){
        ///////////////////////////////////////////////////////////////////////
        // Hide Prev UI
        this.scoreText.setVisible(false);
        this.starScoreIcon.setVisible(false);
        this.starScoreText.setVisible(false);

        ///////////////////////////////////////////////////////////////////////
        // Draw Game Over Screen
        let screenRect = new Phaser.Geom.Rectangle(this.cameras.main.x, this.cameras.main.scrollY, this.cameras.main.displayWidth, this.cameras.main.displayHeight);
        let bg = this.add.image(screenRect.x, screenRect.y, 'box');
        bg.setDisplaySize(screenRect.width * 2, screenRect.height * 2);
        bg.setTintFill(0x000000);
        bg.setAlpha(0.5);
        bg.setDepth(5);

        ///////////////////////////////////////////////////////////////////////
        // Top Zone
        let topZoneHeight = screenRect.height * 0.3;
        let topZonePadding = [30, 0, 0, 0];          // Top, Left, Right, Bottom
        
        // Add Text
        let topText = this.add.bitmapText(screenRect.centerX, screenRect.y + topZonePadding[0], 'set-fire', (this.newHighScore) ? 'NEW\nHIGHSCORE' : 'GAME\nOVER');
        topText.setCenterAlign();
        topText.setTintFill(0xffffff);
        topText.setFontSize((topZoneHeight - (topZonePadding[0] + topZonePadding[3]))/2);
        topText.setX((screenRect.width - topText.width - topZonePadding[1] - topZonePadding[2]) / 2 + topZonePadding[1]);
        topText.setDepth(10);
        
        // Add Shadow
        let topTextShadow = this.add.bitmapText(screenRect.centerX, screenRect.y + topZonePadding[0], 'set-fire', (this.newHighScore) ? 'NEW\nHIGHSCORE' : 'GAME\nOVER');
        topTextShadow.setCenterAlign();
        topTextShadow.setTintFill(0x000000);
        topTextShadow.setFontSize((topZoneHeight - (topZonePadding[0] + topZonePadding[3]))/2 + 5);
        topTextShadow.setX((screenRect.width - topTextShadow.width - topZonePadding[1] - topZonePadding[2]) / 2 + 5 + topZonePadding[1]);
        topTextShadow.setDepth(9);
        
        ///////////////////////////////////////////////////////////////////////
        // Middle Zone
        let midZoneHeight = screenRect.height * 0.13;
        let midZonePadding = [0, 0, 0, 0];          // Top, Left, Right, Bottom
        let midZoneSpacing = 0;
        let midZoneRect = new Phaser.Geom.Rectangle(screenRect.x, screenRect.centerY - midZoneHeight/2, screenRect.width, midZoneHeight);
        // let r = this.add.image(midZoneRect.x, midZoneRect.y, null);
        // r.setOrigin(0, 0);
        // r.setDisplaySize(midZoneRect.width, midZoneRect.height);

        // Add Score Text
        let endScoreText = this.add.bitmapText(midZoneRect.centerX, midZoneRect.y + midZonePadding[0], 'set-fire', 'Score: 999999');
        endScoreText.setOrigin(0, 0);
        endScoreText.setTintFill(0xffffff);
        endScoreText.setFontSize((midZoneRect.height - (midZoneSpacing + midZonePadding[0] + midZonePadding[3]))/2);
        endScoreText.setX((midZoneRect.width - endScoreText.width - midZonePadding[1] - midZonePadding[2]) / 2 + midZonePadding[1]);
        endScoreText.setDepth(10);
        endScoreText.setText("Score: " + Math.ceil(this.score));
        // endScoreText.setText("Score");
        // console.log(endScoreText);

        // Add Icon
        let starsIcon = this.add.image(midZoneRect.centerX / 2, midZoneRect.bottom + midZonePadding[3], 'estrella');
        let iconSize = (midZoneRect.height - midZoneSpacing - midZonePadding[3] - midZonePadding[3]) / 2;
        starsIcon.setOrigin(0, 1);
        starsIcon.setDisplaySize(iconSize, iconSize);
        starsIcon.setDepth(10);

        // Add Star Score
        let endStarScoreText = this.add.bitmapText(midZoneRect.centerX - midZoneRect.width * 0.075, starsIcon.y - starsIcon.displayHeight, 'set-fire', ': 999');
        endStarScoreText.setOrigin(0, 0);
        endStarScoreText.setTintFill(0xffffff);
        endStarScoreText.setFontSize((midZoneRect.height - midZoneSpacing - midZonePadding[0] - midZonePadding[3]) / 2);
        endStarScoreText.setDepth(10);
        endStarScoreText.setText(": " + this.starScore);

        ///////////////////////////////////////////////////////////////////////
        // Bottom Zone
        let botZoneHeight = screenRect.height * 0.2;
        let botZonePadding = [0, 0, 0, 90];         // Top, Left, Right, Bottom
        let botZoneSpacing = [40, 20];              // X, Y

        // Add Buttons
        let buttons = [];
        let buttonsText = ["Play Again", "Main Menu"];
        let buttonsWidth = screenRect.width * 0.6;
        let buttonsHeight = botZoneHeight - (botZonePadding[0] + botZonePadding[3] + botZoneSpacing[1] * 1);
        for (let i = 0; i < 2; i++){
            let y = (screenRect.bottom - botZoneHeight) + botZonePadding[0] + botZoneSpacing[1] * i + buttonsHeight * i / 2;
            let btn = new ImageButton(this, 0, y, 'transparent');
            btn.setDisplaySize(100, buttonsHeight/2);
            btn.setScale(btn.scaleY * 4, btn.scaleY);
            btn.setX((screenRect.width - btn.displayWidth - botZonePadding[1] - botZonePadding[2]) / 2 + botZonePadding[1]);
            btn.setOrigin(0, 0);
            btn.setDepth(10);
            buttons.push(btn);
            this.add.existing(btn);

            // Add Icon
            let icon = this.add.image(btn.x, btn.y, 'estrella');
            icon.setOrigin(0, 0);
            icon.setDisplaySize(btn.displayHeight, btn.displayHeight);
            icon.setDepth(11);

            // Add Text
            let x = icon.x + icon.displayWidth + botZoneSpacing[0];
            y = icon.y + icon.displayHeight / 2;
            let text = this.add.bitmapText(x, y, 'set-fire', buttonsText[i]);
            text.setFontSize(icon.displayHeight * 0.8);
            text.setOrigin(0, 0.5);
            text.setTintFill(0xffffff);
            text.setDepth(11);
        }

        // Set Behaviour
        buttons[0].onPointerUp(() => {
            this.scene.start('Game', {
                'scoreLeaderboard': this.scoreLeaderboard,
                'starsLeaderboard': this.starsLeaderboard
            });
        });
        buttons[1].onPointerUp(() => { this.scene.start('MainMenu'); });
    }
}