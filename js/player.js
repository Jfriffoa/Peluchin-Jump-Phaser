class PlayerDetails extends Phaser.Scene {
    constructor() {
        super({ key: 'PlayerDetails', active: false });
    }

    create() {
        this.add.bitmapText(400, 400, 'azo', this.facebook.playerName).setOrigin(0.5);
        this.facebook.loadPlayerPhoto(this, 'player').once('photocomplete', this.addPlayerPhoto, this);
    }

    addPlayerPhoto(key) {
        this.add.image(400, 200, key);
    }

    addRoundedPlayerPhoto(key) {
        var photo = this.textures.createCanvas('playerMasked', 196, 196);
        var source = this.textures.get('player').getSourceImage();
        
        photo.context.beginPath();
        photo.context.arc(98, 98, 98, 0, Math.PI * 2, false);
        photo.context.clip();
        photo.draw(0, 0, source);

        this.add.image(400, 200, 'playerMasked');
    }

    addMaskedPlayerPhoto(key) {
        var photo = this.textures.createCanvas('playerMasked', 196, 196);
        var source = this.textures.get('player').getSourceImage();
        var mask = this.textures.get('mask').getSourceImage();
        
        photo.draw(0, 0, mask);
        photo.context.globalCompositeOperation = 'source-in';
        photo.draw(0, 0, source);

        this.add.image(400, 200, 'playerMasked');
    }
}