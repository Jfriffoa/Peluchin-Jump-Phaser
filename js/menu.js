class MainMenu extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenu', active: false });
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
        let logoPadding = [30, 30, 30, 30];         // Top, Left, Right, Bottom
        this.logo = this.add.image(this.cameras.main.centerX, logoPadding[0], 'logo').setOrigin(0.5, 0);
        this.logo.setDisplaySize(this.cameras.main.displayWidth - (logoPadding[1] + logoPadding[2]), 100);
        this.logo.setScale(this.logo.scaleX);

        //Add Peluchin
        let topZoneHeight = this.logo.displayHeight + logoPadding[0] + logoPadding[3]
        let middleHeight = this.cameras.main.displayHeight * 0.8 - topZoneHeight;
        this.peluchin = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'peluchin').setOrigin(0.5, 0.5);
        this.peluchin.setDisplaySize(100, middleHeight);
        this.peluchin.setScale(this.peluchin.scaleY);

        //Add TT Logo
        this.tt = this.add.image(this.cameras.main.displayWidth - 10, this.cameras.main.displayHeight - 10, 'tt').setOrigin(1, 1);
        this.tt.setDisplaySize(10, this.cameras.main.displayHeight * 0.05);
        this.tt.setScale(this.tt.scaleY);

        //Bottom Zone Variables
        this.buttons = [];
        let bottomZoneHeight = this.cameras.main.displayHeight * 0.22;
        let bottomZonePadding = [0, 10, 10, 90];    // Top, Left, Right, Bottom
        let bottomZoneSpacing = 30;
        let tempZoneHeight = bottomZoneHeight - (bottomZonePadding[0] + bottomZonePadding[3] + bottomZoneSpacing * 1);

        //Inner buttons Variables
        let innerPadding = [0, 0, 30, 0];          // Top, Left, Right, Bottom
        let innerSpacing = 10;
        let texts = ["Play", "Leaderboard"];

        //Add Buttons
        for (let i = 0; i < 2; i++){
            //Add pressable zone
            let btn = new ImageButton(this, this.cameras.main.centerX * 1.05, this.cameras.main.displayHeight - bottomZoneHeight + bottomZonePadding[0] + i * (bottomZoneSpacing + tempZoneHeight/2), 'transparent');
            btn.setOrigin(0.5, 0);
            btn.setDisplaySize(100, tempZoneHeight / 2);
            btn.setScale(btn.scaleY * 4.25, btn.scaleY);
            this.buttons.push(btn);
            this.add.existing(btn);

            //Add Icon
            let icon = this.add.image(btn.x - btn.displayWidth/2 + innerPadding[1], btn.y + innerPadding[0], 'estrella').setOrigin(0, 0);
            let iconSize = btn.displayHeight - (innerPadding[0] + innerPadding[3]);
            icon.setDisplaySize(iconSize, iconSize);

            //Add Text
            let text = this.add.bitmapText(icon.x + icon.displayWidth + innerSpacing, (icon.y + icon.displayHeight/2) * 1.005, 'set-fire', texts[i]);
            //text.setFontSize(0.125 * (btn.displayWidth - (innerPadding[1] + innerPadding[2] + innerSpacing + icon.displayWidth)));
            text.setFontSize(0.8 * icon.displayHeight);
            text.setOrigin(0, 0.5);
            text.setTintFill(0x000000);

            // btn.onPointerUp(() => {
            //     console.log(texts[i] + " pressed");
            // });
        }

        // Buttons Behaviours
        this.buttons[0].onPointerUp(() => {
            this.scene.start('Game');
        });

        // Facebook Player
        let playerName = this.add.bitmapText(this.cameras.main.displayWidth - 30, 10, 'set-fire', "Welcome " + this.facebook.playerName).setOrigin(1, 0);
        playerName.setTintFill(0x000000);
        // console.log(playerName);
    }
}