'use strict';

const Player = require('../entity/Player');
const Monster = require('../entity/Monster');
const NPC = require('../entity/NPC');
const Factory = require('../factory/Factory');

const dataStore = require('../util/data');

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

    this.blockLayer.resizeWorld();
    this.bgLayer.resizeWorld();
    this.game = game;

    // Input for game
    this.keyboard = game.input.keyboard;


    /**
     * Generate a factory and a few monsters
     */
    this.monsterGroup = game.add.group();
    this.monsterFactory = new Factory(Monster, this.monsterGroup);
    for (let i = 0; i < 10; i++) {
        /**
         * Generate a random location withing 3/4ths of the map
         */
        let rndx = ((Math.random() * 0.75) + 0.125) * this.map.widthInPixels;
        let rndy = ((Math.random() * 0.75) + 0.125) * this.map.heightInPixels;
        this.monsterFactory.next(rndx, rndy, 'enemy');
    }

    /**
     * Generate a factory and a few NPCs
     */
    this.npcGroup = game.add.group();
    this.npcFactory = new Factory(NPC, this.npcGroup);
    for (let i = 0; i < 10; i++) {
        /**
         * Generate a random location withing 3/4ths of the map
         */
        let rndx = ((Math.random() * 0.5) + 0.025) * this.map.widthInPixels;
        let rndy = ((Math.random() * 0.5) + 0.025) * this.map.heightInPixels;
        this.npcFactory.next(rndx, rndy, 'woman');
    }

    /**
     * Create the Player, setting location and naming as 'player'.
     * Giving him Physics and allowing collision with the world boundaries.
     */
    this.player = new Player(window.innerWidth / 2,
        window.innerHeight / 2,
        'player');


    /**
     * Add all Entities to the same group.
     */
    this.entitiesGroup = game.add.group();
    this.entitiesGroup.addMultiple([
        this.player,
        this.npcGroup,
        this.monsterGroup,
    ]);

    /**
     * Center camera on player
     */
    this.game.camera.follow(this.player);

    this.map.setCollisionBetween(1, 10000, true, this.blockLayer);
    this.map.setCollisionBetween(1, 10000, true, this.blockOverlap);

    /**
     * Setting datastore callback interval
     */
    setInterval(this.storeState, 1000);
    /**
     * Debug Stuff
     */
};


let newDirection = 2;
let collideDirNPC = 0;
Play.update = function() {
    /**
     * Debug Stuff
     */
    // game.debug.body(this.monsterGroup);

    /**
     * Deal with collision of entities
     */
    game.physics.arcade.collide(this.entitiesGroup, this.blockLayer);
    game.physics.arcade.collide(this.entitiesGroup, this.blockOverlap);
    game.physics.arcade.collide(this.entitiesGroup, this.entitiesGroup,
                                entityCollision, null, this);

    /**
     * NPC Code
     */
    // Intersection for NPC
    // this.game.physics.arcade.collide(this.enemy, this.blockLayer,
    //                                     npcCollision, null, this);
    // this.game.physics.arcade.collide(this.enemy, this.blockOverlap);

    /**
     * Generate random number 1-4 to be the new enemy direction.
     * This value is used to calculate the NPC's decision to change
     * directions. According to this, 1 out of 50 chance.
     */
    // let rand;
    // rand = Math.round(Math.random() * 50) + 1;
    // if (rand === 1) {
    //     rand = Math.round(Math.random() * 4) + 1;
    //     if (rand !== collideDirNPC) newDirection = rand;
    // }

    // // Moving the enemy in a direction based on the generated number.
    // switch (newDirection) {
    //     case 1: // Straight Up
    //         this.enemy.moveInDirection('up', false);
    //         break;
    //     case 2: // Straight Right
    //         this.enemy.moveInDirection('right', false);
    //         break;
    //     case 3: // Straight Down
    //         this.enemy.moveInDirection('down', false);
    //         break;
    //     case 4: // Straight Left
    //         this.enemy.moveInDirection('left', false);
    //         break;
    // }


    /**
     * PLAYER CODE
     */

    // Displays the hitbox for the Player
    // this.game.debug.body(this.player);

    // SHIFT for running
    let sprint = false;
    if (this.keyboard.isDown(Phaser.Keyboard.SHIFT)) {
        sprint = true;
    }

    // Attack
    if ((this.keyboard.isDown(Phaser.Keyboard.M))
            && (this.player.state !== 'attacking')) {
        this.player.attack();
    } else {
        /**
         * attacking == false 
         * iff we are on the last frame. ie. the whole animation has played.
         */
        // 
        let temp = this.player.frame - 161;
        if ((temp % 13 === 0)) {
            if (!(this.keyboard.isDown(Phaser.Keyboard.M))) {
                this.player.state = 'idling';
            }
        }
    }

    // Moving the player, but only if you aren't attacking.

    if ( this.keyboard.isDown(Phaser.Keyboard.W)) {
        this.player.moveInDirection('up', sprint);
    } else if ( this.keyboard.isDown(Phaser.Keyboard.S)) {
        this.player.moveInDirection('down', sprint);
    } else if ( this.keyboard.isDown(Phaser.Keyboard.A)) {
        this.player.moveInDirection('left', sprint);
    } else if ( this.keyboard.isDown(Phaser.Keyboard.D)) {
        this.player.moveInDirection('right', sprint);
    } else if (this.player.state !== 'attacking') {
        this.player.idleHere();
    }

    /**
     * Deciding which character to render on top of the other.
     * 
     * @todo(anand): Only do this check for the nearest 4 neighbors.
     */
    // if ((this.player.y + this.player.height) > (this.enemy.y + this.enemy.height)) {
    //     this.game.world.bringToTop(this.player);
    // } else {
    //     this.game.world.bringToTop(this.enemy);
    // }
};


/**
 * Handle collision between two `Entities`
 * 
 * @param {any} entity1 
 * @param {any} entity2 
 */
function entityCollision(entity1, entity2) {
    /**
     * @todo(anand): Handle code to get injured
     */
    if (game.physics.arcade.collide(entity1, this.blockLayer)
    || game.physics.arcade.collide(entity1, this.blockOverlap)
    || game.physics.arcade.collide(entity2, this.blockLayer)
    || game.physics.arcade.collide(entity2, this.blockOverlap)) {
        return;
    }

    entity1.body.velocity.x = 0;
    entity1.body.velocity.y = 0;
    entity2.body.velocity.x = 0;
    entity2.body.velocity.y = 0;

    if (entity1.state == 'attacking') entity1.attack();
    else entity1.idleHere();

    if (entity2.state == 'attacking') entity2.attack();
    else entity2.idleHere();

    console.debug('[Collision] ' + entity1 + ' - ' + entity2);
}

Play.storeState = function() {
    dataStore.storeEntity(this.player);
    this.monsterGroup.forEachAlive(dataStore.storeEntity);
    this.npcGroup.forEachAlive(dataStore.storeEntity);
};

module.exports = Play;
