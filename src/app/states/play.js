'use strict';

const Player = require('../entity/Player');

let Play = {};

Play.init = function() {

};

Play.create = function() {
    // Anand did this part. I don't even know.
    this.map = game.add.tilemap('map1');
    this.map.addTilesetImage('outdoors', 'tileset');
    this.bgLayer = this.map.createLayer('bgLayer');
    this.bgOverlap = this.map.createLayer('bgOverlap');
    this.bgOverlap2 = this.map.createLayer('bgOverlap2');
    this.blockOverlap = this.map.createLayer('blkOverlap');
    this.blockLayer = this.map.createLayer('blkLayer');
    this.game.add.existing(this.blockLayer);
    this.map.setCollisionBetween(1, 10000, true, this.blockLayer);
    this.map.setCollisionBetween(1, 10000, true, this.blockOverlap);
    this.blockLayer.resizeWorld();
    this.bgLayer.resizeWorld();

    const navMeshPlugin = this.game.plugins.add(PhaserNavmesh);
    const navMesh = navMeshPlugin.buildMeshFromTiled(this.map, 'navmesh', 16);
    navMesh.enableDebug();
    navMesh.debugDrawMesh({
        drawCentroid: true, drawBounds: true,
         drawNeighbors: true, drawPortals: true,
    });
    const p1 = new Phaser.Point(window.innerWidth/2, window.innerHeight/2);
    const p2 = new Phaser.Point(window.innerWidth/2+200, window.innerHeight/2+200);
    const path = navMesh.findPath(p1, p2, {
        drawPolyPath: true, drawFinalPath: true,
    });

    // Input for game
    this.keyboard = game.input.keyboard;

    /**
     * Create the Player, setting location and naming as 'player'.
     * Giving him Physics and allowing collision with the world boundaries.
     */
    this.player = new Player(window.innerWidth/2, window.innerHeight/2, 'player');

    // Creating the enemy. Same procedure for as the player.
    this.enemy = game.add.sprite(window.innerWidth - 50, window.innerHeight/2 + 50, 'enemy');
    game.physics.enable(this.enemy, Phaser.Physics.ARCADE);
    this.enemy.body.collideWorldBounds = true;
    this.enemy.animations.add('walk4', [118, 119, 120, 121, 122, 123, 124, 125], 10, true);
    this.enemy.animations.add('walk1', [105, 106, 107, 108, 109, 110, 111, 112], 10, true);
    this.enemy.animations.add('walk3', [131, 132, 133, 134, 135, 136, 137, 138], 10, true);
    this.enemy.animations.add('walk2', [144, 145, 146, 147, 148, 149, 150, 151], 10, true);
    this.enemy.animations.add('lay', [260, 261, 262, 263, 264], 10, true);
    this.enemy.frame = 134;
    this.enemy.body.height = this.enemy.body.height / 2; // Changing the size of the hitbox
    this.enemy.body.width = this.enemy.body.width / 2;
    this.enemy.body.offset.x += this.enemy.body.width / 2;
    this.enemy.body.offset.y += this.enemy.body.height;
    this.game.camera.follow(this.player);
};

let newDirection = 0;
Play.update = function() {
    // Displays the hitbox for the Player
    //this.game.debug.body(this.player);

    // ================================================================================== 
    // NOTE: Directions are numbered 1-4, where Direction 1 is "Up", Direction 2 is 
    // "Right", and continuing clockwise about the Player ending at Direction 4, which is "Left".
    // ==================================================================================
    // ==================================================================================
    // MORE NOTE: The upcoming code is for the behavior of the NPC only. Code for the 
    // Player is organized after the NPC code.
    // ==================================================================================
    let enemySpeed = 0;

    let rand = 3;
    rand = Math.round(Math.random() * 50) + 1; // This value is used to calculate the NPC's decision to change
    if (rand === 1) {							// directions. According to this, 1 out of 1000 chance. Direction
        rand = Math.round(Math.random() * 4); // 0 (stationary) is a valid direction here. NPC can stop if he decides to.
        // newDirection = rand;
    }

    // This block handles what happens when the NPC hits walls, whether one at a time or in corners.
    // When the PNC hits a wall, a new number is generated in the range of viable directions that 
    // the NPC could choose. If the random number needs to go over 8, we subtract 8 to account for 
    // the 1-8 direction system.
    if (this.enemy.body.blocked.up === true) newDirection = 3;
    else if (this.enemy.body.blocked.down === true) newDirection = 1;
    else if (this.enemy.body.blocked.left === true) newDirection = 2;
    else if (this.enemy.body.blocked.right === true) newDirection = 4;

    this.enemy.direction = newDirection;
    // This block handles the movement of the NPC as well as its animation once the
    // direction has been determined.

    switch (newDirection) {
        case 0: // Not moving
            this.enemy.animations.stop(null, true);
            this.enemy.body.velocity.x = 0;
            this.enemy.body.velocity.y = 0;
            this.enemy.frame = 134;
            break;
        case 1: // Straight Up
            this.enemy.animations.play('walk1', 20, true);
            this.enemy.body.velocity.y = -enemySpeed;
            this.enemy.body.velocity.x = 0;
            break;
        case 2: // Straight Right
            this.enemy.animations.play('walk2', 20, true);
            this.enemy.body.velocity.x = enemySpeed;
            this.enemy.body.velocity.y = 0;
            break;
        case 3: // Straight Down
            this.enemy.animations.play('walk3', 20, true);
            this.enemy.body.velocity.y = enemySpeed;
            this.enemy.body.velocity.x = 0;
            break;
        case 4: // Straight Left
            this.enemy.animations.play('walk4', 20, true);
            this.enemy.body.velocity.x = -enemySpeed;
            this.enemy.body.velocity.y = 0;
            break;
    }

    // Intersection for NPC
    this.game.physics.arcade.collide(this.enemy, this.blockLayer);
    this.game.physics.arcade.collide(this.enemy, this.blockOverlap);


    // ========================================================================================
    //* **
    // THIS IS NOW THE CONTROLS FOR THE PLAYER
    //* **
    // ========================================================================================

    // SHIFT for running
    let sprint = false;
    if ( this.keyboard.isDown(Phaser.Keyboard.SHIFT)) {
      sprint = true;
    }

    if ( this.keyboard.isDown(Phaser.Keyboard.W)) {
        this.player.moveInDirection('up', sprint);
    } else if ( this.keyboard.isDown(Phaser.Keyboard.S)) {
        this.player.moveInDirection('down', sprint);
    } else if ( this.keyboard.isDown(Phaser.Keyboard.A)) {
        this.player.moveInDirection('left', sprint);
    } else if ( this.keyboard.isDown(Phaser.Keyboard.D)) {
        this.player.moveInDirection('right', sprint);
    } else {
        this.player.idleHere();
    }

    // Deciding which character to render on top of the other.
    if ((this.player.y + this.player.height) > (this.enemy.y + this.enemy.height)) {
        this.game.world.bringToTop(this.player);
    } else {
	this.game.world.bringToTop(this.enemy);
	}

    // Intersection for Player
    this.game.physics.arcade.collide(this.player, this.blockLayer);
    this.game.physics.arcade.collide(this.player, this.blockOverlap);
};


module.exports = Play;
