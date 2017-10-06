'use strict';
const ipcFrontend = require('electron');

/**
 * Update entity by sending information to backend
 * 
 * @param {any} entity 
 */
let storeEntity = function(entity) {
    let data = entity.serialize();
    ipcFrontend.send('storeEntity', data);
};
module.exports.storeEntity = storeEntity;


