'use strict';

/**
 * @module item/Cannonball
 */

const _ = require('lodash');
const uuid = require('../util/uuid');

function Cannonball(x, y, key) {
    Phaser.Sprite.call(this, game, x, y, key);
	this.height = 20;
	this.width = 20;
	game.add.existing(this);
    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.body.collideWorldBounds = true;
	this.exploded = 0;
}

Cannonball.prototype = Object.create(Phaser.Sprite.prototype);
Cannonball.prototype.constructor = Cannonball;

Cannonball.prototype.explode = function() {
	this.exploded = 1;
	this.body.velocity.y = 0;
	this.body.immovable = true;
	this.body.moves = false;
	this.anchor.setTo(0.5, 0.9);
	this.height = 192;
	this.width = 192;
	this.loadTexture('cb_explode');
	this.animations.add('explode', 
						[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], 
						10, 
						false);
	const self = this;
	this.animations.play('explode', 15, false).onComplete.add(function() {
		self.destroy();
    });
};

module.exports = Cannonball;