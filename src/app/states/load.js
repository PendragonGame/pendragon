let Load = {};

Load.preload = function() {
    game.add.text(80, 150, 'loading...', {
        font: '30px Courier',
        fill: '#ffffff',
    });

    game.load.tilemap('map', 'assets/tilemaps/map2.json',
     null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tileset', 'assets/tilemaps/outdoors.png');

    game.load.image('hud_wasd', 'assets/HUD-elements/HUD_wasd.png');
    game.load.image('hud_weapon', 'assets/HUD-elements/HUD_weapon.png');
    game.load.image('hud_emptyHealth', 'assets/HUD-elements/HUD_emptyHealth.png');
    game.load.image('hud_fullHealth', 'assets/HUD-elements/HUD_fullHealth.png');
    game.load.image('hud_fullRep', 'assets/HUD-elements/HUD_fullRep.png');
    game.load.image('HUD_save', 'assets/HUD-elements/HUD_save.png');

    game.load.spritesheet('enemy', 'assets/sprites/OrcEnemy.png', 64, 64, 273);
    game.load.spritesheet('woman', 'assets/sprites/woman.png', 64, 64, 273);
    game.load.spritesheet('player', 'assets/sprites/armor.png', 64, 64, 273);
};

Load.create = function() {
    game.state.start('Play');
};

module.exports = Load;
