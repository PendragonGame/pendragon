const States = require('./states/states');
// readjust window to compensate for window outer height
window.resizeTo(window.innerWidth,
     window.outerHeight + window.outerHeight - window.innerHeight);
let game = new Phaser.Game(1280, 720, Phaser.CANVAS, 'game');


game.state.add('Boot', States.Boot);
game.state.add('Load', States.Load);
game.state.add('Play', States.Play);
game.state.add('Menu', States.Menu);
game.state.add('Game Over', States.GameOver);
game.state.add('LoadMenu', States.LoadMenu);
game.state.start('Boot');
