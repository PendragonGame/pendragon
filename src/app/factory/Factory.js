'use strict';

/**
 * 
 * 
 * @param {any} entity 
 * @param {any} group 
 * @param {number=} limit
 */
function Factory(entity, group, limit) {
    this.graveyard = []; // TODO: need to see if this is useful
    this.Entity = entity;
    this.group = group;
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
