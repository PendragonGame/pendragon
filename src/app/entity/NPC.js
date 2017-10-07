'use strict';

let Entity = require('./Entity');


/**
 * 
 * 
 * @param {any} x 
 * @param {any} y 
 * @param {any} key 
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

    /**
     * Type of Entity
     */
    this.type = 'npc';
}
NPC.prototype = Object.create(Entity.prototype);
NPC.prototype.constructor = NPC;

/**
 * This function tells an entity object to travel to a desired location
 * 
 * @param {number} x
 * @param {number} y
 * @param {navMesh} navMesh -navigation mesh object
 * @return {boolean} return true if finished, otherwise false.
 */
NPC.prototype.gotoXY = function(x, y, navMesh) {
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
        this.idleHere();
        return true;
}
    let currentTime = game.time.now;
    // limit the amount of direction changes to about 1 per 150 ms
    if (currentTime - this.directionLimiter >= 150) {
            // confusing code that ram won't understand
            Math.abs(path[1].x - trueX) >= Math.abs(path[1].y - trueY) ?
            this.moveInDirection(((path[1].x - trueX < 0)*2)+1, false) :
            this.moveInDirection((path[1].y - trueY > 0)*2, false);
            this.directionLimiter = currentTime;
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
    }
    // if destination is reached, clear current destination.
    // add a random timer to wait before wandering elsewhere
    // max about 12 seconds
    if (this.gotoXY(this.destinationX, this.destinationY, navMesh)) {
        this.destinationX = undefined;
        this.destinationY = undefined;
        this.idleTimer = game.rnd.integerInRange(1, 600);
    }
};
/**
 * Make the npc attack a target
 * @param {Entity} target target to attack
 * @param {navmesh} navMesh the navMesh of the map
 */
NPC.prototype.attack = function(target, navMesh) {
    this.gotoXY(target.trueXY().x, target.trueXY.y, navMesh);
};

NPC.prototype.aIUpdate = function() {

};

module.exports = NPC;
