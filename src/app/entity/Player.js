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

    this.stateMachine.setDefaultStates();
    game.input.keyboard.addCallbacks(
        this,
        this.handleKeyDown,
        this.handleKeyUp,
        this.handleKeyPress);
}

Player.prototype = Object.create(Entity.prototype);
Player.prototype.constructor = Player;

Player.prototype.handleKeyDown = function(e) {
    console.log(e.keyCode);
    switch (e.keyCode) {
        case Phaser.Keyboard.W:
            this.stateMachine.action({
                name: 'walk',
                direction: 'up',
            });
            break;
        case Phaser.Keyboard.A:
            this.stateMachine.action({
                name: 'walk',
                direction: 'left',
            });
            break;
        case Phaser.Keyboard.S:
            this.stateMachine.action({
                name: 'walk',
                direction: 'down',
            });
            break;
        case Phaser.Keyboard.D:
            this.stateMachine.action({
                name: 'walk',
                direction: 'right',
            });
            break;
        case Phaser.Keyboard.SHIFT:
            this.stateMachine.action({
                name: 'sprint',
            });
            break;
        case Phaser.Keyboard.M:
            this.stateMachine.action({
                name: 'attack',
                loop: true,
            });
            break;
    }
};

Player.prototype.handleKeyUp = function(e) {
    console.log(e.keyCode);
    switch (e.keyCode) {
        case Phaser.Keyboard.W:
            this.stateMachine.action({
                name: 'idle',
                direction: 'up',
            });
            break;
        case Phaser.Keyboard.A:
            this.stateMachine.action({
                name: 'idle',
                direction: 'left',
            });
            break;
        case Phaser.Keyboard.S:
            this.stateMachine.action({
                name: 'idle',
                direction: 'down',
            });
            break;
        case Phaser.Keyboard.D:
            this.stateMachine.action({
                name: 'idle',
                direction: 'right',
            });
            break;
        case Phaser.Keyboard.SHIFT:
            this.stateMachine.action({
                name: 'walk',
            });
            break;
        case Phaser.Keyboard.M:
            this.stateMachine.action({
                name: 'idle',
            });
            break;
    }
};

Player.prototype.handleKeyPress = function(e) {
    console.log(e.keyCode);
    switch (e.keyCode) {
        case Phaser.Keyboard.M:
            this.stateMachine.action({
                name: 'attack',
            });
            break;
    }
};

Player.prototype.update = function() {

};

Player.prototype.collide = function() {
   this.stateMachine.action({
       name: 'idle',
   });
};

module.exports = Player;
