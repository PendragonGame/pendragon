const States = require('./states/states');

let game = new Phaser.Game(640, 640, Phaser.AUTO, 'game');

game.state.add('Boot', States.Boot);
game.state.add('Load', States.Load);
game.state.add('Play', States.Play);
game.state.add('Menu', States.Menu);
game.state.add('Game Over', States.GameOver);
game.state.start('Boot');
