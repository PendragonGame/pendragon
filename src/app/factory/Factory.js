'use strict';
/**
 * @module Factory
 */
const Map = require('../util/Map');

/**
 * 
 * @param {*} x 
 * @param {*} y 
 * @param {*} bounds
 * @return {boolean}
 */
function withinBounds(x, y, bounds) {
    for (let i = 0; i < bounds.length; i ++) {
        if (x >= bounds[i][0].x && x <= bounds[i][1].x
            && y >= bounds[i][0].y && y <= bounds[i][1].y) {
            return true;
        }
    }
    return false;
}

/**
 * 
 * @param {*} bounds 
 * @return {Object}
 */
function randInBounds(bounds) {
    let b = bounds[game.rnd.integerInRange(0, bounds.length -1 )];
    return {
        x: game.rnd.integerInRange(b[0].x, b[1].x),
        y: game.rnd.integerInRange(b[0].y, b[1].y),
    };
}

/**
 * 
 * 
 * @param {any} entity 
 * @param {any} group 
 * @param {Array} bounds
 * @param {number=} limit
 */
function Factory(entity, group, bounds, limit) {
    if (entity === undefined || bounds === undefined) {
        throw new TypeError('Undefined type?');
    }
    this.Entity = entity;
    this.group = group;
    this.bounds = bounds;
    this.limit = limit || Infinity;
    this.generated = 0;
}

/**
 * This will return a new `Entity` if the number of existing
 * `Entities` has not exceeded the `limit`.
 * 
 * @param {number} x
 * @param {number} y
 * @param {any} key
 * @return {Entity}
 */
Factory.prototype.next = function(x, y, key) {
    /**
     * Return nothing if limit has been reached
     */
    let living = this.group.countLiving();
    if ( living >= this.limit) return;
    if (x === null || y === null || !withinBounds(x, y, this.bounds)) {
        let o = randInBounds(this.bounds);
        x = o.x;
        y = o.y;
    }

    /**
     * Else, return a new entity and add it to the list.
     */
    let sprite = new this.Entity(x, y, key);
    this.group.add(sprite);
    sprite.setDirection(Math.floor(Math.random() * 4) + 1);
    sprite.idleHere();
    return sprite;
};

module.exports = Factory;
