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

