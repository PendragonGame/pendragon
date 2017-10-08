'use strict';
const {ipcRenderer} = require('electron');

/**
 * Update entity by sending information to backend
 * 
 * @param {any} entity 
 * @param {string} channel
 */
let storeEntity = function(entity, channel) {
    let data = entity.serialize();
    ipcRenderer.send(channel, data);
};

module.exports.autosaveEntity = function(entity) {
    storeEntity(entity, 'saveEntity');
};

/**
 * Not going to use this
 * 
 * @param {any} entity 
 */
module.exports.manualSaveState = function() {
    ipcRenderer.send('manualSaveState', true);
};

module.exports.getSaveStates = function() {
    ipcRenderer.send('listSaveStates', true);
    return new Promise(function(resolve, reject) {
        ipcRenderer.on('reply-listSaveStates', (ev, arg) => {
            if (!arg.success) reject('Failed to list keys');
            resolve(arg.data);
        });
    });
};

module.exports.loadState = function(key) {
    ipcRenderer.send('loadState', true);
    return new Promise(function(resolve, reject) {
        ipcRenderer.on('reply-loadState', (ev, arg) => {
            if (!arg.success) reject('Failed to load key');
            resolve(arg.data);
        });
    });
};

