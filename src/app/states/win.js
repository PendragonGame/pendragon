var Win = {}

Win.create = function() {
    var wkey = game.input.keyboard.addKey(Phaser.Keyboard.W)
    wkey.onDown.addOnce(this.restart, this)
}

Win.restart = function() {
    game.state.start('Play')
}

module.exports = Win
