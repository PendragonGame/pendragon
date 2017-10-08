'use strict';
const storage = require('electron-json-storage');
const moment = require('moment');
const _ = require('lodash');

let playerData = null;
let monsterData = {};
let npcData = {};

let availableKeys = [];

/**
 * @todo let highScore = 0;
 */


/**
 * Store Entity into JSON file.
 * 
 * @param {any} data 
 */
let storeEntity = function (data) {
    if (data.type === 'player') {
        playerData = data;
    } else if (data.type === 'monster') {
        monsterData[data.id] = data;
    } else if (data.type === 'npc') {
        npcData[data.id] = data;
    }
};

let autosave = function () {
    let entities = {
        player: playerData,
        monsters: monsterData,
        npc: npcData,
    };
    if (entities.player === null) return;
    storage.set('autosave.entities', entities, function (err) {
        if (err) throw err;
    });
};

let manualSave = function () {
    let entities = {
        player: playerData,
        monsters: monsterData,
        npc: npcData,
    };
    if (entities.player === null) return;

    let timestamp = moment().toISOString();
    let key = timestamp + '.entities';
    console.log('Saving entity to: ' + key);
    /**
     * NOTE(anand): There may be a problem with loading because the timestamp is urlencoded
     */
    storage.set(key, entities, function (err) {
        if (err) throw err;
    });
};


/**
 * Get the saved state keys.
 * 
 * @return {Promise}
 */
let getStates = function() {
    return new Promise(function(resolve, reject) {
        storage.keys((err, keys) => {
            if (err) {
                reject(err);
            }
            _.forEach(keys, (k) => console.log(k));
            resolve(keys);
        });
    });
};

let loadState = function(key) {
    return new Promise(function(resolve, reject) {
        storage.get(key, (err, data) => {
            if (err) reject(err);
            resolve(data);
        });
    });
};

/**
 * Save game functions
 */
module.exports.storeEntity = storeEntity;
module.exports.autosave = autosave;
module.exports.manualSave = manualSave;

/**
 * Load game functions
 */
module.exports.loadState = loadState;
/**
 * Helper functions
 */
module.exports.getStates = getStates;