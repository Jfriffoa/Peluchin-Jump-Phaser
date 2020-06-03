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
        // this.buttons = [];
        // let bottomZoneHeight = this.cameras.main.displayHeight * 0.22;
        // let bottomZonePadding = [0, 60, 60, 30];
        // let bottomZoneSpacing = 20;
        // let tempZoneHeight = bottomZoneHeight - (bottomZonePadding[0] + bottomZonePadding[3] + bottomZoneSpacing * 1);

        // //Inner buttons Variables
        // let innerPadding = [0, 30, 30, 0];
        // let innerSpacing = 10;

        // //Add Buttons
        // for (let i = 0; i < 2; i++){
        //     let btn = new ImageButton(this, this.cameras.main.centerX, this.cameras.main.displayHeight - bottomZoneHeight + bottomZonePadding[0] + i * (bottomZoneSpacing + tempZoneHeight/2), null);
        //     btn.setOrigin(0.5, 0);
        //     btn.setDisplaySize(this.cameras.main.displayWidth - (bottomZonePadding[1] + bottomZonePadding[2]), tempZoneHeight / 2);
        //     this.buttons.push(btn);
        //     this.add.existing(btn);

        //     //Button style
        //     let icon = this.add.image(bottomZonePadding[1] + innerPadding[1], btn.y, 'estrella').setOrigin(0, 0);
        //     icon.setDisplaySize(btn.displayHeight, btn.displayHeight);
        // }


        // this.createButton("Play", centerX, centerY + 32, 300, 100, function() {
        //     console.log("Play Pressed");
        // });

        // this.createButton("About", centerX, centerY + 192, 300, 100, function() {
        //     console.log("About Pressed");
        // });
    }

    // createButton(string, x, y, w, h, callback) {
    //     let btn = this.add.image(x, y, 'button');
        
    //     btn.anchor.setTo(0.5, 0.5);
    //     btn.width = w;
    //     btn.height = h;

    //     let txt = this.add.text(btn.x, btn.y, string, {
    //         font: "14px Arial",
    //         fill: "#fff",
    //         align: "center"
    //     }).setOrigin(0.5);
    // }
}