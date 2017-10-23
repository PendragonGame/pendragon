let Load = {};

let loadedData = null;

Load.init = function(data) {
    loadedData = data;
};

Load.preload = function() {
    game.add.text(80, 150, 'loading...', {
        font: '30px Press Start 2P',
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
    game.load.image('hud_save', 'assets/HUD-elements/HUD_save_word.png');
    game.load.image('hud_load', 'assets/HUD-elements/HUD_load_word.png');
    game.load.image('hud_menu', 'assets/HUD-elements/HUD_menu.png');

    game.load.spritesheet('enemy', 'assets/sprites/OrcEnemy.png', 64, 64, 273);
    game.load.spritesheet('woman', 'assets/sprites/woman.png', 64, 64, 273);
    game.load.spritesheet('player', 'assets/sprites/armor.png', 64, 64, 273);
};

Load.create = function() {
    game.state.start('Play', true, false, loadedData);
};

module.exports = Load;
