/**
 * @module states/Load
 */
let Load = {};

let loadedData = null;

Load.init = function(data) {
    loadedData = data;
};

Load.preload = function() {
    if (currentMusic) {
        currentMusic.stop();
    }
    game.add.text(80, 150, 'loading...', {
        font: '30px Press Start 2P',
        fill: '#ffffff',
    });

    game.load.tilemap('map', 'assets/tilemaps/map2.json',
        null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tileset', 'assets/tilemaps/outdoors.png');

    game.load.image('hud_wasd', 'assets/HUD-elements/HUD_wasd.png');
    game.load.image('hud_Dagger', 'assets/HUD-elements/HUD_weapon.png');
    game.load.image('hud_Bow', 'assets/HUD-elements/HUD_bow.png');
	game.load.image('hud_Spear', 'assets/HUD-elements/HUD_spear.png');
    game.load.image('hud_emptyHealth', 'assets/HUD-elements/HUD_emptyHealth.png');
    game.load.image('hud_fullHealth', 'assets/HUD-elements/HUD_fullHealth.png');
    game.load.image('hud_fullRep', 'assets/HUD-elements/HUD_fullRep.png');
    game.load.image('hud_save', 'assets/HUD-elements/HUD_save_word.png');
    game.load.image('hud_load', 'assets/HUD-elements/HUD_load_word.png');
    game.load.image('hud_menu', 'assets/HUD-elements/HUD_menu.png');

    // Loading Inventory images
    game.load.image('Apple', 'assets/sprites/Inventory/apple.png');
    game.load.image('Carrot', 'assets/sprites/Inventory/carrot.png');
    game.load.image('Mutton', 'assets/sprites/Inventory/mutton.png');
    game.load.image('Dagger', 'assets/sprites/Inventory/dagger.png');
	game.load.image('Spear', 'assets/sprites/Inventory/spear.png');
    game.load.image('Book', 'assets/sprites/Inventory/book.png');
    game.load.image('Pot', 'assets/sprites/Inventory/pot.png');
    game.load.image('Cigar', 'assets/sprites/Inventory/cigar.png');
    game.load.image('Canteen', 'assets/sprites/Inventory/canteen.png');
    game.load.image('Tunic', 'assets/sprites/Inventory/tunic.png');
    game.load.image('Pear', 'assets/sprites/Inventory/pear.png');
    game.load.image('Taco', 'assets/sprites/Inventory/taco.png');
    game.load.image('Tusk', 'assets/sprites/Inventory/tusk.png');
    game.load.image('Bow', 'assets/sprites/Inventory/bow.png');
    game.load.image('Arrow_Right', 'assets/sprites/Inventory/arrow_right.png');
    game.load.image('Arrow_Left', 'assets/sprites/Inventory/arrow_left.png');
    game.load.image('Arrow_Up', 'assets/sprites/Inventory/arrow_up.png');
    game.load.image('Arrow_Down', 'assets/sprites/Inventory/arrow_down.png');
	
	game.load.image('Pirate_Ship', 'assets/sprites/pirate_ship.png');
	game.load.image('CannonBall', 'assets/sprites/cannonball.png');
	game.load.spritesheet('smoke', 'assets/sprites/smoke.png', 128, 128, 10);

    game.load.audio('chip1-music', 'assets/music/chip1.mp3');
    game.load.audio('chip2-music', 'assets/music/chip2.mp3');
    game.load.audio('gameover-music', 'assets/music/game-over.mp3');

    game.load.spritesheet('orc1', 'assets/sprites/orc1.png', 64, 64, 273);
	game.load.spritesheet('orc2', 'assets/sprites/orc2.png', 64, 64, 273);
    game.load.spritesheet('npc1', 'assets/sprites/npc1.png', 64, 64, 273);
	game.load.spritesheet('npc2', 'assets/sprites/npc2.png', 64, 64, 273);
	game.load.spritesheet('npc3', 'assets/sprites/npc3.png', 64, 64, 273);
	game.load.spritesheet('npc4', 'assets/sprites/npc4.png', 64, 64, 273);
	game.load.spritesheet('npc5', 'assets/sprites/npc5.png', 64, 64, 273);
    game.load.spritesheet('player', 'assets/sprites/armor.png', 64, 64, 273);
    
    game.load.spritesheet('player_shoot', 'assets/sprites/armor_bow.png', 64, 64, 273);
	game.load.spritesheet('player_thrust', 'assets/sprites/armor_spear.png', 64, 64, 273);
	
	game.load.spritesheet('cb_explode', 'assets/sprites/explode.png', 96, 96, 15);
};

Load.create = function() {
    game.state.start('Play', true, false, loadedData);
};

module.exports = Load;
