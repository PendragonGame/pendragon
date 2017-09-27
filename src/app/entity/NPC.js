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
}

NPC.prototype = Object.create(Entity.prototype);
NPC.prototype.constructor = NPC;

module.exports = NPC;
