'use strict';
const {ipcRenderer} = require('electron');

/**
 * Update entity by sending information to backend
 * 
 * @param {any} entity 
 */
let storeEntity = function(entity) {
    let data = entity.serialize();
    ipcRenderer.send('storeEntity', data);
};
module.exports.storeEntity = storeEntity;


