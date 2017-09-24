/**
 * Based on design by Jerome Renaux: https://github.com/Jerenaux/phaserquest/ 
 */



/**
 * The base implementation of all Beings.
 * A being should have the following abstractions: 
 * - Move in 4 directions
 * - Attack in 4 directions
 * - Idle facing all directions
 * 
 * This involves keeping track of and storing all animations.
 * 
 * Will be the ancestor for all living game objects
 * 
 * @param {any} x 
 * @param {any} y 
 * @param {any} key 
 */
function Being(x, y, key) {
    Phaser.Sprite.call(this, game, x, y, key)
    this.speed = 0;
    this.destination = null;
    game.add.existing(this)
}

Being.prototype = Object.create(Phaser.Sprite.prototype)
Being.prototype.constructor = Being





module.exports = Being