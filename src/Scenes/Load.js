class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");

        // IMAGE FRAMES
        this.load.image("wisp_idle", "kenney_1-bit-platformer-pack/Tiles/Transparent/tile_0300.png");

        // WALK FRAMES
        this.load.image("wisp_walk_1", "kenney_1-bit-platformer-pack/Tiles/Transparent/tile_0301.png");
        this.load.image("wisp_walk_2", "kenney_1-bit-platformer-pack/Tiles/Transparent/tile_0303.png");

        // JUMP FRAMES
        this.load.image("wisp_jump", "kenney_1-bit-platformer-pack/Tiles/Transparent/tile_0304.png")
        this.load.image("wisp_jump_idle", "kenney_1-bit-platformer-pack/Tiles/Transparent/tile_0305.png")
        
        // SLIDE FRAME
        this.load.image("wisp_slide", "kenney_1-bit-platformer-pack/Tiles/Transparent/tile_0302.png")
        
        // PARTICLES
        this.load.image("particle_1","kenney_1-bit-input-prompts-pixel-16/Tiles (White)/tile_0000.png")
        this.load.image("particle_2","kenney_1-bit-input-prompts-pixel-16/Tiles (White)/tile_0012.png")

        // Load tilemap information
        this.load.image("wisp_tilemap_tiles", "kenney_1-bit-platformer-pack/Tilemap/monochrome_tilemap_packed.png");
        this.load.image("wisp_transparent_tiles", "kenney_1-bit-platformer-pack/Tilemap/monochrome_tilemap_transparent_packed.png");                         // Packed tilemap
        this.load.tilemapTiledJSON("wisp_tutorial", "wisp-tutorial.tmj");   // Tilemap in JSON
        this.load.tilemapTiledJSON("wisp_level1", "wisp-level1.tmj");   // Tilemap in JSON


        // Load UI
        this.load.image("wisp_UI", "kenney_1-bit-input-prompts-pixel-16/Tilemap/tilemap_white_packed.png");


        // Load the tilemap as a spritesheet
        this.load.spritesheet("tilemap_sheet", "kenney_1-bit-platformer-pack/Tilemap/monochrome_tilemap_packed.png", {
            frameWidth: 16,
            frameHeight: 16
        });

        this.load.spritesheet("transparent_sheet", "kenney_1-bit-platformer-pack/Tilemap/monochrome_tilemap_transparent_packed.png", {
            frameWidth: 16,
            frameHeight: 16
        });

        this.load.spritesheet("UI_sheet", "kenney_1-bit-input-prompts-pixel-16/Tilemap/tilemap_white_packed.png", {
            frameWidth: 16,
            frameHeight: 16
        });


        // Load Audio
            //movement
        this.load.audio("jumpSFX", "kenney_digital-audio/Audio/phaseJump3.ogg");
        this.load.audio("walkSFX", "kenney_impact-sounds/Audio/footstep_concrete_000.ogg");
        this.load.audio("slideSFX", "kenney_rpg-audio/Audio/cloth3.ogg");

            //ui or menu sounds
        this.load.audio("continueSFX", "kenney_digital-audio/Audio/pepSound2.ogg");
        this.load.audio("finishSFX", "kenney_digital-audio/Audio/threeTone2.ogg");
        this.load.audio("restartSFX", "kenney_digital-audio/Audio/twoTone1.ogg");
        this.load.audio("collectSFX", "kenney_digital-audio/Audio/powerUp2.ogg");
        this.load.audio("checkSFX", "kenney_digital-audio/Audio/powerUp7.ogg");
        // bgm https://freesound.org/people/DominikBraun/sounds/483502/
        this.load.audio("bgMusic", "483502__dominikbraun__let-me-see-ya-bounce-8-bit-music.mp3");
        
        
        // Oooh, fancy. A multi atlas is a texture atlas which has the textures spread
        // across multiple png files, so as to keep their size small for use with
        // lower resource devices (like mobile phones).
        // kenny-particles.json internally has a list of the png files
        // The multiatlas was created using TexturePacker and the Kenny
        // Particle Pack asset pack.
        //this.load.multiatlas("kenny-particles", "kenny-particles.json");
    }

    create() {
        this.anims.create({
            key: 'walk',
            frames: [
                { key: 'wisp_walk_1'},
                { key: 'wisp_walk_2'}
            ],
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            defaultTextureKey: "wisp_idle",
            frames: [
                { frame: 'wisp_idle' }
            ],
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            defaultTextureKey: "wisp_jump",
            frames: [
                { key: 'wisp_jump' }
            ],
        });

        this.anims.create({
            key: 'idle_jump',
            defaultTextureKey: "wisp_jump_idle",
            frames: [
                { key: 'wisp_jump_idle' }
            ],
        });

        this.anims.create({
            key: 'slide',
            defaultTextureKey: "wisp_slide",
            frames: [
                { key: 'wisp_slide' }
            ],
        });

         // ...and pass to the next Scene
          this.scene.start("titleScene");
    }

    // Never get here since a new scene is started in create()
    update() {
    }
}