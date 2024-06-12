class EndScreen extends Phaser.Scene {
    constructor() {
        super("endScene");
    }

    create() {
        this.titleText = this.add.text(game.config.width/2, game.config.height/4, 'The End', {
            fontFamily: "'Micro 5'",
            fontSize: 250,
            resolution: 16,
            align: "center"
        });
        this.titleText.setOrigin(.5, .5);

        this.continueText = this.add.text(game.config.width/2, game.config.height/4+250, 'Asset Credits:', {
            fontFamily: "'Micro 5'",
            fontSize: 100,
            resolution: 16,
            align: "center"
        });
        this.continueText.setOrigin(.5, .5);

        let creditString = "Graphics: https://kenney.nl\nSound Effects: https://kenney.nl\nBGM: Let Me See Ya Bounce\n by DominikBraun https://freesound.org";

        this.continueText = this.add.text(game.config.width/2, game.config.height-350, creditString, {
            fontFamily: "'Micro 5'",
            fontSize: 100,
            resolution: 16,
            align: "center"
        });
        this.continueText.setOrigin(.5, .5);



        // press space to start (can change after)
        // this.input.keyboard.on('keydown-SPACE', () => {
            // this.scene.start("platformerLv1Scene");
            // this.sound.play("continueSFX");
            // this.scene.start("tutorialScene");
        // });
    }

}