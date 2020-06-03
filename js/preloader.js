class Preloader extends Phaser.Scene {
    constructor() {
        super('Preloader');
    }

    //If I need to preload
    preload() {
        this.facebook.once('startgame', this.startGame, this);
        this.facebook.showLoadProgress(this);

        this.load.image('player-idle', 'assets/peluchin-idle.png');
        this.load.image('player-jump', 'assets/peluchin-jumping.png');

        //Preload Main Menu things
        this.load.image('nubes', 'assets/nubes.png');
        this.load.image('menubg', 'assets/dia.png');
        this.load.image('logo', 'assets/logo.png');
        this.load.image('peluchin', 'assets/peluchin.png');
        this.load.image('estrella', 'assets/estrella.png');
        this.load.bitmapFont('font', 'assets/font.png', 'assets/font.fnt');
    }

    //If I DON'T need to preload
    // create() {
    //     this.facebook.once('startgame', this.startGame, this);
    //     this.facebook.gameStarted();
    // }

    startGame(){
        this.scene.start('MainMenu');
        // this.scene.start('Game');
    }
}