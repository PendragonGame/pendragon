const States = require('./states/states');

let game = new Phaser.Game(1280, 800, Phaser.CANVAS, 'game');

game.state.add('Boot', States.Boot);
game.state.add('Load', States.Load);
game.state.add('Play', States.Play);
game.state.add('Menu', States.Menu);
game.state.add('Game Over', States.GameOver);
game.state.add('LoadMenu', States.LoadMenu);
game.state.start('Boot');
