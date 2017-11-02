'use strict';
/**
 * @module dataStore
 * @exports dataStore
 */

const {ipcRenderer} = require('electron');

let loadedState = null;

/**
 * Update entity by sending information to backend
 * 
 * @param {any} entity 
 * @param {string} channel
 * @function storeEntity
 */
function storeEntity(entity, channel) {
    let data = entity.serialize();
    ipcRenderer.send(channel, data);
};

/**
 * Store entities as autosave
 * 
 * @param {module:entity/Entity~Entity} entity 
 */
module.exports.autosaveEntity = function(entity) {
    storeEntity(entity, 'saveEntity');
};

/**
 * 
 * @param {any} entity 
 * @deprecated
 */
module.exports.manualSaveState = function() {
    ipcRenderer.send('manualSaveState', true);
};

/**
 * Get a list of save states
 * 
 * @return {Promise} - Promise with list of save states
 */
module.exports.getSaveStates = function() {
    ipcRenderer.send('listSaveStates', true);
    return new Promise(function(resolve, reject) {
        ipcRenderer.on('reply-listSaveStates', (ev, arg) => {
            if (!arg.success) reject('Failed to list keys');
            resolve(arg.data);
        });
    });
};


/**
 * Load a state given a save state key
 * 
 * @param {string} key - Save State Key
 * @return {Promise} - Promise with saved data
 */
module.exports.loadState = function(key) {
    ipcRenderer.send('loadState', key);
    loadedState = new Promise(function(resolve, reject) {
        ipcRenderer.on('reply-loadState', (ev, arg) => {
            if (!arg.success) reject('Failed to load key');
            resolve(arg.data);
        });
    });
    return loadedState;
};

/**
 * Get the previously loaded state as a Promise
 * 
 * @param {any} key 
 * @return {Promise} - Promise with previously loaded data
 */
module.exports.getLoadedState = function(key) {
    return loadedState;
};

/**
 * Invalidate the previously loaded state
 */
module.exports.resetLoadState = function() {
    loadedState = null;
};

