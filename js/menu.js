class MainMenu extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenu', active: false });
    }

    preload() {
        this.load.image('profile-pic', this.facebook.getPlayerPhotoURL());
    }

    create() {
        // Debug Text
        // let debugText = this.add.bitmapText(16, 16, 'set-fire', 'W: ' + this.cameras.main.displayWidth + ' H: ' + this.cameras.main.displayHeight)
        //     .setOrigin(0, 0)
        //     .setTintFill(0x000000)
        //     .setDepth(15);
        // debugText.setFontSize((this.cameras.main.displayWidth - 32) * debugText.fontSize / debugText.width);


        //Add Bg
        this.background = this.add.image(0, 0, 'menubg');
        this.background.setOrigin(0, 0);
        this.background.setDisplaySize(this.cameras.main.displayWidth, this.cameras.main.displayHeight);
        //this.background.setScale(this.background.scaleX, this.background.scaleY);

        //Add Bottom Cloud
        this.cloud = this.add.image(0, this.cameras.main.displayHeight, 'nubes').setOrigin(0, 1);
        this.cloud.setDisplaySize(this.cameras.main.displayWidth, 100);
        this.cloud.setScale(this.cloud.scaleX);

        //Add Logo
        let logoPadding = [30, 30, 30, 30];         // Top, Left, Right, Bottom
        this.logo = this.add.image(this.cameras.main.centerX, logoPadding[0], 'logo').setOrigin(0.5, 0);
        //this.logo.setDisplaySize(this.cameras.main.displayWidth - (logoPadding[1] + logoPadding[2]), 100);
        this.logo.setDisplaySize(100, this.cameras.main.displayHeight * 0.3 - (logoPadding[0] + logoPadding[3]));
        this.logo.setScale(this.logo.scaleY);

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
        let bottomZoneHeight = this.cameras.main.displayHeight * 0.22;
        let bottomZonePadding = [0, 10, 10, 90];    // Top, Left, Right, Bottom
        let bottomZoneSpacing = 30;
        let tempZoneHeight = bottomZoneHeight - (bottomZonePadding[0] + bottomZonePadding[3] + bottomZoneSpacing * 1);
        
        ///////////////////////////////////////////////////////////////////////
        // Play Button
        let playZoneHeight = this.cameras.main.displayHeight * 0.12;
        let playZonePadding = [0, 10, 10, 10];
        let innerPadding = [0, 0, 0, 0]
        let innerSpacing = 30;

        // Add Button
        this.playButton = new ImageButton(this, this.cameras.main.centerX * 1.05, this.cameras.main.displayHeight - playZoneHeight + playZonePadding[0], 'transparent');
        this.playButton.setOrigin(0.5, 0);
        this.playButton.setDisplaySize(100, playZoneHeight - (playZonePadding[0] + playZoneHeight * 0.2));
        this.playButton.setScale(this.playButton.scaleY * 3, this.playButton.scaleY);
        this.add.existing(this.playButton);

        this.playButton.onPointerUp(() => { this.scene.start('Game') });
        
        // Add Icon
        let icon = this.add.image(this.playButton.x - this.playButton.displayWidth/2, this.playButton.y + innerPadding[0], 'estrella').setOrigin(0, 0);
        let iconSize = this.playButton.displayHeight - (innerPadding[0] + innerPadding[3]);
        icon.setDisplaySize(iconSize, iconSize);

        // Add Text
        let text = this.add.bitmapText(icon.x + icon.displayWidth + innerSpacing, (icon.y + icon.displayHeight / 2) * 1.005, 'set-fire', 'Play');
        text.setFontSize(0.8 * icon.displayHeight);
        text.setOrigin(0, 0.5);
        text.setTintFill(0x000000);

        ///////////////////////////////////////////////////////////////////////
        // Facebook
        let fbZoneHeight = this.cameras.main.displayHeight * 0.10;
        let fbZonePadding = [0, 0, 0, 10];
        let fbZoneSpacing = 20;

        // Define zone
        let fbZone = this.add.image(this.cameras.main.centerX, this.cameras.main.displayHeight - (fbZoneHeight + playZoneHeight) + fbZonePadding[0], 'transparent').setOrigin(0.5, 0);
        fbZone.setDisplaySize(this.cameras.main.displayWidth * 0.9 - (fbZonePadding[1] + fbZonePadding[2]), fbZoneHeight - (fbZonePadding[0] + fbZonePadding[3]));

        // Mask Profile Pic in case it didn't exists
        if (!this.textures.exists('player-masked')){
            let photo = this.textures.createCanvas('player-masked', 123, 129);
            let source = this.textures.get('profile-pic').getSourceImage();
            let sourceFrame = this.textures.getFrame('profile-pic');
            let mask = this.textures.get('estrella').getSourceImage();

            photo.draw(0, 0, mask);
            photo.getContext().globalCompositeOperation = 'source-in';
            photo.getContext().drawImage(source, 0, 0, sourceFrame.width, sourceFrame.height, 0, 0, 123, 129);
            photo.refresh();
        }

        // Add Profile Pic Masked
        let profilePic = this.add.image(fbZone.x - fbZone.displayWidth/2, fbZone.y, 'player-masked').setOrigin(0, 0);
        profilePic.setDisplaySize(fbZone.displayHeight, fbZone.displayHeight);

        let frame = this.add.image(fbZone.x - fbZone.displayWidth/2, fbZone.y, 'marco').setOrigin(0, 0);
        frame.setDisplaySize(fbZone.displayHeight, fbZone.displayHeight);

        // Add Facebook Name
        let playerName = this.add.bitmapText(profilePic.x + profilePic.displayWidth + fbZoneSpacing, (profilePic.y + profilePic.displayHeight / 2) * 1.005, 'set-fire', "Welcome " + this.facebook.getPlayerName());
        let newSize = (fbZone.displayWidth - (profilePic.displayWidth + fbZoneSpacing + fbZonePadding[0] + fbZonePadding[3])) * playerName.fontSize / playerName.width;
        playerName.setFontSize(Math.min(150, newSize));
        playerName.setOrigin(0, 0.5);
        playerName.setTintFill(0x000000);
    }
}