'use strict';
const UI = require('../ui/ui');
const Player = require('../entity/Player');
const NavMesh = require('../ai/Nav-mesh.js');
const Monster = require('../entity/Monster');
const NPC = require('../entity/NPC');
const Factory = require('../factory/Factory');
const dataStore = require('../util/data');
const Map = require('../util/Map');
const Ripple = require('../ripple/engine');
let electron = require('electron');
let window = electron.remote.getCurrentWindow();

const Sampling = require('discrete-sampling');

const _ = require('lodash');
const npcBounds = [
    [new Phaser.Point(1397, 1344), new Phaser.Point(1684, 1472)],
    [new Phaser.Point(778, 1328), new Phaser.Point(1065, 1553)],
    [new Phaser.Point(1660, 735), new Phaser.Point(1690, 1065)],
    [new Phaser.Point(1800, 2200), new Phaser.Point(3000, 2700)],
];

const monsterBounds = [
    [new Phaser.Point(3510, 2907), new Phaser.Point(3908, 3458)],
    [new Phaser.Point(3464, 688), new Phaser.Point(3868, 1274)],
];

let loadedData = null;
let timerIDs = [];

let Play = {};

Play.init = function(data) {
    if (data) {
        loadedData = data;
    };
};

Play.setLoadData = function(data) {
    loadedData = data;
};

Play.preload = function() {
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
    this.keyboard.onDownCallback = ()=> {
        switch (game.input.keyboard.event.keyCode) {
            // 27 = escape
            case 27:
                this.pauseGame();
                break;

            default:
                break;
        }
    };

    /**
     * HUD elements
     * 
     * @todo(anand): Can this be improved? May be making code slow.
     */

    this.wpn = game.add.sprite(0, 0, 'hud_weapon');
    this.wpn.width /= 2;
    this.wpn.height /= 2;
    this.wpn.x = game.camera.width - this.wpn.width;
    this.wpn.fixedToCamera = true;


    this.textStyle = {
        font: 'Press Start 2P',
        fill: '#ffff00',
        align: 'center',
        fontSize: '2em',
        stroke: 'black',
        strokeThickness: '5',
    };
    this.healthLabel = game.add.text(0, 5, 'Health', this.textStyle);
    this.healthLabel.fixedToCamera = true;
    this.repLabel = game.add.text(0, this.healthLabel.height + 10,
        'Rep', this.textStyle);
    this.repLabel.fixedToCamera = true;

    this.scoreLabel = game.add.text(0, 0, 'Score: 0', this.textStyle);
    this.scoreLabel.x = game.camera.width - (1.5 * this.scoreLabel.width);
    this.scoreLabel.y = game.camera.height - this.scoreLabel.height;
    this.scoreLabel.fixedToCamera = true;

    this.dayLabel = game.add.text(0, 0, 'Score: 0', this.textStyle);
    this.dayLabel.x = game.camera.width - (1.5 * this.dayLabel.width);
    this.dayLabel.y = game.camera.height - (2 * this.dayLabel.height);
    this.dayLabel.fixedToCamera = true;

    this.emptyHealthBar = game.add.sprite(this.healthLabel.width + 5, 0,
        'hud_emptyHealth');
    this.emptyHealthBar.fixedToCamera = true;
    this.emptyHealthBar.height = 20;
    this.fullHealthBar = game.add.sprite(this.healthLabel.width + 7, 2,
        'hud_fullHealth');
    this.fullHealthBar.fixedToCamera = true;
    this.fullHealthBar.width /= 2;
    this.fullHealthBar.height = 20;

    this.emptyRepBar = game.add.sprite(this.healthLabel.width + 5,
        this.emptyHealthBar.height + 5,
        'hud_emptyHealth');
    this.emptyRepBar.fixedToCamera = true;
    this.emptyRepBar.height = 20;
    this.fullRepBar = game.add.sprite(this.healthLabel.width + 7,
        this.emptyHealthBar.height + 7,
        'hud_fullRep');
    this.fullRepBar.fixedToCamera = true;
    this.barRealWidth = this.fullRepBar.width;
    this.fullRepBar.width /= 2;
    this.fullRepBar.height = 20;


    this.hudGroup = game.add.group();
    this.hudGroup.addMultiple([
        this.wpn,
        this.healthLabel,
        this.repLabel,
        this.scoreLabel,
        this.dayLabel,
        this.emptyHealthBar,
        this.fullHealthBar,
        this.emptyRepBar,
        this.fullRepBar,
    ]);
};

/**
 * pauses the game
 */
Play.pauseGame = function() {
    game.paused ? game.paused = false : game.paused = true;
    if (game.paused) {
        // reveal pause menu
        for (let i = 0; i < this.pauseMenu.length; i++) {
            this.pauseMenu[i].reveal();
            this.pauseBg.visible = true;
            this.controlText.visible = true;
        }
    } else {
        // hide the menu
        for (let i = 0; i < this.pauseMenu.length; i++) {
            this.pauseMenu[i].hide();
            this.pauseBg.visible = false;
            this.controlText.visible = false;
        }
    }
};

Play.create = function() {
    // this.player.bringToTop();
    /**
     * Check if we should load game.
     */
    if (loadedData) {
        this.loadBoard(loadedData);
    } else {
        this.populateBoard();
    }
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
     * Pause menu set up
     */
    this.pauseMenu = [];
    // pause background
    this.pauseBg = game.add.graphics();
    this.pauseBg.beginFill(0x0);
    this.pauseBg.alpha = .2;
    this.pauseBg.visible = false;
    this.pauseBg.drawRect(0, 0, game.camera.width, game.camera.height);
    this.pauseBg.fixedToCamera = true;
    // controls
    this.controlText = game.add.text(game.camera.width/2, 600, 'Up:    W   Left:   A\nDown:  S   Right:  D\nMelee: M   Sprint: Shift');
    this.controlText.font = 'Press Start 2P';
    this.controlText.fill = '#ff5100';
    this.controlText.stroke = '#0';
    this.controlText.strokeThickness = 5;
    this.controlText.fontSize = '3em';
    this.controlText.anchor.setTo(.5, .5);
    this.controlText.align = 'left';
    this.controlText.fixedToCamera = true;
    this.controlText.visible = false;
    // add a save button
    this.pauseMenu.push(new UI.MenuButton(game.camera.width/2,
         200, '  Save  ', null, ()=>{
            console.log('Manually saving');
            this.pauseMenu[0].text.text = '  Save ' +
             String.fromCodePoint(0x1F60A);
            setTimeout(()=> {
                this.pauseMenu[0].text.text = '  Save  ';
            }, 750);
            dataStore.manualSaveState();
         }, '4.5em' ));
    // add a settings button
    this.pauseMenu.push(new UI.MenuButton(game.camera.width/2,
         300, window.isFullScreen() ? 'Windowed' : 'Fullscreen',
          null, ()=>{
            console.log('fulscreen toggled');
            game.paused = false;
            window.setResizable(true);
            window.setFullScreenable(true);
            if (window.isFullScreen()) {
                window.setFullScreen(false);
                this.pauseMenu[1].text.text = 'Fullscreen';
            } else {
                window.setFullScreen(true);
                this.pauseMenu[1].text.text = 'Windowed';
            }
            window.setResizable(false);
            window.setFullScreenable(false);
            game.paused = true;
         }, '4.5em' ));
    // add a menu button
    this.pauseMenu.push(new UI.MenuButton(game.camera.width/2,
        400, 'Main Menu', null, ()=>{
           game.input.keyboard.onDownCallback = null;
           game.state.start('Menu');
           game.paused = false;
        }, '4.5em' ));

    // hide the pause menu
    for (let i = 0; i < this.pauseMenu.length; i++) {
        this.pauseMenu[i].text.fill = '#00bbff';
        this.pauseMenu[i].text.stroke = '#0';
        this.pauseMenu[i].text.strokeThickness = 5;
        this.pauseMenu[i].hide();
    }

    /**
     * Setting datastore callback interval
     * 
     * Start autosaving 10 seconds after game starts
     */
    let i = setInterval(() => {
        dataStore.autosaveEntity(this.player);
        this.monsterGroup.forEachAlive(dataStore.autosaveEntity);
        this.npcGroup.forEachAlive(dataStore.autosaveEntity);
    }, 1000);
    timerIDs.push(i);

    game.world.bringToTop(this.hudGroup);

    this.rippleGossip = new Ripple();
    i = setInterval(() => {
         /**
         * Trigger a few conversations
         */
        /**
         * Build the datastructure keeping track of Entities
         * 
         * Period: 1.5 sec
         * 
         * What I did here is call the things immediately and then
         */
        this.generateMap();
        let totalEntities =
            this.monsterGroup.total +
            this.npcGroup.total;
        Map.discreteSamples(Math.floor(totalEntities/3)).forEach(function(p, i) {
            this.rippleGossip.triggerGossip(p);
        }, this);
    }, 1000);
};

Play.update = function() {
    if (this.player.state === 'dead') {
        game.score = this.player.score;
        game.dayCount = this.player.daysSurvived;
        setTimeout(() => {
            game.state.start('Game Over');
        }, 2000);
    }
    while (this.fullHealthBar.width < 146) this.fullHealthBar.width += 1;
    this.scoreLabel.text = 'Score: ' + this.player.score;
    this.dayLabel.text = 'Day ' + this.player.daysSurvived;
    /**
     * Debug Stuff
     */
    // game.debug.body(this.player);

    // day / night cycle
    if (this.dayTime) {
        this.light.alpha += .0001;
    } else {
        this.light.alpha -= .0007;
    }
    if (this.light.alpha <= 0 && this.dayTime === false) {
        this.dayTime = true;
        this.player.daysSurvived++;
        this.light.alpha = 0;
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

    this.npcGroup.forEachAlive((e) => {
        /**
         * NOTE(anand):
         * 
         * At this point, the NPC can either attack the player
         * or run away if they dont like the player
         * or do nothing otherwise.
         * 
         * What I will do is this.
         * 
         * If Reputation is below 0 (it will always be >= -1):
         * Generate a random number between -1 and 0. 
         * - If the number lies between -1 and the reputation
         *   - avoid the player
         * - Else
         *   - attck the player
         * Else (Rep >= 0)
         * - wander
         */
        let attitude = 'neutral';
        if (e.reputation < 0) {
            let decision = -Math.random();
            if (decision > e.reputation) {
                attitude = 'aggressive';
            }
        }
        e.updateAI(this.navMesh, tL, bR, this.player, attitude);
    });
    this.monsterGroup.forEachAlive((e) => {
        /**
         * NOTE(anand):
         * 
         * For monster, I will attack regardless,
         * but I will sprint if I realllllly don't
         * like the player (less than -0.8?)
         */
        let attitude = 'aggressive';
        if (e.reputation < -0.8) {
            // Really aggro
            e.slowSprint = e.sprintSpeed;
            e.sprintSpeed = 2 * e.slowSprint;
        }
        e.updateAI(this.navMesh, tL2, bR2, this.player, attitude);
    });

    /**
     * PLAYER CODE
     */
    if (this.player.state === 'dead') return;
    // Displays the hitbox for the Player
    // this.game.debug.body(this.player);
    // game.debug.body(this.player.collideBox);
    // game.debug.bodyInfo(this.player.collideBox, 32, 32);

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
    let nearest4 = Map.nearest(this.player);
    nearest4.forEach((entity) => {
        // console.log(JSON.stringify([entity[0].trueXY(), entity[1]]));
        if ((this.player.y + this.player.height) >
         (entity[0].y + entity[0].height)) {
            game.world.bringToTop(this.player);
            // console.log('player on top');
        } else {
            // console.log('entity on top');
            game.world.bringToTop(entity[0]);
        }
    });

    let totalEntities =
        this.monsterGroup.total +
        this.npcGroup.total;
    let repNum = 0;
    let repSum = 0;
    Map.nearest(this.player, totalEntities, game.camera.width / 2)
        .forEach((point) => {
            /**
             * Get the average reputation of all the entities withing
             * the screen.
             */
            if (point[0].alive) {
                repSum += point[0].reputation;
                repNum += 1;
            }
        });
    let avgRep = (isNaN(repSum / repNum)) ? 0 : repSum / repNum;
    // console.log('Average Reputation: ' + avgRep);
    this.fullRepBar.width = (this.barRealWidth / 2) * (1 + (avgRep));
    if (this.fullRepBar.width < this.barRealWidth / 2) {
        this.fullRepBar.tint = 0x800000;
    } else if (this.fullRepBar.width > this.barRealWidth / 2) {
        this.fullRepBar.tint = 0x66ff33;
    } else {
        this.fullRepBar.tint = 0x999999;
    }
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
            entity1.die();
            entity1.body.enable = false;
        }
        dead = entity1;
        perp = entity2;
        action = 'kill';
    }
    if (entity1.state === 'attacking') {
        entity1.attack();
        if (entity2.state !== 'dead') {
            entity2.die();
            entity2.body.enable = false;
        }
        perp = entity1;
        dead = entity2;
        action = 'kill';
    }
    /**
     * @todo(anand): Need to implement Game Over
     */
    if (dead && perp && action) {
        if (perp.type === 'player') {
            switch (dead.type) {
                case 'npc':
                    console.log('Killed an NPC :(');
                    break;
                case 'monster':
                    this.player.score++;
                    break;
            }
        }
        
        // let nearest = Map.nearest(this.player, 3, 256);
        // nearest.forEach(function(p, i) {
        //     if (p[0].state !== 'dead') {
        //         let witness =p[0];
        //         this.rippleGossip.createRumor(
        //             witness,
        //             dead,
        //             perp,
        //             action);
        //     }
        // }, this);
        let nearest = Map.nearest(this.player, 3, 256);
        let numWitnesses = Math.floor(Math.random() * nearest.length);
        let witnesses = Sampling.sample_from_array(nearest, numWitnesses, false);
        
        if (!witnesses) return;
        witnesses.forEach(function(p, i) {
            if (p[0].state !== 'dead') {
                let witness =p[0];
                this.rippleGossip.createRumor(
                    witness,
                    dead,
                    perp,
                    action);
            }
        }, this);
    }
}

Play.populateBoard = function() {
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
    this.player = new Player(1971,
        504,
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

Play.loadBoard = function(data) {
    let playerData = data.player;
    let monstersData = data.monsters;
    let npcData = data.npc;

    /**
     * Generate a factory and a few monsters
     */
    this.monsterGroup = game.add.group();
    this.monsterFactory = new Factory(Monster, this.monsterGroup,
        monsterBounds, Object.keys(monstersData).length);
    let i = 0;
    for (let id in monstersData) {
        if (Object.prototype.hasOwnProperty.call(monstersData, id)) {
            i = i + 1;
            // console.debug('Monster #' + i);
            let e = monstersData[id];
            let E = this.monsterFactory.next(e.x, e.y, e.key);
            E.deserialize(e);
        }
    }

    /**
     * Generate a factory and a few NPCs
     */
    i = 0;
    this.npcGroup = game.add.group();
    this.npcFactory = new Factory(NPC, this.npcGroup, npcBounds,
        Object.keys(npcData).length);
    for (let id in npcData) {
        if (Object.prototype.hasOwnProperty.call(npcData, id)) {
            i = i + 1;
            // console.debug('NPC #' + i);
            let e = npcData[id];
            let E = this.npcFactory.next(e.x, e.y, e.key);
            E.deserialize(e);
        }
    }

    /**
     * Create the Player, setting location and naming as 'player'.
     * Giving him Physics and allowing collision with the world boundaries.
     */
    this.player = new Player(playerData.x, playerData.y, playerData.key);
    this.player.deserialize(playerData);

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
    // setTimeout(() => {
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
    // }, 1500);
};

Play.autosaveData = function() {
    setTimeout(() => {
        dataStore.autosaveEntity(this.player);
        this.monsterGroup.forEachAlive(dataStore.autosaveEntity);
        this.npcGroup.forEachAlive(dataStore.autosaveEntity);
    }, 1000);
};

Play.manualSaveData = function() {
    const self = this;
    dataStore.manualSaveEntity(sel.player);
    self.monsterGroup.forEachAlive(dataStore.manualSaveEntity);
    self.npcGroup.forEachAlive(dataStore.manualSaveEntity);
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

Play.shutdown = function() {
    if (this.rippleGossip) {
        this.rippleGossip.kill();
    }
    timerIDs.forEach((id) => {
        clearInterval(id);
    });
};

Phaser.Tilemap.prototype.setCollisionBetween = function(start, stop,
    collides, layer, recalculate) {
       if (collides === undefined) {
collides = true;
}
       if (layer === undefined) {
layer = this.currentLayer;
}
       if (recalculate === undefined) {
recalculate = true;
}

       layer = this.getLayer(layer);

       for (let index = start; index <= stop; index++) {
           if (collides) {
               this.collideIndexes.push(index);
           } else {
               let i = this.collideIndexes.indexOf(index);

               if (i > -1) {
                   this.collideIndexes.splice(i, 1);
               }
           }
       }

       for (let y = 0; y < this.layers[layer].height; y++) {
           for (let x = 0; x < this.layers[layer].width; x++) {
               let tile = this.layers[layer].data[y][x];

               if (tile && tile.index >= start && tile.index <= stop) {
                   if (collides) {
                       tile.setCollision(true, true, true, true);
                   } else {
                       tile.resetCollision();
                   }

                   tile.faceTop = collides;
                   tile.faceBottom = collides;
                   tile.faceLeft = collides;
                   tile.faceRight = collides;
               }
           }
       }

       if (recalculate) {
           //  Now re-calculate interesting faces
           this.calculateFaces(layer);
       }

       return layer;
   };

module.exports = Play;
