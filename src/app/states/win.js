/**
 * @module states/Win
 */
let Win = {};

Win.create = function() {
    let wkey = game.input.keyboard.addKey(Phaser.Keyboard.W);
    wkey.onDown.addOnce(this.restart, this);
};

Win.restart = function() {
    game.state.start('Play');
};

module.exports = Win;
