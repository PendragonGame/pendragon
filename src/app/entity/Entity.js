'use strict';

/**
 * @module entity/Entity
 */

const _ = require('lodash');
const uuid = require('../util/uuid');

let h;
let w;
let offx;
let offy;


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
 * @constructor Entity
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
    this.speed = 65;
    this.sprintSpeed = 140;
    this.attackStat = 100; // How much default damage this entity does -@nitgarg99
    this.defenseStat = 1;
    this.maxHP = 100;
    this.HP = 100;

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

    // /**
    //  * New Hitbox fix
    //  */
    // this.collideBox = game.add.sprite(0, 0, 'as');
    // game.physics.enable(this.collideBox, Phaser.Physics.ARCADE);
    // this.collideBox.anchor.setTo(-0.5);
    // // this.collideBox.visible = false;

    // // this.collideBox.frame = 12;
    // // this.collideBox.body.setSize(this.body.height/2, this.body.width/2);
    // this.collideBox.body.height = this.body.height/2;
    // this.collideBox.body.width = this.body.width/2;
    // this.addChild(this.collideBox);

    // Set size constants
    h = this.body.height;
    w = this.body.width;
    offx = this.body.offset.x;
    offy = this.body.offset.y;

    /**
     * States.
     * State can be 'idling', 'walking', 'attacking'
     */
    this.state = 'idling';
    this.idleTimer = 0;
    this.directionLimiter = 0;

    /**
     * Type and ID
     */
    this.type = 'generic';
    this.id = uuid();

    /**
     * Reputation and Gossip
     */
    this.reputation = 0;
    this.information = [];
    this.dislike = [];
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

     this.animations.add('idle_up', [104], 10, true);
     this.animations.add('idle_right', [143], 10, true);
     this.animations.add('idle_down', [130], 10, true);
     this.animations.add('idle_left', [117], 10, true);

     this.animations.add('die', [260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 271, 271,
                                 271, 271, 271, 271, 271, 271, 271, 271, 271, 271, 271, 271, 271, 271,
                                 271, 271, 271, 271, 271, 271, 271, 271, 271, 271, 271, 271, 271, 271,
                                 271, 271, 271, 271, 271, 271, 271, 271, 271, 271, 271, 271, 271, 271,
                                 271, 271, 271, 271, 271, 271, 271, 271, 271, 271, 271, 271, 271, 271,
                                 271, 271, 271, 271, 271, 271, 271, 271, 271, 271, 271, 271, 271, 271,
								 271, 271, 271, 271, 271, 271, 271, 271, 271, 271, 271, 271, 271, 271,
                                 271, 271, 271, 271, 271, 271, 271, 271, 271, 271, 271, 271, 271, 271,
								 271, 271, 271, 271, 271, 271, 271, 271, 271, 271, 271, 271, 271, 271,
                                 271, 271, 271, 271, 271, 271, 271, 271, 271, 271, 271, 271, 271, 271,
                                 271, 271, 271, 271, 271, 271, 271, 271, 271, 271, 271, 271, 271],
                                 1,
                                 false);


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
                        10, true);
    this.animations.add('slash_down',
                        [182, 183, 184, 185, 186, 187],
                        10, true);
    this.animations.add('slash_left',
                        [169, 170, 171, 172, 173, 174],
                        10, true);
    this.animations.add('slash_right',
                        [195, 196, 197, 198, 199, 200],
                        10, true);

	this.animations.add('shoot_up',
					   [208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220],
					   10, true);
	this.animations.add('shoot_left',
					   [221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233],
					   10, true);
	this.animations.add('shoot_down',
					   [234, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246],
					   10, true);
	this.animations.add('shoot_right',
					   [247, 248, 249, 250, 251, 252, 253, 254, 255, 256, 257, 258, 259],
					   10, true);
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
    if (this.state !== 'attacking' && this.state !== 'shooting') {
        this.state = 'walking';
        let speed = sprint ? this.sprintSpeed : this.speed;

        let animSpeed = speed*20/150;
        this.animations.currentAnim.speed = animSpeed;

        let dir = '';
        if (_.isString(direction) && _.includes(DIRECTIONS, direction)) {
            dir = direction.toLowerCase();
        } else if (_.isNumber(direction) && _.inRange(direction, 0, 4)) {
            dir = DIRECTIONS[direction];
        } else {
            console.error(direction);
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
        this.adjustHitbox('walk');
    }
};

Entity.prototype.idleHere = function() {
    this.state = 'idling';
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;
    this.animations.play('idle_' + this.direction, 1, false);
    this.adjustHitbox('idle');
};

Entity.prototype.attack = function() {
    self = this;
    // console.log('attacking');
    this.state = 'attacking';
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;
    this.animations.play('slash_' + this.direction, 20, false).onComplete.add(function() {
        // this.animations.frame
        // console.log('attack finished');
       self.idleHere();
    });
    this.adjustHitbox('slash');
};

Entity.prototype.shoot = function() {
    self = this;
    this.state = 'shooting';
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;
    this.animations.play('shoot_' + this.direction, 20, false).onComplete.add(function() {
       self.idleHere();
    });
};

Entity.prototype.injure = function() {
    self = this;
    this.state = 'injured';
};

Entity.prototype.die = function() {
    // const self = this;
    this.state = 'dead';
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;
    this.alive = false;
    // this.exists = false;
    this.animations.play('die', 15, false);
    const self = this;
    setTimeout(function() {
        self.kill();
    }, 20000);
};

/*
*  This function changes the size of the Entity's hit box based on what
*  action they are performing and what direction they are facing.
*/
Entity.prototype.adjustHitbox = function(state) {
    switch (state) {
        case ('walk'):
            this.body.height = h;
            this.body.width = w;
            this.body.offset.y = offy;
            this.body.offset.x = offx;
            break;
        case ('idle'):
            this.body.height = h;
            this.body.width = w;
            this.body.offset.y = offy;
            this.body.offset.x = offx;
            break;
        case ('slash'):
            switch (this.direction) {
                case ('up'):
                    this.body.height = 1.5 * h;
                    this.body.offset.y = h / 2;
                    break;
                case ('down'):
                    this.body.height = 1.5 * h;
                    break;
                case ('right'):
                    this.body.width = 1.5 * w;
                    break;
                case ('left'):
                    this.body.width = 1.5 * w;
                    this.body.offset.x = offx - (w / 2);
                    break;
            }
            break;
    }
};

/**
 * Set the direction of the sprite
 *
 * @param {string|number} direction
 */
Entity.prototype.setDirection= function(direction) {
    if (_.isString(direction) && _.includes(DIRECTIONS, direction)) {
        this.direction = direction.toLowerCase();
    } else if (_.isNumber(direction) && _.inRange(direction, 1, 5)) {
        this.direction = DIRECTIONS[direction];
    } else {
        console.error('Invalid direction');
    }
};

Entity.prototype.serialize = function() {
    let obj = {};
    obj.id = this.id;
    obj.x = this.x;
    obj.y = this.y;
    obj.key = this.key;
    obj.alive = this.alive;
    obj.type = this.type;
    obj.information = this.information;
    obj.reputation = this.reputation;
    if (this.type === 'player') {
        obj.score = this.score;
        obj.daysSurvived = this.daysSurvived;
    }
    return obj;
};

Entity.prototype.deserialize = function(obj) {
    this.id = obj.id;
    this.x = obj.x;
    this.y = obj.y;
    this.key = obj.key;
    this.alive = obj.alive;
    this.type = obj.type;
    this.information = obj.information;
    this.reputation = obj.reputation;
    if (this.type === 'player') {
        this.score = obj.score;
        this.daysSurvived = obj.daysSurvived;
    }
};

/**
 * Return the Name of the function.
 * This is a hack and should be used only for debugging.
 *
 * @return {string}
 */
Entity.prototype.toString = function() {
    let funcNameRegex = /function (.{1,})\(/;
    let results = (funcNameRegex).exec((this).constructor.toString());
    return (results && results.length > 1) ? results[1] : '';
 };


/**
 * Get the center of the Hitbox of the entity
 *
 * @return {Object} - Point with x and y
 */
Entity.prototype.trueXY = function() {
    const self = this;
    return {
        x: self.x + self.body.width/2 + self.body.offset.x,
        y: self.y + self.body.height/2 + self.body.offset.y,
    };
};

/**
 *
 *
 * @param {Object} rumor
 */
Entity.prototype.learnInfo = function(rumor) {
    if (!this.alive) return;
    if (this.information.some((e) => e.id === rumor.id)) {
        /**
         * Do nothing if we already know this information.
         */
        return;
    }
    console.debug('[' + this.id +'] Learning something new....');
    this.information.push(rumor);

	let positiveDialogue = ['Hi there', 'That\'s good', 'Thank you', 'Sweet', 'I\'m not worthy'];
	let negativeDialogue = ['Get him!', 'Screw you!', 'That person sucks!', 'You\'re dead!', 'Say good night!'];
	let r = Math.floor(Math.random() * positiveDialogue.length);
	let s = Math.floor(Math.random() * negativeDialogue.length);
    switch (rumor.action) {
        case 'kill':
            if (rumor.targetType === this.type) {
                 /**
                  * If the type that was killed was the same as
                  * the current `Entity`'s type, reputation drop by
                  * 0.1.
                  */
                this.reputation = Math.max(-1, this.reputation - 0.1);
                this.converse(negativeDialogue[s]);
            } else if (this.dislike.includes(rumor.targetType)) {
                /**
                 * If the current entity dislikes the type of entity
                 * that was killed,
                 * rep increases by 0.1
                 */
                this.reputation = Math.min(1, this.reputation + 0.25);
                this.converse(positiveDialogue[r]);
            }
    }
};

Entity.prototype.converse = function(text) {
    if (this.children[0]) {
        this.children[0].text = text;
        setTimeout(()=>{
            try {
            this.children[0].text = '';
            } catch (err) {
                // do nothing
            }
        }, 2000);
        return;
    }
    let chat = game.add.text(32, 0, text);
    chat.anchor.setTo(0.5);
    chat.font = 'Press Start 2P';
    chat.fill = '#ffff00';
    chat.fontSize = '1.5em';
    chat.stroke = 'black';
    chat.strokeThickness = '4';
    chat.align = 'center';
    setTimeout( ()=>{
        try {
            if (chat.text === text) chat.text = "";
        } catch (err) {
            // do nothing
        }
    }, 2000);
    this.addChild(chat);
};

/**
 * Entity module.
 * @module: entity/Entity
 */
module.exports = Entity;
