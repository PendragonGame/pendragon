'use strict';
const storage = require('electron-json-storage');
const moment = require('moment');
const _ = require('lodash');

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
    // console.debug('Monsters:' + Object.keys(entities.monsters).length);
    // console.debug('NPC:' + Object.keys(entities.npc).length);
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
    console.log('Saving entity to: ' + key);
    /**
     * NOTE(anand): There may be a problem with loading because the timestamp is urlencoded
     */
    storage.set(key, entities, function(err) {
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
            resolve(_.map(keys, (e, i) => {
                console.log('Found key: ' + e);
                /**
                 * The key is formatted such:
                 * <ISO8601 Timestamp>.entities
                 * 
                 * Here, I am getting the index of the dot before 'entities'
                 * and returning the timestamp
                 */
                return e.slice(0, e.indexOf('entities') - 1);
            }));
        });
    });
};

let loadState = function(key) {
    return new Promise(function(resolve, reject) {
        key = key + '.entities';
        console.log('Loading key: ' + key);
        storage.get(key, (err, data) => {
            if (err) reject(err);
            console.log('Loaded key: ' + key);
            // console.debug('Monsters:' + Object.keys(data.monsters).length);
            // console.debug('NPC:' + Object.keys(data.npc).length);
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
