/**
 * @module states/Load
 */
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
	
	//Loading Inventory images
	game.load.image('Apple', 'assets/sprites/Inventory/apple.png');
	game.load.image('Carrot', 'assets/sprites/Inventory/carrot.png');
	game.load.image('Mutton', 'assets/sprites/Inventory/mutton.png');
	game.load.image('Dagger', 'assets/sprites/Inventory/dagger.png');
	game.load.image('Book', 'assets/sprites/Inventory/book.png');
	game.load.image('Pot', 'assets/sprites/Inventory/pot.png');
	game.load.image('Cigar', 'assets/sprites/Inventory/cigar.png');
	game.load.image('Canteen', 'assets/sprites/Inventory/canteen.png');
	game.load.image('Tunic', 'assets/sprites/Inventory/tunic.png');
	game.load.image('Pear', 'assets/sprites/Inventory/pear.png');
	game.load.image('Iphone', 'assets/sprites/Inventory/iphone.png');
	game.load.image('Taco', 'assets/sprites/Inventory/taco.png');
	game.load.image('Handgun', 'assets/sprites/Inventory/handgun.png');
	game.load.image('Cocaine', 'assets/sprites/Inventory/cocaine.png');

    game.load.spritesheet('enemy', 'assets/sprites/OrcEnemy.png', 64, 64, 273);
    game.load.spritesheet('woman', 'assets/sprites/woman.png', 64, 64, 273);
    game.load.spritesheet('player', 'assets/sprites/armor.png', 64, 64, 273);
};

Load.create = function() {
    game.state.start('Play', true, false, loadedData);
};

module.exports = Load;
