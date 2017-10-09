'use strict';

let Boot = require('./boot');
let Load = require('./load');
let Play = require('./play');
let Menu = require('./menu');
let GameOver = require('./gameover');
let LoadMenu = require('./load-menu');

console.log('Importing States');

module.exports = {
    Boot: Boot,
    Menu: Menu,
    Load: Load,
    Play: Play,
    GameOver: GameOver,
    LoadMenu: LoadMenu,
};
