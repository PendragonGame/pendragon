'use strict';
/**
 * @module entity/Player
 */
let Entity = require('./Entity');
/**
 * 
 * 
 * @param {any} x 
 * @param {any} y 
 * @param {any} key
 * @constructor Player
 */
function Player(x, y, key) {
    Entity.call(this, x, y, key);

    /**
     * Player Health.
     * 
     * Setting max HP to 100 by default.
     */
	this.canSprint = 1;
    this.maxHP = 100;
    this.HP = 100;
    this.score = 0;
    this.daysSurvived = 1;
    this.currency = 0;
    this.defenseStat = 120;
	
	this.stamina = 100;
	this.maxStamina = 250;
	
	this.speed = 150;
    this.sprintSpeed = 260;
	
	this.currentWeapon = 0;
	
	this.weapons = ['Dagger', 'Bow'];
	this.food = [];
	this.misc = ['Tunic'];

    this.eatAgain = 1;

    this.type = 'player';
    this.converse('Press Escape for help');
}

Player.prototype = Object.create(Entity.prototype);
Player.prototype.constructor = Player;

Player.prototype.addToInventory = function(item, type) {
    switch (type) {
        case ('food'):
            this.food.push(item);
            break;
        case ('weapons'):
            this.weapons.push(item);
            break;
        case ('misc'):
            this.misc.push(item);
            break;
    }
    return;
};

// Player.prototype.die = function() {
//     Entity.die.call(this);
// };

module.exports = Player;