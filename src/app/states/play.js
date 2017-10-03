'use strict';

const Player = require('../entity/Player');
const Enemy = require('../entity/NPC');

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
    game.add.existing(this.blockLayer);
    this.map.setCollisionBetween(1, 10000, true, this.blockLayer);
    this.map.setCollisionBetween(1, 10000, true, this.blockOverlap);
    this.blockLayer.resizeWorld();
    this.bgLayer.resizeWorld();

    // Input for game
    this.keyboard = game.input.keyboard;

    /**
     * Create the Player, setting location and naming as 'player'.
     * Giving him Physics and allowing collision with the world boundaries.
     */
    this.player = new Player(window.innerWidth/2, window.innerHeight/2, 'player');

    // Creating the enemy. Same procedure for as the player.
    this.enemy = new Enemy(window.innerWidth - 50, window.innerHeight/2 + 50, 'enemy');

    game.camera.follow(this.player);
};

let newDirection = 2, collideDirNPC = 0;
Play.update = function() {
    // ==================================================================================
    // NPC CODE
    // ==================================================================================
	
	// Intersection for NPC
    this.game.physics.arcade.collide(this.enemy, this.blockLayer, npcCollision, null, this);
    this.game.physics.arcade.collide(this.enemy, this.blockOverlap);

	//Generate random number 1-4 to be the new enemy direction. 
    let rand;
    rand = Math.round(Math.random() * 50) + 1; // This value is used to calculate the NPC's decision to change
    if (rand === 1) {							// directions. According to this, 1 out of 50 chance. 
        rand = Math.round(Math.random() * 4) + 1;
		if (rand !== collideDirNPC) newDirection = rand;
    }
	
	//Moving the enemy in a direction based on the generated number.
    switch (newDirection) {
        case 1: // Straight Up
            this.enemy.moveInDirection('up', false);
            break;
        case 2: // Straight Right
            this.enemy.moveInDirection('right', false);
            break;
        case 3: // Straight Down
            this.enemy.moveInDirection('down', false);
            break;
        case 4: // Straight Left
            this.enemy.moveInDirection('left', false);
            break;
    }


    // ========================================================================================
    // PLAYER CODE
    // ========================================================================================
	
	// Displays the hitbox for the Player
    //this.game.debug.body(this.player);

    // SHIFT for running
    let sprint = false;
    if ( this.keyboard.isDown(Phaser.Keyboard.SHIFT)) {
      sprint = true;
    }
	
	//Attack
	if ((this.keyboard.isDown(Phaser.Keyboard.M)) && (this.player.state !== 'attacking')) {                 
		this.player.attack();
	}        
	else { 
		//attacking == false iff we are on the last frame. ie. the whole animation has played.
		let temp = this.player.frame - 161;
		if ((temp % 13 === 0)) {
			if (!(this.keyboard.isDown(Phaser.Keyboard.M))) this.player.state = 'idling'; 
		}
	}
	
	//Moving the player, but only if you aren't attacking.
	if ( this.keyboard.isDown(Phaser.Keyboard.W)) {
		this.player.moveInDirection('up', sprint);
	} else if ( this.keyboard.isDown(Phaser.Keyboard.S)) {
		this.player.moveInDirection('down', sprint);
	} else if ( this.keyboard.isDown(Phaser.Keyboard.A)) {
		this.player.moveInDirection('left', sprint);
	} else if ( this.keyboard.isDown(Phaser.Keyboard.D)) {
		this.player.moveInDirection('right', sprint);
	} else if (this.player.state !== 'attacking'){
		this.player.idleHere();
	}

	// console.log("State: " + this.player.state);
	// Intersection for Player
    game.physics.arcade.collide(this.player, this.blockLayer, playerCollision, null, this);
    game.physics.arcade.collide(this.player, this.blockOverlap);
	
    // Deciding which character to render on top of the other.
    if ((this.player.y + this.player.height) > (this.enemy.y + this.enemy.height)) {
        this.game.world.bringToTop(this.player);
    } else {
		this.game.world.bringToTop(this.enemy);
	}
};

function playerCollision(){
	this.player.idleHere();
}

function npcCollision(){
	this.enemy.idleHere();
	collideDirNPC = newDirection;
	newDirection = 0;
}

module.exports = Play;
