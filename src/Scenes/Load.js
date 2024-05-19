class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");

        this.load.image("wisp_character", "kenney_1-bit-platformer-pack/Tiles/Default/tile_0300.png")
        // Load tilemap information
        this.load.image("wisp_tilemap_tiles", "kenney_1-bit-platformer-pack/Tilemap/monochrome_tilemap_packed.png");
        this.load.image("wisp_transparent_tiles", "kenney_1-bit-platformer-pack/Tilemap/monochrome_tilemap_transparent_packed.png");                         // Packed tilemap
        this.load.tilemapTiledJSON("wisp_level", "wisp-level.tmj");   // Tilemap in JSON

        // Load the tilemap as a spritesheet
        this.load.spritesheet("tilemap_sheet", "kenney_1-bit-platformer-pack/Tilemap/monochrome_tilemap_packed.png", {
            frameWidth: 16,
            frameHeight: 16
        });

        this.load.spritesheet("transparent_sheet", "kenney_1-bit-platformer-pack/Tilemap/monochrome_tilemap_transparent_packed.png", {
            frameWidth: 16,
            frameHeight: 16
        });

        // Oooh, fancy. A multi atlas is a texture atlas which has the textures spread
        // across multiple png files, so as to keep their size small for use with
        // lower resource devices (like mobile phones).
        // kenny-particles.json internally has a list of the png files
        // The multiatlas was created using TexturePacker and the Kenny
        // Particle Pack asset pack.
        //this.load.multiatlas("kenny-particles", "kenny-particles.json");
    }

    create() {
    //     this.anims.create({
    //         key: 'walk',
    //         frames: this.anims.generateFrameNames('platformer_characters', {
    //             prefix: "tile_",
    //             start: 0,
    //             end: 1,
    //             suffix: ".png",
    //             zeroPad: 4
    //         }),
    //         frameRate: 15,
    //         repeat: -1
    //     });

    //     this.anims.create({
    //         key: 'idle',
    //         defaultTextureKey: "platformer_characters",
    //         frames: [
    //             { frame: "tile_0000.png" }
    //         ],
    //         repeat: -1
    //     });

    //     this.anims.create({
    //         key: 'jump',
    //         defaultTextureKey: "platformer_characters",
    //         frames: [
    //             { frame: "tile_0001.png" }
    //         ],
    //     });

    //      // ...and pass to the next Scene
          this.scene.start("platformerScene");
    }

    // Never get here since a new scene is started in create()
    update() {
    }
}