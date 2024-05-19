class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        // variables and settings
        this.RUN_VELOCITY = 100;
        // this.DRAG = 200;    // DRAG < RUN_VELOCITY = icy slide
        this.physics.world.gravity.y = 500;
        this.JUMP_VELOCITY = -200;
        this.WALL_JUMP_VELOCITY =  -this.JUMP_VELOCITY;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 5.0;
        this.BREEZE_STRENGTH = 3000;
    }

    create() {
        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 45 tiles wide and 25 tiles tall.
        this.map = this.add.tilemap("wisp_level", 16, 16, 96, 18);

        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("wisp_tilemap_packed", "wisp_tilemap_tiles");
        this.transparent = this.map.addTilesetImage("wisp_tilemap_transparent_packed", "wisp_transparent_tiles");

    // LAYERS


        // BACKGROUND LAYER
        this.backLayer = this.map.createLayer("Background", this.tileset, 0, 0);

        
        // WALL LAYER
        this.wallLayer = this.map.createLayer("Walls", this.tileset, 0, 0);

        // Make it collidable
        this.wallLayer.setCollisionByProperty({
            collides: true
        });


        // PLATFORMS LAYER
        this.platformLayer = this.map.createLayer("Platforms", this.tileset, 0, 0);

        // Make it collidable
        this.platformLayer.setCollisionByProperty({
            collides: true
        });


        // SPIKES LAYER
        this.spikesLayer = this.map.createLayer("Spikes", this.transparent, 0, 0);

        // Make it collidable
        this.spikesLayer.setCollisionByProperty({
            collides: true
        });


        // FANS LAYER
        this.fanLayer = this.map.createLayer("Fans", this.tileset, 0, 0);

        // Make it collidable
        this.fanLayer.setCollisionByProperty({
            collides: true
        });

        // BREEZE LAYER
        this.breezeLayer = this.map.createLayer("Breeze", this.transparent, 0, 0);
        this.breezeLayer.setVisible(false);



    // OBJECT LAYERS

        // DIAMONDS (COLLECTIBLES)
        this.diamonds = this.map.createFromObjects("Collectibles", {
            name: "diamond",
            key: "transparent_sheet",
            frame: 22
        });


        // 

        // // TODO: Add turn into Arcade Physics here
        // // Since createFromObjects returns an array of regular Sprites, we need to convert 
        // // them into Arcade Physics sprites (STATIC_BODY, so they don't move) 
        this.physics.world.enable(this.diamonds, Phaser.Physics.Arcade.STATIC_BODY);

        // Create a Phaser group out of the array this.coins
        // This will be used for collision detection below.
        this.diamondGroup = this.add.group(this.diamonds);
        

    // PLAYER AVATAR

        // SET UP
        my.sprite.player = this.physics.add.sprite(112, 256, "wisp_character");
        my.sprite.player.setCollideWorldBounds(true);
        my.sprite.player.body.setSize(12, 12);


        // COLLISIONS

            // WALLS
        this.physics.add.collider(my.sprite.player, this.wallLayer);

            // PLATFORMS
        this.physics.add.collider(
            my.sprite.player,
            this.platformLayer,
            null,
            (player, platform) =>
            {
                return player.body.velocity.y >= 0;
            });

            // FANS
        this.physics.add.collider(my.sprite.player, this.fanLayer);


            // BREEZE
        // this.physics.add.overlap(my.sprite.player, this.breezeLayer, (obj1, obj2) => {
        //     const direction = obj2.properties.direction;

        //     switch(direction) {
        //         case "up":
        //             obj1.setVelocityY(-this.BREEZE_STRENGTH);
        //             break;
        //         case "down":
        //             obj1.setVelocityY(this.BREEZE_STRENGTH/2);
        //             break;
        //         case "left":
        //             obj1.setVelocityX(-this.BREEZE_STRENGTH * 2);
        //             break;
        //         case "right":
        //             obj1.setVelocityX(this.BREEZE_STRENGTH * 2);
        //             break;
        //         default:
        //             break;
        //     }
        // });

        this.breezeDirection = this.getBreezeDirection();
        this.currentBreezeDirection = null;
            

            // DIAMONDS COLLISION
        this.physics.add.overlap(my.sprite.player, this.diamondGroup, (obj1, obj2) => {
            obj2.destroy();
        });
        
    // PLAYER VARIABLES

        // WALL JUMPING
        this.canWallJump = false;
        this.wallJumpDirection = 0;

        my.sprite.player.body.setDamping(0.8);
        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        this.rKey = this.input.keyboard.addKey('R');

        // debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);

        // TODO: Add movement vfx here
        //my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
        //     frame: ['smoke_03.png', 'smoke_09.png'],
        //     // TODO: Try: add random: true
        //     random: true,
        //     scale: {start: 0.03, end: 0.1},
        //     // TODO: Try: maxAliveParticles: 8,
        //     maxAliveParticles: 16,
        //     lifespan: 350,
        //     // TODO: Try: gravityY: -400,
        //     gravityY: -400,
        //     alpha: {start: 1, end: 0.1}, 
        // });

        // my.vfx.walking.stop();

        // TODO: add camera code here
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);

    }

    update() {

    // PLAYER MOVEMENT
        if(cursors.left.isDown || cursors.right.isDown) {
            if(cursors.left.isDown) {

                if (my.sprite.player.body.blocked.down) {
                    my.sprite.player.setVelocityX(-this.RUN_VELOCITY);
                    my.sprite.player.resetFlip();
                }
                else {
                    my.sprite.player.setVelocityX(-this.RUN_VELOCITY * 1.25);
                    my.sprite.player.resetFlip();
                }

                // my.sprite.player.anims.play('walk', true);
                // TODO: add particle following code here
                // my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);

                // my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

                // // Only play smoke effect if touching the ground

                // if (my.sprite.player.body.blocked.down) {

                //     my.vfx.walking.start();

                // }
            }

            if(cursors.right.isDown) {
                if (my.sprite.player.body.blocked.down) {
                    my.sprite.player.setVelocityX(this.RUN_VELOCITY);
                    my.sprite.player.setFlip(true, false);
                }
                else {
                    my.sprite.player.setVelocityX(this.RUN_VELOCITY * 1.25);
                    my.sprite.player.setFlip(true, false);
                }
                // my.sprite.player.anims.play('walk', true);
                // TODO: add particle following code here
                // my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);
    
                // my.vfx.walking.setParticleSpeed(-this.PARTICLE_VELOCITY, 0);
    
                // // Only play smoke effect if touching the ground
    
                // if (my.sprite.player.body.blocked.down) {
    
                //     my.vfx.walking.start();
    
                // }
            }

            if (cursors.left.isDown && cursors.right.isDown) {
                // Set RUN_VELOCITY to 0 and have DRAG take over
                my.sprite.player.setVelocityX(0);
                // my.sprite.player.setDragX(this.DRAG);
                // my.sprite.player.anims.play('idle');
                // TODO: have the vfx stop playing
                // my.vfx.walking.stop();
            }

        } else {
            // Set RUN_VELOCITY to 0 and have DRAG take over
            my.sprite.player.setVelocityX(0);
            // my.sprite.player.setDragX(this.DRAG);
            // my.sprite.player.anims.play('idle');
            // TODO: have the vfx stop playing
            // my.vfx.walking.stop();
        }

        // PLAYER JUMP
        // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
        if(!my.sprite.player.body.blocked.down) {
            // my.sprite.player.anims.play('jump');
        }
        if((my.sprite.player.body.blocked.down || this.canWallJump) && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            my.sprite.player.setVelocityY(0);

            my.sprite.player.setVelocityY(this.JUMP_VELOCITY);

            if (this.canWallJump && !my.sprite.player.body.blocked.down) {
                my.sprite.player.setVelocityX(0);
                my.sprite.player.setVelocityX(this.wallJumpDirection * this.WALL_JUMP_VELOCITY)
                this.canWallJump = false;
                console.log("wall jumped :3");
            }
        }


    // RESTART

        if(Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
        }

    // UPDATE FUNCTIONS

        // WALL JUMP CHECK
        this.checkWallJump();

        // BREEZE CHECKING
        const breezeDirection = this.getBreezeDirection();

        if (breezeDirection) {

            if (breezeDirection !== this.currentBreezeDirection) {
                my.sprite.player.setAcceleration(0, 0);
            }

            switch (breezeDirection) {
                case "up":
                    my.sprite.player.setAccelerationY(-this.BREEZE_STRENGTH);
                    break;
                case "down":
                    my.sprite.player.setAccelerationY(this.BREEZE_STRENGTH);
                    break;
                case "left":
                    my.sprite.player.setAccelerationX(-this.BREEZE_STRENGTH);
                    break;    
                case "right":
                    my.sprite.player.setAccelerationX(this.BREEZE_STRENGTH);
                    break;
            }

            this.currentBreezeDirection = breezeDirection;

        } else {
            my.sprite.player.setAcceleration(0, 0);
            this.currentBreezeDirection = null;
        }
    }

    checkWallJump() {
        const touchingLeft = my.sprite.player.body.blocked.left;
        const touchingRight = my.sprite.player.body.blocked.right;

        if (touchingLeft || touchingRight) {
            this.canWallJump = true;
            this.wallJumpDirection = touchingLeft ? 1 : -1

            if (!my.sprite.player.body.blocked.down) {
                my.sprite.player.setVelocityY(10);
            }
        }
    }

    getBreezeDirection() {
        const playerTileX = this.breezeLayer.worldToTileX(my.sprite.player.x);
        const playerTileY = this.breezeLayer.worldToTileY(my.sprite.player.y);

        const tile = this.breezeLayer.getTileAt(playerTileX, playerTileY);

        return tile && tile.properties.direction ? tile.properties.direction : null;
    }
}