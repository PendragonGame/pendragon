'use strict';
const storage = require('electron-json-storage');

let playerData = null;
let monsterData = {};
let npcData = {};


/**
 * @todo let highScore = 0;
 */


/**
 * Store Entity into JSON file.
 * 
 * @param {any} data 
 */
let storeEntity = function(data) {
    if (data.type === 'player') {
        playerData = data;
    } else if (data.type === 'monster') {
        monsterData[data.id] = data;
    } else if (data.type === 'npc') {
        npcData[data.id] = data;
    }
};

let storeState = function() {
    storage.set('player', playerData, function(err) {
        if (err) throw err;
    });
    storage.set('monsters', monsterData, function(err) {
        if (err) throw err;
    });
    storage.set('npc', npcData, function(err) {
        if (err) throw err;
    });
};


module.exports.storeEntity = storeEntity;
module.exports.storeState = storeState;

