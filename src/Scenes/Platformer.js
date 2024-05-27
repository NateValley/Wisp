class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        // variables and settings
        this.RUN_VELOCITY = 100;
        this.DRAG = 200;    // DRAG < RUN_VELOCITY = icy slide
        this.physics.world.gravity.y = 500;
        this.JUMP_VELOCITY = -200;
        this.WALL_JUMP_VELOCITY_X =  25;
        this.WALL_JUMP_VELOCITY_Y = -100;
        this.WALL_GRAB_COOLDOWN = 200;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 3.8;
        this.BREEZE_STRENGTH = 2000;
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
        this.UIsheet = this.map.addTilesetImage("tilemap_white_packed", "wisp_UI");
    
    
    // LAYERS


        // BACKGROUND LAYER
        this.backLayer = this.map.createLayer("Background", this.tileset, 0, 0);

        // UI LAYER
        this.UILayer = this.map.createLayer("UI", this.UIsheet, 0, 0);
        
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

        // CHAINS LAYER
        this.chainsLayer = this.map.createLayer("Chains", this.transparent, 0, 0);
        this.chainsLayer.setCollisionByProperty({
            isClimbable: true
        });


    // OBJECT LAYERS

        // DIAMONDS (COLLECTIBLES)
        this.diamonds = this.map.createFromObjects("Collectibles", {
            name: "diamond",
            key: "transparent_sheet",
            frame: 22
        });

        this.physics.world.enable(this.diamonds, Phaser.Physics.Arcade.STATIC_BODY);
        this.diamondGroup = this.add.group(this.diamonds);
        

        // CHECKPOINTS
        this.checkpoints = this.map.createFromObjects("Checkpoints", {
            name: "checkpoint",
            key: "transparent_sheet",
            frame: 248
        });

        this.physics.world.enable(this.checkpoints, Phaser.Physics.Arcade.STATIC_BODY);
        this.checkpointGroup = this.add.group(this.checkpoints);


    // PLAYER AVATAR

        // SET UP
        my.sprite.player = this.physics.add.sprite(2000, 256, "wisp_idle");
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
        this.breezeDirection = this.getBreezeDirection();
        this.currentBreezeDirection = null;
            

            // DIAMONDS
        this.physics.add.overlap(my.sprite.player, this.diamondGroup, (obj1, obj2) => {
            obj2.destroy();
        });


            // CHECKPOINTS
        this.physics.add.overlap(my.sprite.player, this.checkpointGroup, (obj1, obj2) => {
            this.checkpointActivate(obj2);
        });


            // CHAINS
            this.physics.add.collider(my.sprite.player, this.chainsLayer);

        
    // PLAYER VARIABLES

        // WALL JUMPING
        this.canWallJump = false;
        this.wallJumpDirection = 0;
        
        // WALL GRABBING
        this.canGrab = true;

        my.sprite.player.body.setDamping(0.8);
        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        this.rKey = this.input.keyboard.addKey('R');
        this.spaceKey = this.input.keyboard.addKey('SPACE');

        // debug key listener (assigned to D key)
        this.physics.world.drawDebug = false;
        // this.input.keyboard.on('keydown-D', () => {
        //     this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
        //     this.physics.world.debugGraphic.clear()
        // }, this);

        // TODO: Add movement vfx here
        my.vfx.walking = this.add.particles(0, 0, 'particle_1', {
            frame: ['particle_1', 'particle_2'],
            // TODO: Try: add random: true
            random: true,
            scale: {start: 0.3, end: 0.1},
            // TODO: Try: maxAliveParticles: 8,
            maxAliveParticles: 8,
            lifespan: 200,
            // TODO: Try: gravityY: -400,
            gravityY: -200,
            alpha: {start: 1, end: 0.1}, 
        });

        my.vfx.walking.stop();

        // CHECKPOINT VARIABLE
        this.currentCheckpoint = null;
        
        // CHAIN TOUCHING
        this.onChain = false;

    // CAMERA SETTINGS
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.setZoom(this.SCALE);
        this.cameras.main.centerOn(100, 0);
    
    
    // TEXT
        this.controlsText = this.add.text(12, 80, 'controls:', {
            fontFamily: "'Micro 5'",
            fontSize: 20,
            resolution: 16
        });

        this.moveLeftText = this.add.text(6, 110, 'move left/\nwall grab', {
            fontFamily: "'Micro 5'",
            fontSize: 11,
            resolution: 16
        });

        this.moveRightText = this.add.text(6, 140, 'move right/\nwall grab', {
            fontFamily: "'Micro 5'",
            fontSize: 11,
            resolution: 16
        });

        this.jumpText = this.add.text(4, 164, ' jump/ wall jump', {
            fontFamily: "'Micro 5'",
            fontSize: 11,
            resolution: 16
        });

        this.resetText = this.add.text(4, 208, 'reset game', {
            fontFamily: "'Micro 5'",
            fontSize: 12,
            resolution: 12
        });

        this.titleText = this.add.text(165, 65, 'wisp', {
            fontFamily: "'Micro 5'",
            fontSize: 40,
            resolution: 12
        });

        this.descText = this.add.text(160, 106, 'a game made by\nnathaniel valdenor\n(for cmpm 120)', {
            fontFamily: "'Micro 5'",
            fontSize: 16,
            resolution: 12
        });

        this.thanksText = this.add.text(1536, 250, 'special thanks to\nkenney for assets', {
            fontFamily: "'Micro 5'",
            fontSize: 16,
            resolution: 12
        });

        this.endText = this.add.text(1550, 20, 'thank you for playing!', {
            fontFamily: "'Micro 5'",
            fontSize: 18,
            resolution: 12
        });
    }

    update() {

    // PLAYER MOVEMENT
        if((cursors.left.isDown || cursors.right.isDown)) {
            if(cursors.left.isDown) {

                if (my.sprite.player.body.blocked.down) {
                    my.sprite.player.setVelocityX(-this.RUN_VELOCITY);
                    my.sprite.player.setFlip(true, false);
                }
                else if (this.canGrab) {
                    my.sprite.player.setVelocityX(-this.RUN_VELOCITY * 0.8);
                    my.sprite.player.setFlip(true, false);
                }

                my.sprite.player.anims.play('walk', true);
                
                if (!my.sprite.player.body.blocked.down) {
                    my.sprite.player.anims.play('jump');
                }


                // TODO: add particle following code here
                my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);

                my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

                // Only play smoke effect if touching the ground

                if (my.sprite.player.body.blocked.down) {

                    my.vfx.walking.start();

                }
            }

            if(cursors.right.isDown) {
                if (my.sprite.player.body.blocked.down) {
                    my.sprite.player.setVelocityX(this.RUN_VELOCITY);
                    my.sprite.player.resetFlip();
                }
                else if (this.canGrab) {
                    my.sprite.player.setVelocityX(this.RUN_VELOCITY * 0.8);
                    my.sprite.player.resetFlip();
                }
                my.sprite.player.anims.play('walk', true);
                
                if (!my.sprite.player.body.blocked.down) {
                    my.sprite.player.anims.play('jump');
                }

                // TODO: add particle following code here
                my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);
    
                my.vfx.walking.setParticleSpeed(-this.PARTICLE_VELOCITY, 0);
    
                // Only play smoke effect if touching the ground
    
                if (my.sprite.player.body.blocked.down) {
    
                    my.vfx.walking.start();
    
                }
            }

            if (cursors.left.isDown && cursors.right.isDown) {
                // Set RUN_VELOCITY to 0 and have DRAG take over
                my.sprite.player.setVelocityX(0);
                // my.sprite.player.setDragX(this.DRAG);
                my.sprite.player.anims.play('idle');

                if (!my.sprite.player.body.blocked.down) {
                    my.sprite.player.anims.play('idle_jump');
                }

                // TODO: have the vfx stop playing
                my.vfx.walking.stop();
            }

        } else {
            my.sprite.player.setVelocityX(0);
            // my.sprite.player.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');

            if (!my.sprite.player.body.blocked.down) {
                my.sprite.player.anims.play('idle_jump');
            }
            // TODO: have the vfx stop playing
            my.vfx.walking.stop();
        }

        // PLAYER CHAINS CHECK
        this.chainCheck();

        // PLAYER JUMP

        if((my.sprite.player.body.blocked.down || this.canWallJump) && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {

            if (this.canWallJump && !my.sprite.player.body.blocked.down && (cursors.left.isDown || cursors.right.isDown)) {
                my.sprite.player.setVelocityX(this.wallJumpDirection * this.WALL_JUMP_VELOCITY_X)
                this.canWallJump = false;
                this.physics.world.gravity.y = -700;
                this.preventImmediateGrab();
                console.log("wall jumped :3");
            } else if (my.sprite.player.body.blocked.down) {
                my.sprite.player.setVelocityY(this.JUMP_VELOCITY);
            }
        }

        // PLAYER SLIDE

        if (this.canWallJump) {
            my.sprite.player.anims.play('slide')
        }

    // RESTART

        if(Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
        }

    // UPDATE FUNCTIONS (RUNNING EVERY FRAME)

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
                    my.sprite.player.setAccelerationY(-this.BREEZE_STRENGTH * 0.6);
                    break;
                case "down":
                    my.sprite.player.setAccelerationY(this.BREEZE_STRENGTH * 2);
                    break;
                case "left":
                    my.sprite.player.setAccelerationX(-this.BREEZE_STRENGTH * 0.8);
                    break;    
                case "right":
                    my.sprite.player.setAccelerationX(this.BREEZE_STRENGTH * 2);
                    break;
            }

            this.currentBreezeDirection = breezeDirection;

        } else {
            my.sprite.player.setAcceleration(0, 0);
            this.currentBreezeDirection = null;
        }

        // AIR DRAG
        if (!my.sprite.player.body.blocked.down)
        {
            my.sprite.player.setDragX(this.DRAG);
        }

        // SPIKE COLLISION
        this.spikeCollision();


        // CAMERA CHECKING
        this.cameraCheck();
    }


    // WALL JUMP FUNCTIONS
        
        // WALL JUMP CHECKING
    checkWallJump() {
        const touchingLeft = my.sprite.player.body.blocked.left;
        const touchingRight = my.sprite.player.body.blocked.right;

        if (touchingLeft || touchingRight && !this.onChain) {
            this.canWallJump = true;
            this.wallJumpDirection = touchingLeft ? 1 : -1

            if (!my.sprite.player.body.blocked.down) {
                if (my.sprite.player.body.velocity.y >= 0) {
                    my.sprite.player.setVelocityY(2);
                }
            }

        } else {
            this.canWallJump = false;
        }
    }

        // PREVENT STICKY WALL
    preventImmediateGrab() {
        this.canGrab = false;
        this.time.delayedCall(this.WALL_GRAB_COOLDOWN, () => {
            this.canGrab = true;
            this.physics.world.gravity.y = 500;
        });
    }


    // BREEZE FUNCTIONS
    getBreezeDirection() {
        const playerTileX = this.breezeLayer.worldToTileX(my.sprite.player.x);
        const playerTileY = this.breezeLayer.worldToTileY(my.sprite.player.y);

        const tile = this.breezeLayer.getTileAt(playerTileX, playerTileY);

        return tile && tile.properties.direction ? tile.properties.direction : null;
    }


    // SPIKE FUNCTIONS

        // SPIKE COLLISION
    spikeCollision() {
        const playerTileX = this.spikesLayer.worldToTileX(my.sprite.player.x);
        const playerTileY = this.spikesLayer.worldToTileY(my.sprite.player.y);

        if (this.spikesLayer.getTileAt(playerTileX, playerTileY)) {
            this.playerDeath();
        }
    }

        // PLAYER DEATH
    playerDeath() {
        if (this.currentCheckpoint) {
            my.sprite.player.x = this.currentCheckpoint.x;
            my.sprite.player.y = this.currentCheckpoint.y;
        } else {
            my.sprite.player.x = 120;
            my.sprite.player.y = 256;
        }

        my.sprite.player.setVelocityX(0);
        my.sprite.player.setAcceleration(0);
    }


    // CHECKPOINT FUNCTIONS
    checkpointActivate(checkpoint) {
        if (this.currentCheckpoint != checkpoint) {
            this.currentCheckpoint = checkpoint;
        }
    }


    // CAMERA FUNCTION
    cameraCheck() {
        
        if (my.sprite.player.x < 400) {

            this.cameras.main.pan(100, 0, 1200, 'Power2');

        }
        
        if (my.sprite.player.x >= 400 && my.sprite.player.x < 790) {

            this.cameras.main.pan(570, 0, 1000, 'Power2');

        }
        
        if (my.sprite.player.x >= 790 && my.sprite.player.x < 1232) {

            this.cameras.main.pan(1032, 0, 1200, 'Power2');

        }

        if (my.sprite.player.x >= 1232) {

            this.cameras.main.pan(1500, 2, 1200, 'Power2');

        }
    }


    // CHAINS FUNCTIONS
    chainCheck() {
        this.physics.world.collide(my.sprite.player, this.chainsLayer);

        const playerTileX = this.chainsLayer.worldToTileX(my.sprite.player.x);
        const playerTileY = this.chainsLayer.worldToTileY(my.sprite.player.y);
        const playerTile = this.chainsLayer.getTileAt(playerTileX, playerTileY);
    
        if (playerTile && playerTile.properties.isClimbable) {
            my.sprite.player.body.setAllowGravity(false);

            if (this.cursors.up.isDown) {
                my.sprite.player.body.setVelocityY(-100);
            } else if (this.cursors.down.isDown) {
                this.player.VelocityY(100);
            } else {
                my.sprite.player.setVelocityY(0);
            }
            this.onChain = true;
            console.log("on chain");

        } else {
            my.sprite.player.body.setAllowGravity(true);
            this.onChain = false;
        }
    }
}