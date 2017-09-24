'use strict';

let Boot = {};


Boot.create = function() {
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;

    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.state.start('Menu');
};

module.exports = Boot;
