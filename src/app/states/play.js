'use strict';
const Player = require('../entity/Player');
const NavMesh = require('../ai/Nav-mesh.js');
const Monster = require('../entity/Monster');
const NPC = require('../entity/NPC');
const Factory = require('../factory/Factory');
const dataStore = require('../util/data');
const Map = require('../util/Map');
const Ripple = require('../ripple/engine');

const Sampling = require('discrete-sampling');

const _ = require('lodash');

let Play = {};

Play.init = function() {

};

Play.create = function() {
    const self = this;

    /**
     * Map creation
     */
    this.map = game.add.tilemap('map');
    this.map.addTilesetImage('outdoors', 'tileset');
    this.bgLayer = this.map.createLayer('bgLayer');
    this.bgOverlap2 = this.map.createLayer('bgOverlap2');
    this.bgOverlap = this.map.createLayer('bgOverlap');
    this.blockOverlap = this.map.createLayer('blkOverlap');
    this.blockLayer = this.map.createLayer('blkLayer');
    game.add.existing(this.blockLayer);

    this.blockLayer.resizeWorld();
    this.bgLayer.resizeWorld();
    this.game = game;

    this.navMesh = new NavMesh(this.map);

    // Input for game
    this.keyboard = game.input.keyboard;

    this.populateBoard();
    this.player.bringToTop();
    /**
     * Center camera on player
     */
    this.game.camera.follow(this.player);

    this.map.setCollisionBetween(1, 10000, true, this.blockLayer);
    this.map.setCollisionBetween(1, 10000, true, this.blockOverlap);

    /**
     * Day night cycle
     */
    this.light = game.add.graphics();
    this.light.beginFill(0x18007A);
    this.light.alpha = 0;
    this.light.drawRect(0, 0, game.camera.width, game.camera.height);
    this.light.fixedToCamera = true;
    this.light.endFill();
    this.dayTime = true;

    /**
     * HUD elements
     * 
     * @todo(anand): Can this be improved? May be making code slow.
     */
    this.wasd = game.add.sprite(0, 0, 'hud_wasd');
    this.wasd.y = window.innerHeight - this.wasd.height;
    this.wasd.fixedToCamera = true;

    this.wpn = game.add.sprite(0, 0, 'hud_weapon');
    this.wpn.width /= 2;
    this.wpn.height /= 2;
    this.wpn.x = window.innerWidth - this.wpn.width;
    this.wpn.fixedToCamera = true;

    this.textStyle = {
        font: 'bold 20px Consolas',
        fill: '#ffff00',
        align: 'center',
    };
    this.healthLabel = game.add.text(0, 5, 'Health', this.textStyle);
    this.healthLabel.fixedToCamera = true;
    this.repLabel = game.add.text(0, this.healthLabel.height + 10,
                                'Rep', this.textStyle);
    this.repLabel.fixedToCamera = true;

    this.scoreLabel = game.add.text(0, 0, 'Score: 0', this.textStyle);
    this.scoreLabel.x = window.innerWidth - (1.5 * this.scoreLabel.width);
    this.scoreLabel.y = window.innerHeight - this.scoreLabel.height;
    this.scoreLabel.fixedToCamera = true;

    this.dayLabel = game.add.text(0, 0, 'Score: 0', this.textStyle);
    this.dayLabel.x = window.innerWidth - (1.5 * this.dayLabel.width);
    this.dayLabel.y = window.innerHeight - (2 * this.dayLabel.height);
    this.dayLabel.fixedToCamera = true;

    this.emptyHealthBar = game.add.sprite(this.healthLabel.width + 5, 0,
                                            'hud_emptyHealth');
    this.emptyHealthBar.fixedToCamera = true;
    this.fullHealthBar = game.add.sprite(this.healthLabel.width + 7, 2,
                                            'hud_fullHealth');
    this.fullHealthBar.fixedToCamera = true;
    this.fullHealthBar.width /= 2;

    this.emptyRepBar = game.add.sprite(this.healthLabel.width + 5,
                                        this.emptyHealthBar.height,
                                        'hud_emptyHealth');
    this.emptyRepBar.fixedToCamera = true;
    this.fullRepBar = game.add.sprite(this.healthLabel.width + 7,
                                        this.emptyHealthBar.height + 2,
                                        'hud_fullRep');
    this.fullRepBar.fixedToCamera = true;
    this.fullRepBar.width /= 2;


    /**
     * Debug Stuff
     */

    this.monsterGroup.children[0].x = this.player.x + 140;
    this.monsterGroup.children[0].y = this.player.y+100;
    this.monsterGroup.children[1].x = this.player.x + 180;
    this.monsterGroup.children[1].y = this.player.y+170;


       /**
     * Setting datastore callback interval
     */

    setInterval(function() {
        dataStore.storeEntity(self.player);
        self.monsterGroup.forEachAlive(dataStore.storeEntity);
        self.npcGroup.forEachAlive(dataStore.storeEntity);
    }, 1000);

    /**
     * Build the datastructure keeping track of Entities
     * 
     * Period: 1.5 sec
     * 
     * What I did here is call the things immediately and then
     */
    // this.generateMap();
    (function mapGenerate() {
        let entities = [];
        // entities.push(this.player);
        // I see no point in adding the player
        self.monsterGroup.forEachAlive(function(monster) {
            entities.push(monster);
        });
        self.npcGroup.forEachAlive(function(npc) {
            entities.push(npc);
        });
        Map.create(entities);
        setTimeout(mapGenerate, 1500);
    })();
    this.rippleGossip = new Ripple();
};

Play.update = function() {
    while (this.fullHealthBar.width < 146) this.fullHealthBar.width += 1;
    this.scoreLabel.text = 'Score: ' + this.player.score;
    this.dayLabel.text = 'Day ' + this.player.daysSurvived;
    /**
     * Debug Stuff
     */
     // game.debug.body(this.player);
    // this.navMesh.navMesh.debugClear(); // Clears the overlay
     

     // day / night cycle
     if (this.dayTime) {
        this.light.alpha += .0001;
    } else {
        this.light.alpha -= .0007;
    }
    if (this.light.alpha <= 0 && this.dayTime === false) {
        this.dayTime = true;
        this.player.daysSurvived++;
       }
    if (this.light.alpha >= .5) {
        this.dayTime = false;
    }

    /**
     * Deal with collision of entities
     */
    game.physics.arcade.collide(this.entitiesGroup, this.blockLayer);
    game.physics.arcade.collide(this.entitiesGroup, this.blockOverlap);
    game.physics.arcade.collide(this.entitiesGroup, this.entitiesGroup,
        entityCollision, null, this);


    /**
     * NPC Code
     * 
     * Threshold distance to attack is 8 tiles.
     * => 4 tiles on either side
     * => Distance to player = 128
     * => 128^2 = 16384
     */
    let tL = new Phaser.Point(772, 448);
    let bR = new Phaser.Point(3426, 2893);
    let tL2 = new Phaser.Point(3151, 568);
    let bR2 = new Phaser.Point(4452, 3565);    
    for (let i = 0, len = this.npcGroup.children.length; i < len; i++) {
        this.npcGroup.children[i].updateAI(this.navMesh,
             tL, bR, this.player, 'neutral');
    }
    for (let i = 0, len = this.monsterGroup.children.length; i < len; i++) {
        this.monsterGroup.children[i].updateAI(this.navMesh,
             tL2, bR2, this.player, 'aggressive');
    }

    /**
     * PLAYER CODE
     */
    if (this.player.state === 'dead') return;
    // Displays the hitbox for the Player
    // this.game.debug.body(this.player);

    // SHIFT for running
    let sprint = false;
    if (this.keyboard.isDown(Phaser.Keyboard.SHIFT)) {
        sprint = true;
    }

    // Attack
    if ((this.keyboard.isDown(Phaser.Keyboard.M)) &&
        (this.player.state !== 'attacking')) {
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

    if (this.keyboard.isDown(Phaser.Keyboard.W)) {
        this.player.moveInDirection('up', sprint);
    } else if (this.keyboard.isDown(Phaser.Keyboard.S)) {
        this.player.moveInDirection('down', sprint);
    } else if (this.keyboard.isDown(Phaser.Keyboard.A)) {
        this.player.moveInDirection('left', sprint);
    } else if (this.keyboard.isDown(Phaser.Keyboard.D)) {
        this.player.moveInDirection('right', sprint);
    } else if (this.player.state !== 'attacking') {
        this.player.idleHere();
    }

    /**
     * Deciding which character to render on top of the other.
     * 
     * @todo(anand): Only do this check for the nearest 4 neighbors.
     */
    const self = this;
    let nearest4 = Map.nearest(this.player);
    _.forEach(nearest4, function(entity) {
        // console.log(JSON.stringify([entity[0].trueXY(), entity[1]]));
        if ((self.player.y + self.player.height) > (entity[0].y + entity[0].height)) {
            game.world.bringToTop(self.player);
            // console.log('player on top');
        } else {
            // console.log('entity on top');
            game.world.bringToTop(entity[0]);
        }
    });
};


/**
 * Handle collision between two `Entities`
 * 
 * This needs to be run in the context of Play state
 * 
 * @param {any} entity1 
 * @param {any} entity2 
 */
function entityCollision(entity1, entity2) {
    // entity2 seems to be the Player, and entity1 is the Enemy
    entity1.body.immovable = true;
    if (entity1.frame === 272) {
        entity1.kill();
        return;
    }
    if (entity2.frame === 272) {
        entity2.kill();
        return;
    }
    /**
     * @todo(anand): Handle code to get injured
     */
    if (game.physics.arcade.collide(entity1, this.blockLayer) ||
        game.physics.arcade.collide(entity1, this.blockOverlap) ||
        game.physics.arcade.collide(entity2, this.blockLayer) ||
        game.physics.arcade.collide(entity2, this.blockOverlap)) {
        return;
    }

    /**
     * @todo(anand): I think this needs to be made general to all Entities
     * 
     * We shouldn't be assuming that entity 2 is always going to be Player
     * also, other entities can attack too
     */
    /**
     * The type of person who died
     */
    let dead = null;
    let perp = null;
    let action = '';
    if (entity2.state == 'attacking') {
        entity2.attack();
        if (entity1.state !== 'dead') {
          dead = entity1;
          perp = entity2;
          action = 'kill';
          entity1.die();
          entity1.body.enable = false;
        }
    }
    if (entity1.state === 'attacking') {
        entity1.attack();
        if (entity2.state !== 'dead') {
          perp = entity1;
          dead = entity2;
          action = 'kill';
          entity2.die();
          entity2.body.enable = false;
        }
    }
    /**
     * @todo(anand): Need to implement Game Over
     */
    if (dead && perp && action) {
        if ((dead.type === 'monster' && perp.type === 'player' && action == 'kill')
        || (dead.type === 'npc' && perp === 'player' && action == 'kill')) {
         this.player.score++;
         let witness = Sampling.sample_from_array(Map.nearest(this.player, 3, 128), 1);
         this.rippleGossip.createRumor(
           witness,
           dead,
           perp,
           action
         );
       }
    }
}

Play.populateBoard = function() {
    let npcBounds = [
        [new Phaser.Point(1397, 1344), new Phaser.Point(1684, 1472)],
        [new Phaser.Point(778, 1328), new Phaser.Point(1065, 1553)],
        [new Phaser.Point(1660, 735), new Phaser.Point(1690, 1065)],
        [new Phaser.Point(1800, 2200), new Phaser.Point(3000, 2700)]];

     let monsterBounds = [
         [new Phaser.Point(3415, 2886), new Phaser.Point(3952, 1501)]];

    /**
     * Generate a factory and a few monsters
     */
    this.monsterGroup = game.add.group();
    this.monsterFactory = new Factory(Monster, this.monsterGroup,
         monsterBounds, 30);
    for (let i = 0; i < 30; i++) {
        /**
         * Generate a random location withing 3/4ths of the map
         */
        this.monsterFactory.next(null, null, 'enemy');
    }

    /**
     * Generate a factory and a few NPCs
     */
    this.npcGroup = game.add.group();
    this.npcFactory = new Factory(NPC, this.npcGroup, npcBounds, 40);
    for (let i = 0; i < 40; i++) {
        /**
         * Generate a random location withing 3/4ths of the map
         */
        this.npcFactory.next(null, null, 'woman');
    }

    /**
     * Create the Player, setting location and naming as 'player'.
     * Giving him Physics and allowing collision with the world boundaries.
     */
    this.player = new Player(game.world.width/2,
                            game.world.height/2 + 200,
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
};


Play.generateMap = function() {
    let entities = [];
    // entities.push(this.player);
    // I see no point in adding the player
    this.monsterGroup.forEachAlive(function(monster) {
        entities.push(monster);
    });
    this.npcGroup.forEachAlive(function(npc) {
        entities.push(npc);
    });
    Map.create(entities);

    setTimeout(this.generateMap, 1500);
};

/**
 * This will return the distance to the player squared.
 * 
 * Square root calculation is not trivial.
 * 
 * @param {Entity} entity 
 * @return {number}
 */
Play.getPlayerDistance2 = function(entity) {
    let player = this.player.trueXY();
    let e = entity.trueXY();
    return Math.pow(player.x - e.x, 2) + Math.pow(player.y - e.y, 2);
};


module.exports = Play;
