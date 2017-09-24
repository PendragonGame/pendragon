'use strict';

let Boot = require('./boot');
let Load = require('./load');
let Play = require('./play');
let Menu = require('./menu');

console.log('Importing States');

module.exports = {
    Boot: Boot,
    Menu: Menu,
    Load: Load,
    Play: Play,
};
