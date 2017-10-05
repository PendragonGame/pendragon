'use strict';
const ipcFrontend = require('electron');

/**
 * Update entity by sending information to backend
 * 
 * @param {any} entity 
 */
let updateEntity = function(entity) {
    let data = entity.serialize();
    ipcFrontend.send('updateEntity', data);
};
module.exports.updateEntity = updateEntity;


