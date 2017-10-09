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
    this.pendragonText = game.add.text(game.world.centerX/2, 100, 'Pendragon');
    this.pendragonText.anchor.setTo(.5, .5);
    this.pendragonText.font = 'Press Start 2P';
    this.pendragonText.fill = '#000000';
    this.pendragonText.fontSize = '40pt';
    this.pendragonText.fixedToCamera = true;
    // add a play button
    this.play = game.add.button(game.world.centerX/2, 100,
         null, function() {
             // when pressed start loading the game
            game.stage.backgroundColor = '#000000';
            game.state.start('Load');
            }, this, 2, 1, 0);
    this.play.anchor.setTo(.5, .5);
    // position the button in the right spot
    // add text over the button
    this.playText = game.add.text(game.world.centerX/2, 250, 'Play');
    this.playText.anchor.setTo(.5, .5);
    this.playText.font = 'Press Start 2P';
    this.playText.fill = '#000000';
    this.playText.fontSize = '40pt';
    this.play.width = this.playText.width;
    this.play.height = this.playText.height;
    this.play.x = this.playText.x;
    this.play.y = this.playText.y;
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
    this.load.anchor.setTo(.5, .5);
   // position the button in the right spot
   this.load.width = 140;
   this.load.height = 60;
   this.load.x -= 140/2;
    // text for load
    this.loadText = game.add.text(game.camera.width/2,
         330, 'Load');
    this.loadText.anchor.setTo(.5, .5);
    this.loadText.font = 'Press Start 2P';
    this.loadText.fill = '#000000';
    this.loadText.fontSize = '40pt';
    this.load.width = this.loadText.width;
    this.load.height = this.loadText.height;
    this.load.x = this.loadText.x;
    this.load.y = this.loadText.y;

    this.load.onInputOver.add( function() {
        this.loadText.setShadow(3, 3, 'rgba(0,0,0,0.5)', 5);
    }, this);

    this.load.onInputOut.add( function() {
        this.loadText.setShadow(0, 0, 'rgba(0,0,0,0.5)', 0);
        this.loadText.fill = '#111111';
    }, this);
    this.load.fixedToCamera = true;
    this.loadText.fixedToCamera = true;
    this.r = 0;
    // this.b = 0;
    // this.g = 0;
};

Menu.update = function() {
    if (game.camera.x === 640) {
        game.camera.x = 0;
        game.menuCameraPos = game.camera.x;
    }
    game.camera.x += 1;
    game.menuCameraPos = game.camera.x;
    this.r = game.rnd.integerInRange(0, 256);
    this.g = game.rnd.integerInRange(0, 256);
    this.b = game.rnd.integerInRange(0, 256);    
    this.pendragonText.setShadow(5, 5, 'rgba('+ this.r +','+this.b +','+this.g +',0.5)', 10);

};

module.exports = Menu;
