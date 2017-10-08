'use strict';
const storage = require('electron-json-storage');
const moment = require('moment');

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

let autosave = function() {
    let entities = {
        player: playerData,
        monsters: monsterData,
        npc: npcData,
    };
    if (entities.player === null) return;
    storage.set('autosave.entities', entities, function(err) {
        if (err) throw err;
    });
};

let manualSave = function() {
    let entities = {
        player: playerData,
        monsters: monsterData,
        npc: npcData,
    };
    if (entities.player === null) return;

    let timestamp = moment().toISOString();
    let key = timestamp + '.entities';
    storage.set(key, entities, function(err) {
        if (err) throw err;
    });
}


module.exports.storeEntity = storeEntity;
module.exports.autosave = autosave;
module.exports.manualSave = manualSave;
