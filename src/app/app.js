const States = require('./states/states');
// readjust window to compensate for window outer height
let height;
if (screen.width / screen.height === 16/9) {
    if (window.innerHeight !== 720) {
        window.resizeTo(1280,
            window.outerHeight + 720 - window.innerHeight);
    }
    height = 720;
} else {
    height = 800;
    window.outerHeight = height;
    console.log(window.outerHeight);
    console.log(window.innerHeight);
    if (window.innerHeight !== 800) {
        window.resizeTo(1280,
            window.outerHeight + 800 - window.innerHeight);
    }
}
let game = new Phaser.Game(1280, height, Phaser.CANVAS, 'game');


game.state.add('Boot', States.Boot);
game.state.add('Load', States.Load);
game.state.add('Play', States.Play);
game.state.add('Menu', States.Menu);
game.state.add('Game Over', States.GameOver);
game.state.add('LoadMenu', States.LoadMenu);
game.state.add('Settings', States.Settings);
game.state.start('Boot');
