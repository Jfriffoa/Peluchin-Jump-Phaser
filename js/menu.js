class MainMenu extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenu', active: false });
    }

    preload() {

    }

    create() {
        //Add Bg
        this.background = this.add.image(0, 0, 'menubg');
        this.background.setDisplaySize(this.cameras.main.displayWidth, this.cameras.main.displayHeight);
        this.background.setScale(2 * this.background.scaleX, 2 * this.background.scaleY);

        //Add Bottom Cloud
        this.cloud = this.add.image(0, this.cameras.main.displayHeight, 'nubes').setOrigin(0, 1);
        this.cloud.setDisplaySize(this.cameras.main.displayWidth, 100);
        this.cloud.setScale(this.cloud.scaleX);

        //Add Logo
        let logoPadding = [30, 30, 30, 30];     // Top, Left, Right, Bottom
        this.logo = this.add.image(this.cameras.main.centerX, logoPadding[0], 'logo').setOrigin(0.5, 0);
        this.logo.setDisplaySize(this.cameras.main.displayWidth - (logoPadding[1] + logoPadding[2]), 100);
        this.logo.setScale(this.logo.scaleX);

        //Add Peluchin
        let middleHeight = this.cameras.main.displayHeight * 0.8 - (this.logo.displayHeight + (logoPadding[0] + logoPadding[3]));
        this.peluchin = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'peluchin').setOrigin(0.5, 0.5);
        this.peluchin.setDisplaySize(100, middleHeight);
        this.peluchin.setScale(this.peluchin.scaleY);

        //Bottom Zone Variables
        this.buttons = [];
        let bottomZoneHeight = this.cameras.main.displayHeight * 0.22;
        let bottomZonePadding = [0, 60, 60, 30];
        let bottomZoneSpacing = 20;
        let tempZoneHeight = bottomZoneHeight - (bottomZonePadding[0] + bottomZonePadding[3] + bottomZoneSpacing * 1);

        //Inner buttons Variables
        let innerPadding = [0, 30, 30, 0];
        let innerSpacing = 10;
        let texts = ["Play", "Leaderboard"];

        //Add Buttons
        for (let i = 0; i < 2; i++){
            let btn = new ImageButton(this, this.cameras.main.centerX, this.cameras.main.displayHeight - bottomZoneHeight + bottomZonePadding[0] + i * (bottomZoneSpacing + tempZoneHeight/2), null);
            btn.setOrigin(0.5, 0);
            btn.setDisplaySize(100, tempZoneHeight / 2);
            btn.setScale(btn.scaleY * 4.25, btn.scaleY);
            this.buttons.push(btn);
            this.add.existing(btn);

            //Add Icon
            let icon = this.add.image(btn.x - btn.displayWidth/2 + innerPadding[0], btn.y, 'estrella').setOrigin(0, 0);
            icon.setDisplaySize(btn.displayHeight, btn.displayHeight);

            //Add Text
            let text = this.add.bitmapText(icon.x + icon.displayWidth + innerSpacing, btn.y + btn.displayHeight/2, 'font', texts[i]).setOrigin(0, 0.5);
            //Todo: See if text scales well
            //Todo: Add Listeners
        }
    }
}