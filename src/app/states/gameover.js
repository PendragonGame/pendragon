let GameOver = {};
/**
 * 
 * @param {*} x 
 * @param {*} y 
 * @param {*} text 
 * @param {*} func 
 */
function MenuButton(x, y, text, func) {
    // add text over the button
    this.text = game.add.text(x,
        y, text);
    this.text.anchor.setTo(.5, .5);
    this.text.font = 'Fauna One';
    this.text.fill = '#FFFFFF';
    this.text.fontSize = '35pt';
    // the button
    this.button = game.add.button(
        x, y, null, func, this, 2, 1, 0);
    this.button.width = this.text.width;
    this.button.height = this.text.height;
    // hover effect
    this.button.anchor.setTo(.5, .5);
    this.button.onInputOver.add(function() {
        this.text.setShadow(3, 3, 'rgba(256,256,256,0.5)', 5);
    }, this);
    // hover off effect
    this.button.onInputOut.add(function() {
        this.text.setShadow(0, 0, 'rgba(0,0,0,0.5)', 0);
        this.text.fill = '#FFFFFF';
    }, this);
    this.button.fixedToCamera = true;
    this.text.fixedToCamera = true;

    this.kill = function() {
        this.button.kill();
        this.text.kill();
    };
}

GameOver.create = function() {
    let gameoverText = game.add.text(game.camera.width/2, 100, 'Game Over');
    gameoverText.anchor.setTo(.5, .5);
    gameoverText.font = 'Fauna One';
    gameoverText.fill = '#FFFFFF';
    gameoverText.fontSize = '35pt';

    let scoreText = game.add.text(game.camera.width/2, 200, 'Score: '+game.score);
    scoreText.anchor.setTo(.5, .5);
    scoreText.font = 'Fauna One';
    scoreText.fill = '#FFFFFF';
    scoreText.fontSize = '25pt';

    let dayText = game.add.text(game.camera.width/2, 260, 'Days Survived: '+game.dayCount);
    dayText.anchor.setTo(.5, .5);
    dayText.font = 'Fauna One';
    dayText.fill = '#FFFFFF';
    dayText.fontSize = '25pt';

    new MenuButton(game.camera.width/2, 340, 'Main Menu', ()=> {
        game.state.start('Menu');
    });
};
module.exports = GameOver;
