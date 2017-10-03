'use strict';

/**
 * 
 * 
 * @param {any} entity 
 * @param {any} group 
 */
function Factory(entity, group) {
    this.graveyard = []; // TODO: need to see if this is useful
    this.Entity = entity;
    this.group = group;
}

/**
 * 
 * 
 * @param {number} x
 * @param {number} y
 * @param {any} key
 * @return {Entity}
 */
Factory.prototype.next = function(x, y, key) {
    let sprite = new this.Entity(x, y, key);
    this.group.add(sprite);
    return sprite;
};

module.exports = Factory;
