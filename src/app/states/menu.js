'use strict';
const ui = require('../ui/ui');
let Menu = {};


Menu.preload = function() {
    game.load.tilemap('menu-map', 'assets/tilemaps/menu-map.json',
    null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tileset', 'assets/tilemaps/outdoors.png');
};

Menu.create = function() {
    game.world.setBounds(0, 0, 2560, 640);
    this.map = game.add.tilemap('menu-map');
    this.map.addTilesetImage('outdoors', 'tileset');
    this.bgLayer = this.map.createLayer('bg1');
    if (game.menuCameraPos) {
        game.camera.x = game.menuCameraPos;
    }
    this.pendragonText = game.add.text(game.camera.width/2, 100, 'Pendragon');
    this.pendragonText.anchor.setTo(.5, .5);
    this.pendragonText.font = 'Press Start 2P';
    this.pendragonText.fill = '#000000';
    this.pendragonText.fontSize = '42pt';
    this.pendragonText.fixedToCamera = true;
    // add a play button
    this.play = new ui.MenuButton(
        game.camera.width/2,
        this.pendragonText.y + 150,
        'Play', null, function() {
            game.stage.backgroundColor = '#000000';
            game.state.start('Load');
        }, '40pt');
    // button to go to the loading menu
    this.load = new ui.MenuButton(
        game.camera.width/2,
        this.play.button.y + 100,
        'Load', null, function() {
            game.stage.backgroundColor = '#000000';
            game.state.start('LoadMenu');
        }, '40pt');
    // button to go to the settings menu
    this.settings = new ui.MenuButton(
        game.camera.width/2, this.load.button.y + 100,
        'Settings', null, ()=> {
            game.state.start('Settings');
        }, '40pt'
    );
};

Menu.update = function() {
    if (game.camera.x === 1280) {
        game.camera.x = 0;
        game.menuCameraPos = game.camera.x;
    }
    game.camera.x += 1;
    game.menuCameraPos = game.camera.x;
    this.r = game.rnd.integerInRange(0, 256);
    this.g = game.rnd.integerInRange(0, 256);
    this.b = game.rnd.integerInRange(0, 256);
    this.pendragonText.setShadow(5, 5, 'rgba('+ this.r +','
     +this.b +','+this.g +',.75)', 1);
};

module.exports = Menu;
