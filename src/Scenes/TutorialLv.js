class TutorialLv extends Phaser.Scene {
    constructor() {
        super("tutorialScene");
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
        this.timer = 0;
    }

    create() {
        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 45 tiles wide and 25 tiles tall.
        this.map = this.add.tilemap("wisp_tutorial", 16, 16, 96, 18);

        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("wisp_tilemap_packed", "wisp_tilemap_tiles");
        this.transparent = this.map.addTilesetImage("wisp_tilemap_transparent_packed", "wisp_transparent_tiles");
        this.UIsheet = this.map.addTilesetImage("tilemap_white_packed", "wisp_UI");
    
        
    // LAYERS


        // BACKGROUND LAYER
        // this.backLayer = this.map.createLayer("Back  ground", this.tileset, 0, 0);

        // UI LAYER
        this.SkipLayer = this.map.createLayer("Skip", this.UIsheet, 0, 0);
        this.Controls1Layer = this.map.createLayer("Controls1", this.UIsheet, 0, 0);

        this.Controls2Layer = this.map.createLayer("Controls2", this.UIsheet, 0, 0);
        this.Controls2Layer.setVisible(false);

        this.Controls3Layer = this.map.createLayer("Controls3", this.UIsheet, 0, 0);
        this.Controls3Layer.setVisible(false);
        
        this.Controls4Layer = this.map.createLayer("Controls4", this.UIsheet, 0, 0);
        this.Controls4Layer.setVisible(false);
        
        // WALL LAYER
        this.wallLayer = this.map.createLayer("Walls", this.tileset, 0, 0);

        // Make it collidable
        this.wallLayer.setCollisionByProperty({
            collides: true
        });

        // BUTTONS LAYER
        this.buttonsLayer = this.map.createLayer("Buttons", this.transparent, 0, 0);

        // Make it collidable
        this.buttonsLayer.setCollisionByProperty({
            collides: true
        });

        // PLATFORMS LAYER
        this.platformLayer = this.map.createLayer("Platforms", this.tileset, 0, 0);

        // Make it collidable
        this.platformLayer.setCollisionByProperty({
            collides: true
        });

        // END LAYER
        this.endLayer = this.map.createLayer("End", this.transparent, 0, 0);
        this.endLayer.setVisible(false);

        // Make it collidable
        this.endLayer.setCollisionByProperty({
            ends: true
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

        this.physics.world.enable(this.diamonds, Phaser.Physics.Arcade.STATIC_BODY);
        this.diamondGroup = this.add.group(this.diamonds);

        // SIGNS (TUTORIAL)
        this.signs = this.map.createFromObjects("Signs", {
            name: "sign",
            key: "transparent_sheet",
            frame: 77
        });

        this.physics.world.enable(this.signs, Phaser.Physics.Arcade.STATIC_BODY);
        this.signGroup = this.add.group(this.signs);


        this.currentSign = null;

            // SIGN TEXTS
        this.jumpControlsText = this.add.text(66, 166, 'to jump, press:\n\n\t\t\t\tor', {
            fontFamily: "'Micro 5'",
            fontSize: 15,
            resolution: 16,
        });
        this.jumpControlsText.visible = false;
        
        this.grabControlsText = this.add.text(302, 85, 'to grab onto\na wall, hold down:\n\t\t\t\t\t\t\t\t\tor\nin the direction\nof the wall', {
            fontFamily: "'Micro 5'",
            fontSize: 15,
            resolution: 16,
        });
        this.grabControlsText.visible = false;
        
        this.resetControlsText = this.add.text(270, 14, 'to reset the current level, press:', {
            fontFamily: "'Micro 5'",
            fontSize: 15,
            resolution: 16,
        });
        this.resetControlsText.visible = false;
        

    // PLAYER AVATAR

        // SET UP
        my.sprite.player = this.physics.add.sprite(15, 235, "wisp_idle");
        my.sprite.player.setCollideWorldBounds(true);
        my.sprite.player.body.setSize(12, 12);


        // COLLISIONS

            // WALLS
        this.physics.add.collider(my.sprite.player, this.wallLayer);

            // BUTTONS
        let titleOn = false;
        this.physics.add.collider(
            my.sprite.player,
            this.buttonsLayer,
            null,
            (player, button) =>
            {
                if (!this.titleOn)
                {
                    console.log("real")
                    this.titleActivate(button);
                }
            });

            // PLATFORMS
        this.physics.add.collider(
            my.sprite.player,
            this.platformLayer,
            null,
            (player, platform) =>
            {
                return player.body.velocity.y >= 0;
            });

            // END
        this.physics.add.collider(
            my.sprite.player,
            this.endLayer,
            null,
            (player, tile) =>
            {
                // consider making an endOfLv screen?
                console.log("end");
                this.sound.play("finishSFX");
                this.scene.start("platformerLv1Scene");
            });

            // BREEZE
        this.breezeDirection = this.getBreezeDirection();
        this.currentBreezeDirection = null;
            

            // DIAMONDS
        this.physics.add.overlap(my.sprite.player, this.diamondGroup, (obj1, obj2) => {
            this.sound.play("collectSFX");
            obj2.destroy();
        });

            // SIGNS
        let onSign = false;
        
        this.physics.add.overlap(my.sprite.player, this.signGroup, (obj1, obj2) => {
            this.signActivate(obj2)
            this.onSign = true;
        });

        
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
        this.sKey = this.input.keyboard.addKey('S');
        this.spaceKey = this.input.keyboard.addKey('SPACE');
        this.upKey = this.input.keyboard.addKey('UP');

        this.physics.world.drawDebug = false;

        my.vfx.walking = this.add.particles(0, 0, 'particle_1', {
            random: true,
            scale: {start: 0.3, end: 0.1},
            maxAliveParticles: 8,
            lifespan: 200,
            gravityY: -200,
            alpha: {start: 1, end: 0.1}, 
        });

        my.vfx.walking.stop();

    // CAMERA SETTINGS
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.setZoom(this.SCALE);
        this.cameras.main.centerOn(100, 0);
    
    

    // BASIC CONTROLS TEXT
        this.skipText = this.add.text(16 , 15, 'skip tutorial:', {
            fontFamily: "'Micro 5'",
            fontSize: 15,
            resolution: 16
        });

        this.moveText = this.add.text(16, 48, 'move left:\nmove right:', {
            fontFamily: "'Micro 5'",
            fontSize: 15,
            resolution: 16
        });
    

    // TITLE TEXT
        this.titleText = this.add.text(162, 30, 'Wisp', {
            fontFamily: "'Micro 5'",
            fontSize: 64,
            resolution: 16,
            fill: '#87CEEB',
            align: "center"
        });
        this.titleText.setAlpha(0);

        this.descText = this.add.text(110, 96, 'a game made by\nnathaniel valdenor and ashley knapp', {
            fontFamily: "'Micro 5'",
            fontSize: 16,
            resolution: 16,
            fill: '#87CEEB',
            align: "center"
        });
        this.descText.setAlpha(0);

    }

    update() {
        this.timer++;
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
                    if (this.timer > 10){
                        this.sound.play("walkSFX");
                        this.timer = 0;
                    }

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
                    if (this.timer > 10){
                        this.sound.play("walkSFX");
                        this.timer = 0;
                    }
    
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

        // PLAYER JUMP

        if((my.sprite.player.body.blocked.down || this.canWallJump) && (Phaser.Input.Keyboard.JustDown(this.spaceKey) || Phaser.Input.Keyboard.JustDown(this.upKey))) {
            this.sound.play("jumpSFX");

            if (this.canWallJump && !my.sprite.player.body.blocked.down && (cursors.left.isDown || cursors.right.isDown)) {
                my.sprite.player.setVelocityX(this.wallJumpDirection * this.WALL_JUMP_VELOCITY_X)
                this.canWallJump = false;
                this.physics.world.gravity.y = -700;
                this.preventImmediateGrab();
                // this.sound.play("jumpSFX");
                console.log("wall jumped :3");
            } else if (my.sprite.player.body.blocked.down) {
                my.sprite.player.setVelocityY(this.JUMP_VELOCITY);
            }
        }

        // PLAYER SLIDE

        if (this.canWallJump) {
            my.sprite.player.anims.play('slide')
            if (this.timer > 30){
                this.sound.play("slideSFX");
                this.timer = 0;
            }
        }

        // PLAYER FALL CHECK

        this.playerFallCheck();

    // RESTART

        if(Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.sound.play("restartSFX");
            this.titleOn = false;
            this.scene.restart();
        }

    // SKIP TUTORIAL
        if(Phaser.Input.Keyboard.JustDown(this.sKey)) {
            this.sound.play("collectSFX");
            this.scene.start("platformerLv1Scene");
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
                    my.sprite.player.setAccelerationX(-this.BREEZE_STRENGTH * 2);
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

        // CAMERA CHECKING
        this.cameraCheck();

        // SIGN CHECKING
        this.signCheck();

        // if (!this.onSign) {
        //     this.handleSignsOff()
        // }

        // this.onSign = false;
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


        // PLAYER DEATH
    playerFallCheck() {
        if (my.sprite.player.y >= 380) {
            this.sound.play("restartSFX");

            my.sprite.player.setVelocityX(0);
            my.sprite.player.setAcceleration(0);
            my.sprite.player.x = 15;
            my.sprite.player.y = 235;
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

    // SIGN FUNCTIONS
    signActivate(sign) {
        this.currentSign = sign;
    }

    signCheck() {
        if (this.currentSign) {
            switch (this.currentSign.data.list.num) {
                case 1:
                    this.jumpControlsText.visible = true;
                    this.Controls2Layer.setVisible(true);
                    break;
                case 2:
                    this.grabControlsText.visible = true;
                    this.Controls3Layer.setVisible(true);
                    break;
                case 3:
                    this.resetControlsText.visible = true;
                    this.Controls4Layer.setVisible(true);
            }
        }

    }

    // handleSignsOff() {
    //     if (this.currentSign) {
    //         switch (this.currentSign.data.list.num) {
    //             case 1:
    //                 this.jumpControlsText.visible = false;
    //                 this.Controls2Layer.setVisible(false);
    //             case 2:
    //                 this.grabControlsText.visible = false;
    //                 this.Controls3Layer.setVisible(false);
    //         }
    //     }
    // }


    // TITLE FUNCTION
    titleActivate(button) {
        this.map.putTileAt(163, button.x, button.y, true, this.buttonsLayer);
        
        this.tweens.add({
            targets: this.titleText,
            alpha: 1,
            duration: 1000,
            ease: 'Power2'
        });

        // Fade in the description text
        this.tweens.add({
            targets: this.descText,
            alpha: 1,
            duration: 1000,
            ease: 'Power2'
        });

        this.sound.play("collectSFX");
        this.titleOn = true;
    }
}