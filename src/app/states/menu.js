let Menu = {};

Menu.preload = function() {
};

Menu.create = function() {
    // menu background to white
    game.stage.backgroundColor = '#ffffff';
    // add a play button
    this.play = game.add.button(game.world.centerX, 100,
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
    this.playText = game.add.text(game.world.centerX-120/2, 90, 'Play');
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

    // button for settings
    this.settings = game.add.button(game.world.centerX, 180,
        null, function() {
            // when pressed start loading the game
           console.log('clicking settings button does nothing');
           }, this, 2, 1, 0);
   // position the button in the right spot
   this.settings.width = 220;
   this.settings.height = 60;
   this.settings.x -= 220/2;
    // text for settings
    this.settingsText = game.add.text(game.world.centerX-200/2,
         180, 'Load');
    this.settingsText.font = 'Fauna One';
    this.settingsText.fill = '#000000';
    this.settingsText.fontSize = '40pt';

    this.settings.onInputOver.add( function() {
        this.settingsText.setShadow(3, 3, 'rgba(0,0,0,0.5)', 5);
    }, this);

    this.settings.onInputOut.add( function() {
        this.settingsText.setShadow(0, 0, 'rgba(0,0,0,0.5)', 0);
        this.settingsText.fill = '#111111';
    }, this);
};

module.exports = Menu;
