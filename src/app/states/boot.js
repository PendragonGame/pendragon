'use strict';
/**
 * @module states/Boot
 */
let Boot = {};

Boot.preload = function() {
    game.load.tilemap('menu-map', 'assets/tilemaps/menu-map.json',
    null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tileset', 'assets/tilemaps/outdoors.png');
};


Boot.create = function() {
    if (currentMusic) {
        currentMusic.stop();
    }
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;

    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.state.start('Menu');
};

module.exports = Boot;
