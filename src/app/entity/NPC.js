'use strict';
/**
 * @module entity/NPC
 */
let Entity = require('./Entity');


/**
 * 
 * 
 * @param {any} x 
 * @param {any} y 
 * @param {any} key 
 * @constructor NPC
 */
function NPC(x, y, key) {
    Entity.call(this, x, y, key);

    /**
     * NPC Health.
     * 
     * Setting max HP to 100 by default.
     */
    this.maxHP = 100;
    this.HP = 100;
    this.sprintSpeed = 130;
	this.currency = 8;
    /**
     * Type of Entity
     */
    this.type = 'npc';

    /**
     * For all `NPC`s, I am defaulting the people they dislike
     * to monsters. This will be overridden in `Monster`.
     */
    this.dislike = ['monster'];

    /**
     * @todo(anand): Fix this hack
     * This is a major hack. We are setting all NPCs to IMMOVABLE!!
     */
    this.body.immovable = true;
}
NPC.prototype = Object.create(Entity.prototype);
NPC.prototype.constructor = NPC;

/**
 * This function tells an entity object to travel to a desired location
 * 
 * @param {number} x
 * @param {number} y
 * @param {navMesh} navMesh -navigation mesh object
 * @param {boolean} sprint if true go fast 
 * @return {boolean} return true if finished, otherwise false.
 */
NPC.prototype.gotoXY = function(x, y, navMesh, sprint = false) {
    // destination point
    const p2 = new Phaser.Point(x, y);
    // the entities location, respective to the center of its hit box
    const trueX = this.x+this.body.width /
    2 + this.body.offset.x;
    const trueY = this.y+this.body.height /
          2 + this.body.offset.y;
    const p1 = new Phaser.Point(trueX, trueY);
    // cool library magic
    const path = navMesh.findPath(p1, p2);
    /* 0. up
    *  1. right
    *  2. down
    *  3. left
    */
    if (path) {
        // check to see if the target location is reached within 5 units
        if (path.length === 2 && Math.abs(path[1].x - trueX) < 5
        && Math.abs(path[1].y - trueY) < 5) {
        if (this.state !== 'attacking') this.idleHere();
        return true;
}
    let currentTime = game.time.now;
    // limit the amount of direction changes to about 1 per 150 ms
    let curDir = this.direction;
    if (currentTime - this.directionLimiter >= 150) {
            // confusing code that ram won't understand
            Math.abs(path[1].x - trueX) >= Math.abs(path[1].y - trueY) ?
            this.moveInDirection(((path[1].x - trueX < 0)*2)+1, sprint) :
            this.moveInDirection((path[1].y - trueY > 0)*2, sprint);
            this.directionLimiter = currentTime;
    } else {
        if (curDir !== this.direction) this.idleHere();
    }
    } else {
        // if lost don't move
        this.idleHere();
        this.destinationX = undefined;
        this.destinationY = undefined;
    }
    return false;
};

/**
 * Allow an Entity object to wander 
 * @param {navMesh} navMesh the maps navigation mesh
 * @param {Phaser.Point} topLeft top left cornor of the bounds (x,y) default 0,0
 * @param {Phaser.Point} botRight bottom left cornor of the bounds (x,y) 
 * default map width,hieght
 */
NPC.prototype.wander = function(navMesh,
     topLeft = new Phaser.Point(0, 0),
      botRight = new Phaser.Point(game.world.width, game.world.height)) {
        if (this.state === 'dead') {
            return;
        }
    // check if the npc is still thinking about going somewhere
        if (this.idleTimer != 0) {
        this.idleTimer -= 1;
        return;
        }
    // check if the npc is en route, otherrwise find a new route
    if (!(this.destinationX && this.destinationY)) {
        this.destinationX = game.rnd.integerInRange(topLeft.x, botRight.x);
        this.destinationY = game.rnd.integerInRange(topLeft.y, botRight.y);
        if (Math.sqrt(Math.pow(this.destinationX - this.trueXY().x, 2) +
        Math.pow(this.destinationY - this.trueXY().y, 2)) > 256) {
            // reset if path is too long
            this.destinationX = undefined;
            this.destinationY = undefined;
        }
    }
    // if destination is reached, clear current destination.
    // add a random timer to wait before wandering elsewhere
    // max about 12 seconds
    if (this.gotoXY(this.destinationX, this.destinationY, navMesh)) {
        this.destinationX = undefined;
        this.destinationY = undefined;
        this.idleTimer = game.rnd.integerInRange(1, 1200);
    }
};
/**
 * Make the npc attack a target
 * @param {Entity} target target to attack
 * @param {navmesh} navMesh the navMesh of the map
 * @param {boolean=} sprint the navMesh of the map
 * @return {boolean} target no longer exists (probably dead)
 */
NPC.prototype.aggro = function(target, navMesh, sprint = true) {
    if (!target) {
        console.warn('target does not exist');
        this.idleHere();
        return true;
    }
    if (target.state === 'dead') {
        return true;
    }
    // check your location relative to target
    if (Math.abs(target.trueXY().x-this.trueXY().x)
     >= Math.abs(target.trueXY().y - this.trueXY().y)) {
         // approach from left
         if (target.trueXY().x-this.trueXY().x < 0) {
            if (this.gotoXY(target.trueXY().x+32, target.trueXY().y,
             navMesh, sprint)) {
                this.setDirection('left');
                this.attack();
            }
        } else {
            // approach from right
            if (this.gotoXY(target.trueXY().x-32, target.trueXY().y,
             navMesh, sprint)) {
                this.setDirection('right');
                this.attack();
            }
        }
    } else {
        // approach from up
        if (target.trueXY().y-this.trueXY().y < 0) {
            if (this.gotoXY(target.trueXY().x, target.trueXY().y+32,
             navMesh, sprint)) {
                this.setDirection('up');
                this.attack();
            }
        } else {
        // approach from down
            if (this.gotoXY(target.trueXY().x, target.trueXY().y-32,
             navMesh, sprint)) {
                this.setDirection('down');
                this.attack();
            }
        }
    }
};
/**
 * @param {navmesh} navMesh the navMesh of the map
 * @param {Phaser.Point} topLeft top left bounds the entity can wander in.
 * @param {Phaser.Point} botRight bottom right bounds the entity can wander in.
 * @param {Entity} player the player!
 * @param {string} behavior neutral or aggresive for now
 */
NPC.prototype.updateAI = function(navMesh, topLeft,
     botRight, player, behavior) {
    if (this.state === 'dead') return;
    this.aiStatus = behavior;
    switch (this.aiStatus) {
        case ('neutral'):
            this.wander(navMesh, topLeft, botRight);
            break;
        case ('aggressive'):
            if (Math.sqrt(Math.pow(player.trueXY().x - this.trueXY().x, 2) +
             Math.pow(player.trueXY().y - this.trueXY().y, 2)) < 300) {
                 // if in range aggro to player
                this.aggro(player, navMesh);
                this.aggroStatus = true;
            } else {
                if (this.aggroStatus) {
                    // aggro out of range, stop maybe? then continue wandering
                    this.idleHere();
                    this.aggroStatus = false;
                }
                // otherwise wander around
                this.wander(navMesh, topLeft, botRight);
            }
            break;
        default:
            console.warn('no behavior defined');
            break;
    }
};

module.exports = NPC;
