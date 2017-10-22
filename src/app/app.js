const States = require('./states/states');
// readjust window to compensate for window outer height
if (window.innerHeight !== 720) {
    window.resizeTo(1280,
        window.outerHeight + window.outerHeight - window.innerHeight);
}
let game = new Phaser.Game(1280, 720, Phaser.CANVAS, 'game');


game.state.add('Boot', States.Boot);
game.state.add('Load', States.Load);
game.state.add('Play', States.Play);
game.state.add('Menu', States.Menu);
game.state.add('Game Over', States.GameOver);
game.state.add('LoadMenu', States.LoadMenu);
game.state.add('Settings', States.Settings);
game.state.start('Boot');
