let Menu = {};


Menu.preload = function() {
    game.load.tilemap('menu-map', 'assets/tilemaps/menu-map.json',
    null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tileset', 'assets/tilemaps/outdoors.png');
};

Menu.create = function() {
    game.world.setBounds(0, 0, 1280, 640);
    this.map = game.add.tilemap('menu-map');
    this.map.addTilesetImage('outdoors', 'tileset');
    this.bgLayer = this.map.createLayer('bg1');
    if (game.menuCameraPos) {
        game.camera.x = game.menuCameraPos;
    }
    // add a play button
    this.play = game.add.button(game.world.centerX/2, 100,
         null, function() {
             // when pressed start loading the game
            game.stage.backgroundColor = '#000000';
            game.state.start('Load');
            }, this, 2, 1, 0);
    // position the button in the right spot
    this.play.width = 120;
    this.play.height = 50;
    this.play.x -= 120/2;
    // add text over the button
    this.playText = game.add.text(game.world.centerX/2-120/2, 90, 'Play');
    this.playText.font = 'Fauna One';
    this.playText.fill = '#000000';
    this.playText.fontSize = '40pt';
    // hover effect
    this.play.onInputOver.add( function() {
        this.playText.setShadow(3, 3, 'rgba(0,0,0,0.5)', 5);
    }, this);
    // hover off effect
    this.play.onInputOut.add( function() {
        this.playText.setShadow(0, 0, 'rgba(0,0,0,0.5)', 0);
        this.playText.fill = '#111111';
    }, this);
    this.play.fixedToCamera = true;
    this.playText.fixedToCamera = true;

    // button for load
    this.load = game.add.button(game.world.centerX/2, 180,
        null, function() {
            // when pressed start loading the game
           game.state.start('LoadMenu');
           }, this, 2, 1, 0);
   // position the button in the right spot
   this.load.width = 140;
   this.load.height = 60;
   this.load.x -= 140/2;
    // text for load
    this.loadText = game.add.text(game.camera.width/2 - 65,
         180, 'Load');
    this.loadText.font = 'Fauna One';
    this.loadText.fill = '#000000';
    this.loadText.fontSize = '40pt';

    this.load.onInputOver.add( function() {
        this.loadText.setShadow(3, 3, 'rgba(0,0,0,0.5)', 5);
    }, this);

    this.load.onInputOut.add( function() {
        this.loadText.setShadow(0, 0, 'rgba(0,0,0,0.5)', 0);
        this.loadText.fill = '#111111';
    }, this);
    this.load.fixedToCamera = true;
    this.loadText.fixedToCamera = true;
};

Menu.update = function() {
    if (game.camera.x === 640) {
        game.camera.x = 0;
        game.menuCameraPos = game.camera.x;
    }
    game.camera.x += 1;
    game.menuCameraPos = game.camera.x;
};

module.exports = Menu;
