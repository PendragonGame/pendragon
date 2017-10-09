'use strict';

let Boot = require('./boot');
let Load = require('./load');
let Play = require('./play');
let Menu = require('./menu');
<<<<<<< HEAD
let GameOver = require('./gameover');
=======
let LoadMenu = require('./load-menu');
>>>>>>> save-load-entities

console.log('Importing States');

module.exports = {
    Boot: Boot,
    Menu: Menu,
    Load: Load,
    Play: Play,
<<<<<<< HEAD
    GameOver: GameOver,
=======
    LoadMenu: LoadMenu,
>>>>>>> save-load-entities
};
