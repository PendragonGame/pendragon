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

    // storage.set('player', playerData, function(err) {
    //     if (err) throw err;
    // });
    // storage.set('monsters', monsterData, function(err) {
    //     if (err) throw err;
    // });
    // storage.set('npc', npcData, function(err) {
    //     if (err) throw err;
    // });
};


module.exports.storeEntity = storeEntity;
module.exports.autosave = autosave;

// /**
//  * 
//  * 
//  * @param {string} key 
//  * @param {bool=} timestamp
//  */
// function SaveGame(key, timestamp) {
//     this.key = key;
//     this.timestamp = timestamp || false;
//     this.playerData = null;
//     this.monsterData = {};
//     this.npcData = {};
// }

// SaveGame.prototype.storeEntity = function(data) {
//     if (data.type === 'player') {
//         this.playerData = data;
//     } else if (data.type === 'monster') {
//         this.monsterData[data.id] = data;
//     } else if (data.type === 'npc') {
//         this.npcData[data.id] = data;
//     }
// };

// SaveGame.prototype.storeState = function() {
//     const self = this;
//     let entities = {
//         player: self.playerData,
//         monsters: self.monsterData,
//         npc: self.npcData,
//     };
//     let key = '';

//     if (entities.player === null) return;

//     storage.set(this.key, entities, function(err) {
//         if (err) throw err;
//     });

//     // storage.set('player', playerData, function(err) {
//     //     if (err) throw err;
//     // });
//     // storage.set('monsters', monsterData, function(err) {
//     //     if (err) throw err;
//     // });
//     // storage.set('npc', npcData, function(err) {
//     //     if (err) throw err;
//     // });
// };

// module.exports.SaveGame = SaveGame;
