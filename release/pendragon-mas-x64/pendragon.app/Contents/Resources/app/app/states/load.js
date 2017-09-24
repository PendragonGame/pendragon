let Load = {};

Load.preload = function() {
    game.add.text(80, 150, 'loading...', {
        font: '30px Courier',
        fill: '#ffffff',
    });

    game.load.tilemap('map1', 'assets/tilemaps/map1.json',
     null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tileset', 'assets/tilemaps/outdoors.png');
    game.load.spritesheet('enemy', 'assets/sprites/baby.png', 64, 64, 273);
    game.load.spritesheet('player', 'assets/sprites/armor.png', 64, 64, 273);
};

Load.create = function() {
    game.state.start('Play');
};

module.exports = Load;
