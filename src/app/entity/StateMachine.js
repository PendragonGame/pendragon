'use strict';

const _ = require('lodash');
/**
 * A lookup table for directions
 */
const DIRECTIONS = ['up', 'right', 'down', 'left'];

/**
 * State Machine for `Entity`
 * @class
 * @param {Entity} entity - Reference to the `Entity`
 * @param {string} initState - The initial state of the `Entity`
 */
function StateMachine(entity, initState) {
    this.entity = entity;
    this.states = {};
    this.current = initState || 'idle';
}

/**
 * @param {string} stateName - Name of state.
 * @param {Object} state - State object
 * @param {enter} state.enter - Initializer of state
 * @param {update} state.update - Initializer of state
 * @param {exit} state.exit - Initializer of state
 * 
 * 
 * @callback enter
 * 
 * @callback update
 * @param {Object} command - Command to give current state
 * @param {string} command.name - Name of command. eg. 'walk'
 * @param {any} command.property - Name can be different. Extra info to pass.
 * 
 * @callback exit
 */
StateMachine.prototype.addState = function(stateName, state) {
    if (typeof state.enter === undefined ||
        typeof state.exit === undefined ||
        typeof state.update == undefined) {
        console.error('Incorrect state object');
        return;
    }
    this.states[stateName] = state;
    this.states[stateName].entity = this.entity;
};

StateMachine.prototype.action = function(command) {
    let next = this.states[this.current].update(command);
    if (next && next !== this.current) {
        this.states[this.current].exit();
        this.current = next;
        this.states[this.current].enter(command);
    }
};

let idleState = {
    enter: function() {
        this.entity.body.velocity.x = 0;
        this.entity.body.velocity.y = 0;
        this.entity.animations.play('idle_' + this.entity.direction, 10, true);
        this.entity.adjustHitbox('idle');
    },
    exit: function() {
        this.entity.animations.stop();
    },
    update: function(command) {
        if (command.name == 'walk') {
            return 'walk';
        } else if (command.name == 'attack') {
            return 'attack';
        }
    },
};

let walkState = {
    /**
     * Entry point for Walk State
     * 
     * @param {Object} command
     */
    enter: function(command) {
        let direction = command.direction || this.entity.direction;
        let sprint = command.sprint || false;

        let speed = this.entity.speed;
        let animSpeed = 10;
        if (sprint) {
            speed = this.entity.sprintSpeed;
            animSpeed = 30;
        }

        let dir = '';
        if (_.isString(direction) && _.includes(DIRECTIONS, direction)) {
            dir = direction.toLowerCase();
        } else if (_.isNumber(direction) && _.inRange(direction, 1, 5)) {
            dir = DIRECTIONS[direction];
        } else {
            console.error('Invalid direction' + direction);
            return;
        }

        switch (dir) {
            case 'up':
                this.entity.body.velocity.y = -speed;
                this.entity.body.velocity.x = 0;
                this.entity.direction = 'up';
                break;
            case 'down':
                this.entity.body.velocity.y = speed;
                this.entity.body.velocity.x = 0;
                this.entity.direction = 'down';
                break;
            case 'right':
                this.entity.body.velocity.x = speed;
                this.entity.body.velocity.y = 0;
                this.entity.direction = 'right';
                break;
            case 'left':
                this.entity.body.velocity.x = -speed;
                this.entity.body.velocity.y = 0;
                this.entity.direction = 'left';
                break;
            default:
                console.error('Invalid direction');
                return;
        }
        this.entity.animations.play('walk_' + dir, animSpeed, true);
        this.entity.adjustHitbox('walk');
    },
    exit: function() {
        this.entity.body.velocity.x = 0;
        this.entity.body.velocity.y = 0;
        this.entity.animations.stop();
    },
    update: function(command) {
        if (command.name == 'idle') {
            return 'idle';
        } else if (command.name == 'attack') {
            return 'attack';
        } else if (command.name == 'walk') {
            this.enter(command);
        }
    },
};

let attackState = {
    /**
     * Entry point for Walk State
     * 
     * @param {Boolean} loop
     */
    enter: function(loop) {
        loop = loop || false;
        this.animations.play('slash_' + this.entity.direction, 20, loop);
        this.entity.adjustHitbox('slash');
    },
    exit: function() {
        this.entity.body.velocity.x = 0;
        this.entity.body.velocity.y = 0;
        this.entity.animations.stop();
    },
    update: function(command) {
        if (command.name == 'idle') {
            return 'idle';
        } else if (command.name == 'walk') {
            return 'walk';
        }
    },
};

StateMachine.prototype.setDefaultStates = function() {
    this.addState('idle', idleState);
    this.addState('walk', walkState);
    this.addState('attack', attackState);
};


module.exports = StateMachine;

