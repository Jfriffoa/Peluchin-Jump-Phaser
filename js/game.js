///////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////
class GameScene extends Phaser.Scene {
    cloudTypes = {
        KEY: "type",
        NORMAL: 1,
        BAD: 2
    }

    difficult = {   // Represented by max "height", or the maximum score
        VERY_EASY: 150,
        EASY: 350,
        NORMAL: 700,
        HARD: 1000,
        VERY_HARD: 100000
    }
    
    constructor() {
        super({ key: 'Game', active: false });
    }

    init(data) {
        this.jumpVelocity = this.physics.world.gravity.y * -1.25; // Negative is up - Old was 1500
        this.dead = false;
        this.score = 0;
        this.starScore = 0;
        this.actualDifficult = this.difficult.VERY_EASY;

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
        this.load.image('platform1-2', 'assets/platforms/nube1-2.png');
        this.load.image('platform1-3', 'assets/platforms/nube1-3.png');
        this.load.image('platform2', 'assets/platforms/nube2-1.png');
        this.load.image('platform2-2', 'assets/platforms/nube2-2.png');
        this.load.image('platform2-3', 'assets/platforms/nube2-3.png');
        this.load.image('platform3', 'assets/platforms/nube3-1.png');
        this.load.image('platform3-2', 'assets/platforms/nube3-2.png');
        this.load.image('platform3-3', 'assets/platforms/nube3-3.png');
        this.load.image('platform4', 'assets/platforms/nube-mala1-1.png');
        this.load.image('platform4-2', 'assets/platforms/nube-mala1-2.png');
        this.load.image('platform4-3', 'assets/platforms/nube-mala1-3.png');
        this.load.image('platform5', 'assets/platforms/nube-mala2-1.png');
        this.load.image('platform5-2', 'assets/platforms/nube-mala2-2.png');
        this.load.image('platform5-3', 'assets/platforms/nube-mala2-3.png');
        this.load.image('platform6', 'assets/platforms/nube-mala3-1.png');
        this.load.image('platform6-2', 'assets/platforms/nube-mala3-2.png');
        this.load.image('platform6-3', 'assets/platforms/nube-mala3-3.png');
    }

    create() {
        // Load Leaderboards
        if (this.scoreLeaderboard === undefined) {
            //console.log("Load Scores");
            this.facebook.getLeaderboard('Distance');
        }

        if (this.starsLeaderboard === undefined) {
            //console.log("Load Stars");
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
            //console.log("Leaderboard Loaded: " + leaderboard.name);
        });

        //Add Background
        this.background = this.add.image(0, 0, 'menubg');
        this.background.setOrigin(0, 0);
        this.background.setDisplaySize(this.cameras.main.displayWidth, this.cameras.main.displayHeight);
        //this.background.setScale(this.background.scaleX, this.background.scaleY);

        // Add Player
        this.player = this.physics.add.sprite(this.cameras.main.centerX, this.cameras.main.displayHeight * 0.7, 'player-idle');
        this.player.setBounce(0.2);
        this.player.setDisplaySize(this.cameras.main.width * 0.16, 100);
        this.player.setScale(this.player.scaleX, this.player.scaleX);

        // Set Bounding Box
        let _x = this.player.displayWidth * 0.2;
        let _y = this.player.displayHeight * 0.18;
        let _w = this.player.displayWidth * 0.63;
        let _h = this.player.displayHeight * 0.78;
        // this.player.body.setOffset(_x, _y);
        // this.player.body.setSize(_w, _h);

        // Animate Player
        if (!this.anims.anims.contains('jump')){
            this.anims.create({
                key: 'jump',
                frames: [{ key: 'player-idle' }],
                duration: 100
            });

            this.player.on('animationcomplete', function(anim, frame, sprite){
                sprite.anims.play('on-air');
            });
        }

        if (!this.anims.anims.contains('on-air')){
            this.anims.create({
                key: 'on-air',
                frames: [{ key: 'player-jump' }],
                frameRate: 10,
                repeat: -1
            });
        }
        this.player.anims.play('on-air');

        //Add Floor of Platforms
        this.platforms = this.physics.add.staticGroup();
        for (let i = 0; i < 3; i++){
            let style = Phaser.Math.Between(1, 3);
            let platX = this.cameras.main.displayWidth * 0.3 * i + this.cameras.main.displayWidth * 0.3/2;
            this.lastPlatformSpawn = this.cameras.main.displayHeight;

            let plat = this.platforms.create(platX, this.lastPlatformSpawn, 'platform' + style);
            plat.setDisplaySize(this.cameras.main.displayWidth * 0.3, 100);
            plat.setScale(plat.scaleX, plat.scaleX);
            plat.setY(plat.y - plat.displayHeight);
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

        // Anim Platforms
        for (let i = 1; i < 7; i++){
            if (!this.anims.anims.contains('nube' + i)){
                this.anims.create({
                    key: 'nube' + i,
                    frames: [
                        { key: 'platform' + i },
                        { key: 'platform' + i  + '-2'},
                        { key: 'platform' + i  + '-3'}
                    ],
                    frameRate: 5,
                    repeat: -1
                })
            }
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
        this.starScoreText.setOrigin(0, 0);
        this.starScoreText.setTintFill(0x000000);
        this.starScoreText.setFontSize(this.cameras.main.displayHeight * 0.05);
        this.starScoreText.setX(this.starScoreText.x - this.starScoreText.width);
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
            // btn.setAlpha(0.3);
            // btn.setTintFill(0x222222 * i);
            btn.setDisplaySize(this.cameras.main.displayWidth/2, this.cameras.main.displayHeight);
            btn.onPointerUp(() => { this.movePlayer(0); });
            btn.onPointerOut(() => { this.movePlayer(0); });
            btn.setDepth(30);

            this.buttons.push(btn);
            this.add.existing(btn);
        }

        this.buttons[0].onPressed((time, delta) => { this.movePlayer(-1); });
        this.buttons[1].onPressed((time, delta) => { this.movePlayer(1); });
        //console.log(this.buttons)
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
        this.buttons.forEach((item, _) => { item.update(time, delta); });
        this.updateCamera();
        this.warpPlayer();

        // Check Spawns
        this.bottomClear();
        if (this.lastPlatformSpawn > this.cameras.main.scrollY)
            this.spawnCloud();
        if (this.lastStarSpawn > this.cameras.main.scrollY)
            this.spawnStar();

        // Check Death
        if (this.player.getBounds().top > this.cameras.main.scrollY + this.cameras.main.displayHeight)
            this.gameOver();

        // Check Difficult
        if(this.score > this.actualDifficult){
            switch(this.actualDifficult) {
                case this.difficult.VERY_EASY:
                    this.actualDifficult = this.difficult.EASY;
                    break;
                case this.difficult.EASY:
                    this.actualDifficult = this.difficult.NORMAL;
                    break;
                case this.difficult.NORMAL:
                    this.actualDifficult = this.difficult.HARD;
                    break;
                case this.difficult.HARD:
                    this.actualDifficult = this.difficult.VERY_HARD;
                    break;
            }
        }
    }

    updateCamera(){
        // Move Camera (C2 code)
        if (this.player.y < this.cameras.main.scrollY + this.cameras.main.centerY && this.player.body.velocity.y < 0) { // Going Up
            // Move the Camera
            this.cameras.main.scrollY = this.player.y - this.cameras.main.displayHeight/2;
            this.moveUI();
            
            // Update Score
            this.score = this.score + (this.lastUpScroll - this.cameras.main.scrollY) / 100;
            this.scoreText.setText("Score: " + Math.ceil(this.score));

            // console.log("Last: " + this.lastUpScroll + " | Cam: " + this.cameras.main.scrollY);
            this.lastUpScroll = Math.min(this.lastUpScroll, this.cameras.main.scrollY);
        } else if (this.player.y > this.cameras.main.scrollY + this.cameras.main.centerY) { // Going Down
            let downScroll = Math.abs(this.player.y - this.lastUpScroll + this.cameras.main.centerY);
            //console.log("Down: " + downScroll + " | Y: " + this.player.y + " | LU: " + this.lastUpScroll + "| Ds: " + this.deltaScroll);
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
        let delta = platform.displayHeight * 0.1;
        if (platform.body.top + delta < player.body.bottom) {
            return;
        }

        player.setVelocityY(this.jumpVelocity);
        player.anims.play('jump');

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
        let type = this.cloudTypes.NORMAL;
        let dist = 1000;                     // This is 000.0% relative to the jump speed
        switch (this.actualDifficult){
            case this.difficult.VERY_EASY:
                type = this.cloudTypes.NORMAL;
                dist = Phaser.Math.Between(167, 333);
                break;
            case this.difficult.EASY:
                type = (Phaser.Math.Between(1, 100) > 25) ? this.cloudTypes.NORMAL : this.cloudTypes.BAD;
                dist = Phaser.Math.Between(267, 400);
                break;
            case this.difficult.NORMAL:
                type = (Phaser.Math.Between(1, 100) > 50) ? this.cloudTypes.NORMAL : this.cloudTypes.BAD;
                dist = Phaser.Math.Between(333, 467);
                break;
            case this.difficult.HARD:
                type = (Phaser.Math.Between(1, 100) > 75) ? this.cloudTypes.NORMAL : this.cloudTypes.BAD;
                dist = Phaser.Math.Between(400, 533);
                break;
            case this.difficult.VERY_HARD:
                type = this.cloudTypes.BAD;
                dist = Phaser.Math.Between(533, 600);
                break;
            
        }

        dist = dist / 1000.0 * -1 * this.jumpVelocity; // Fix to make it proportional no matter the screen

        let style = Phaser.Math.Between(1, 3);
        this.lastPlatformSpawn = this.lastPlatformSpawn - dist;
        let platX = Phaser.Math.Between(0, this.cameras.main.displayWidth * 0.67) + this.cameras.main.displayWidth * 0.33/2;
        let plat = this.platforms.create(platX, this.lastPlatformSpawn, 'platform' + ((type - 1) * 3 + style));
        plat.setDisplaySize(this.cameras.main.displayWidth * 0.3, 100);
        plat.setScale(plat.scaleX, plat.scaleX);
        plat.refreshBody();
        plat.setData(this.cloudTypes.KEY, type);
        plat.anims.setDelay(Phaser.Math.Between(0, 200));
        plat.anims.play('nube' + ((type - 1) * 3 + style));

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
        let dist = 1000;    // 000.0% Relative to the jump speed
        switch(this.actualDifficult){
            case this.difficult.VERY_EASY:
                dist = Phaser.Math.Between(200, 467);
                break;
            case this.difficult.EASY:
                dist = Phaser.Math.Between(333, 667);
                break;
            case this.difficult.NORMAL:
                dist = Phaser.Math.Between(467, 1000);
                break;
            case this.difficult.HARD:
                dist = Phaser.Math.Between(667, 1333);
                break;
            case this.difficult.VERY_HARD:
                dist = Phaser.Math.Between(1000, 2000);
                break;
        }

        dist = dist / 1000.0 * -1 * this.jumpVelocity // Factor to make it relative

        this.lastStarSpawn = this.lastStarSpawn - dist;
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
        //console.log("GAME OVER");
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
        this.buttons.forEach((item, _) => { item.setVisible(false); });

        ///////////////////////////////////////////////////////////////////////
        // Draw Game Over Screen
        let screenRect = new Phaser.Geom.Rectangle(this.cameras.main.x, this.cameras.main.scrollY, this.cameras.main.displayWidth, this.cameras.main.displayHeight);
        let bg = this.add.image(screenRect.x, screenRect.y, 'box');
        bg.setDisplaySize(screenRect.width * 2, screenRect.height * 2);
        bg.setTintFill(0x000000);
        bg.setAlpha(0.5);
        bg.setDepth(5);

        // let logo = this.add.image(screenRect.centerX, screenRect.centerY, 'logo');
        // logo.setOrigin(0.5, 0.5);
        // logo.setDisplaySize(screenRect.width * 0.7, 100);
        // logo.setScale(logo.scaleX, logo.scaleX);
        // logo.setDepth(4);

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
        let topTextShadow = this.add.bitmapText(topText.x + 0.02 * topText.width, topText.y + 0.02 * topText.height, 'set-fire', (this.newHighScore) ? 'NEW\nHIGHSCORE' : 'GAME\nOVER');
        topTextShadow.setCenterAlign();
        topTextShadow.setTintFill(0x000000);
        topTextShadow.setFontSize(topText.fontSize);
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
        let botZonePadding = [0, 0, 0, 10];         // Top, Left, Right, Bottom
        let botZoneSpacing = [40, 20];              // X, Y

        // Add Buttons
        let buttons = [];
        let buttonsText = ["Play Again", "Main Menu"];
        let buttonsWidth = screenRect.width * 0.6;
        let buttonsHeight = botZoneHeight - (botZonePadding[0] + botZoneHeight * 0.1 + botZoneSpacing[1] * 1);
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