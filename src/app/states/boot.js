'use strict';
let Boot = {};

Boot.preload = function() {
    game.load.tilemap('menu-map', 'assets/tilemaps/menu-map.json',
    null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tileset', 'assets/tilemaps/outdoors.png');
    game.load.audio('main_music', 'assets/audio/main_music.mp3');
};

Boot.create = function() {
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;

    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.state.start('Menu');
};

module.exports = Boot;
