class TitleScreen extends Phaser.Scene {
    constructor() {
        super("titleScene");
    }

    create() {
        // this.titleText = this.add.text(game.config.width/2, game.config.height/4+100, 'Wisp', {
        //     fontFamily: "'Micro 5'",
        //     fontSize: 250,
        //     resolution: 16,
        //     align: "center"
        // });
        // this.titleText.setOrigin(.5, .5);

        this.continueText = this.add.text(game.config.width/2, game.config.height/2, 'Press SPACE to begin', {
            fontFamily: "'Micro 5'",
            fontSize: 100,
            resolution: 16,
            align: "center"
        });
        this.continueText.setOrigin(.5, .5);

        this.bgMusic = this.sound.add('bgMusic', { volume: 0.5, loop: true });
        this.bgMusic.play();

        // press space to start (can change after)
        this.input.keyboard.on('keydown-SPACE', () => {
            // this.scene.start("endScene");
            this.sound.play("continueSFX");
            this.scene.start("tutorialScene");
        });
    }

}