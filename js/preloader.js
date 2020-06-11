class Preloader extends Phaser.Scene {
    constructor() {
        super('Preloader');
    }

    preload() {
        this.facebook.once('startgame', this.startGame, this);
        this.facebook.showLoadProgress(this);

        //Preload Main Menu things
        this.load.image('nubes', 'assets/nubes.png');
        this.load.image('menubg', 'assets/dia.png');
        this.load.image('logo', 'assets/logo.png');
        this.load.image('peluchin', 'assets/peluchin.png');
        this.load.image('estrella', 'assets/estrella.png');
        this.load.image('transparent', 'assets/transparent.png');
        this.load.image('tt', 'assets/tt.png');
        this.load.image('marco', 'assets/marco.png');
        this.load.bitmapFont('set-fire', 'assets/set-fire.png', 'assets/set-fire.fnt');
    }

    startGame(){
        this.scene.start('MainMenu');
    }
}