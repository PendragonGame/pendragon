'use strict';
const ui = require('../ui/ui');
let electron = require('electron');
let window = electron.remote.getCurrentWindow();
let Settings = {};

Settings.create = function() {
    // menu background stuff
    game.world.setBounds(0, 0, 2560, 800);
    this.map = game.add.tilemap('menu-map');
    this.map.addTilesetImage('outdoors', 'tileset');
    this.bgLayer = this.map.createLayer('bg1');
    game.camera.x = game.menuCameraPos;

     // back button to go to menu screen
     this.back = new ui.MenuButton(0, 0, 'Back', null, ()=>{
        // when pressed start loading the game
        game.state.start('Menu');
}, '4em');
    this.back.setLocation(game.camera.width - this.back.button.width,
        game.camera.height - this.back.button.height);
    console.log(this.back.button.x);

    this.settings = [];

    this.settings.push(new ui.MenuButton(
        game.camera.width/2, 200,
         window.isFullScreen() ? 'Windowed' : 'Fullscreen', null,
        ()=>{
            console.log('fulscreen toggled');
            if (window.isFullScreen()) {
                window.setResizable(true);
                window.setFullScreen(false);
                window.setResizable(false);
                this.settings[0].text.text = 'Fullscreen';
            } else {
                window.setResizable(true);
                window.setFullScreen(true);
                window.setResizable(false);
                this.settings[0].text.text = 'Windowed';
            }
        }, '4em'
    ));
};

module.exports = Settings;

Settings.update = function() {
    // menu background stuff
    if (game.camera.x === 1280) {
        game.camera.x = 0;
        game.menuCameraPos = game.camera.x;
    }
    game.camera.x += 1;
    game.menuCameraPos = game.camera.x;
};

