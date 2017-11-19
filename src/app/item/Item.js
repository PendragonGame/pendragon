'use strict';

/**
 * @module item/Item
 */

const _ = require('lodash');
const uuid = require('../util/uuid');

function Item(x, y, key, t) {
    Phaser.Sprite.call(this, game, x, y, key);
	this.height = 20;
	this.width = 20;
	game.add.existing(this);
    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.body.collideWorldBounds = true;
	this.body.maxVelocity = 0;
	
	this.type = t;
}

Item.prototype = Object.create(Phaser.Sprite.prototype);
Item.prototype.constructor = Item;

module.exports = Item;