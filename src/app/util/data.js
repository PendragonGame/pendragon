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
    storeEntity(entity, 'autosaveEntity');
};

module.exports.manualSaveEntity = function(entity) {
    storeEntity(entity, 'manualSaveEntity');
};

