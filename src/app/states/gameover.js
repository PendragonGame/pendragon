/**
 * @module states/GameOver
 */

const ui = require('../ui/ui');
let GameOver = {};

GameOver.create = function() {
    if (currentMusic) {
        currentMusic.stop();
    }
    currentMusic = game.add.audio('gameover-music', 1, true);
    currentMusic.play();
    // game.keyboard.onDownCallback = game.keyboard.onUpCallback = game.keyboard.onPressCallback = null;
    let gameoverText = game.add.text(game.camera.width/2, 100, 'Game Over');
    gameoverText.anchor.setTo(.5, .5);
    gameoverText.font = 'Press Start 2P';
    gameoverText.fill = '#FFFFFF';
    gameoverText.fontSize = '4em';

    let scoreText = game.add.text(game.camera.width/2,
         200, 'Score:'+game.score);
    scoreText.anchor.setTo(.5, .5);
    scoreText.font = 'Press Start 2P';
    scoreText.fill = '#FFFFFF';
    scoreText.fontSize = '3.6em';

    let dayText = game.add.text(game.camera.width/2,
         260, 'Days Survived:'+game.dayCount);
    dayText.anchor.setTo(.5, .5);
    dayText.font = 'Press Start 2P';
    dayText.fill = '#FFFFFF';
    dayText.fontSize = '3.6em';

    let menu = new ui.MenuButton(game.camera.width/2, game.camera.height/2+60,
         'Main Menu', null, ()=>{
             game.state.start('Menu');
            }, '4em');
    menu.text.fill = '#FFFFFF';
};
module.exports = GameOver;
