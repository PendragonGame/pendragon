'use strict';

const _ = require('lodash');


/**
 * A lookup table for directions
 */
const DIRECTIONS = ['up', 'right', 'down', 'left'];

/**
 * The `Entity` class is the base class for all game entities.
 * It needs to have to following properties
 *  
 *  - Health    (Upto the child class to define)
 *  - Weapon
 *  - Inventory @todo
 *  - Factions @todo
 * 
 * It also cannot step outside world bounds.
 *  
 * @param {number} x - The x coordinate of `Entity` on the canvas
 * @param {number} y - The y coordinate of `Entity` on the canvas
 * @param {string} key - The key to the loaded spritesheet
 * 
 * @see Phaser.Sprite
 */
function Entity(x, y, key) {
    Phaser.Sprite.call(this, game, x, y, key);

    game.add.existing(this);
    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.body.collideWorldBounds = true;
    /**
     * Direction initialized to down. 
     * Must be changed only when new direction is chosen.
     */
    this.direction = 'down';

    /**
     * Begin with no weapon.
     * 
     * @todo: The weapons can be stored as an object with attributes.
     */
    this.weapon = null;

    /**
     * Miscellaneous attributes. 
     */
    this.speed = 60;
    this.sprintSpeed = 150;

    // Set the default animations
    this.setAnimations();
    game.physics.enable(this, Phaser.Physics.ARCADE);

    /**
     *  hitbox fix 
     */
    this.body.height = this.body.height / 2;
    this.body.width = this.body.width / 2;
    this.body.offset.x += this.body.width / 2;
    this.body.offset.y += this.body.height;
}

Entity.prototype = Object.create(Phaser.Sprite.prototype);
Entity.prototype.constructor = Entity;

/**
 * Set the animations of the `Entity`.
 * 
 * 
 * @param {object} frames - Object containing the animation frames
 */
Entity.prototype.setAnimations = function(frames) {
    if (frames !== undefined) {
        // Do something with frames
    }; // Else set to default animations

    /**
     * Adding animations for the `Entity`.
     * 
     * 1 sprite sheet contains every movement.
     * You target sections of the sprite sheet by using array[0...n],
     * where 0 is the top left corner of the image and n is the bottom
     * right corner of the image. Spritesheets and their corresponding integers
     * count left to right, top to bottom.
     */
    this.animations.add('idle_up', [104], 1, true);
    this.animations.add('idle_down', [130], 1, true);
    this.animations.add('idle_left', [117], 1, true);
    this.animations.add('idle_right', [143], 1, true);

    this.animations.add('walk_up',
                        [105, 106, 107, 108, 109, 110, 111, 112],
                        10, true);
    this.animations.add('walk_down',
                        [131, 132, 133, 134, 135, 136, 137, 138],
                        10, true);
    this.animations.add('walk_left',
                        [118, 119, 120, 121, 122, 123, 124, 125],
                        10, true);
    this.animations.add('walk_right',
                        [144, 145, 146, 147, 148, 149, 150, 151],
                        10, true);

    this.animations.add('slash_up',
                        [156, 157, 158, 159, 160, 161],
                        10, false);
    this.animations.add('slash_down',
                        [169, 170, 171, 172, 173, 174],
                        10, false);
    this.animations.add('slash_left',
                        [182, 183, 184, 185, 186, 187],
                        10, false);
    this.animations.add('slash_right',
                        [195, 196, 197, 198, 199, 200],
                        10, false);

    this.animations.play('idle_down');
};


/**
 * Method to move any `Entity`
 * 
 * The parameter `direction` has to be one of 'up', 'down', 'left' or 'right'.
 * 
 * Another option is to use:
 * 
 *  1. UP
 *  2. RIGHT
 *  3. DOWN
 *  4. LEFT 
 * 
 * @param {string|number} direction 
 * @param {Boolean} sprint - Whether to sprint or not
 */
Entity.prototype.moveInDirection = function(direction, sprint) {
    let speed = this.speed;
    let animSpeed = 10;
    if (sprint) {
        speed = this.sprintSpeed;
        animSpeed = 30;
    }

    let dir = '';
    if (_.isString(direction) && _.includes(DIRECTIONS, direction)) {
        dir = direction.toLowerCase();
    } else if (_.isNumber(direction) && _.inRange(direction, 1, 5)) {
        dir = DIRECTIONS[direction];
    } else {
        console.error('Invalid direction');
        return;
    }

    switch (dir) {
        case 'up':
            this.body.velocity.y = -speed;
            this.body.velocity.x = 0;
            this.direction = 'up';
            break;
        case 'down':
            this.body.velocity.y = speed;
            this.body.velocity.x = 0;
            this.direction = 'down';
            break;
        case 'right':
            this.body.velocity.x = speed;
            this.body.velocity.y = 0;
            this.direction = 'right';
            break;
        case 'left':
            this.body.velocity.x = -speed;
            this.body.velocity.y = 0;
            this.direction = 'left';
            break;
        default:
            console.error('Invalid direction');
            return;
    }
    this.animations.play('walk_' + dir, animSpeed, true);
};

Entity.prototype.idleHere = function() {
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;
    this.animations.play('idle_' + this.direction, 1, true);
};

/**
 * Entity module.
 * @module: entity/Entity
 */
module.exports = Entity;
