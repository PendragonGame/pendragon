const States = require('./states/states');
// readjust window to compensate for window outer height
let height;
if (screen.width / screen.height === 16/9) {
    if (window.innerHeight !== 576) {
        window.resizeTo(1024,
            window.outerHeight + 576 - window.innerHeight);
    }
    height = 720;
} else {
    height = 800;
    window.outerHeight = 640;
    if (window.innerHeight !== 640) {
        window.resizeTo(1024,
            window.outerHeight + 640 - window.innerHeight);
    }
}
let game = new Phaser.Game(1280, height, Phaser.CANVAS, 'game');
let currentMusic = null;
let muteMusic = false;

game.state.add('Boot', States.Boot);
game.state.add('Load', States.Load);
game.state.add('Play', States.Play);
game.state.add('Menu', States.Menu);
game.state.add('Game Over', States.GameOver);
game.state.add('LoadMenu', States.LoadMenu);
game.state.add('Settings', States.Settings);
game.state.start('Boot');
