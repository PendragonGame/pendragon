'use strict';

let Entity = require('./Entity');


/**
 * 
 * 
 * @param {any} x 
 * @param {any} y 
 * @param {any} key 
 */
function Player(x, y, key) {
    Entity.call(this, x, y, key);

    /**
     * Player Health.
     * 
     * Setting max HP to 100 by default.
     */
    this.maxHP = 100;
    this.HP = 100;
}

Player.prototype = Object.create(Entity.prototype);
Player.prototype.constructor = Player;

module.exports = Player;
