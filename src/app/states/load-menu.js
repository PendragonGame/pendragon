let LoadMenu = {};
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
    this.text.fill = '#000000';
    this.text.fontSize = '35pt';
    // the button
    this.button = game.add.button(
      x, y, null, func, this, 2, 1, 0);
      this.button.width = this.text.width;
      this.button.height = this.text.height;
    // hover effect
    this.button.anchor.setTo(.5, .5);
    this.button.onInputOver.add( function() {
      this.text.setShadow(3, 3, 'rgba(0,0,0,0.5)', 5);
    }, this);
    // hover off effect
    this.button.onInputOut.add( function() {
      this.text.setShadow(0, 0, 'rgba(0,0,0,0.5)', 0);
      this.text.fill = '#111111';
    }, this);
    this.button.fixedToCamera = true;
    this.text.fixedToCamera = true;

    this.kill = function() {
        this.button.kill();
        this.text.kill();
    };
}
/**
 * 
 * @param {*} saves  array of timestamps 
 */
function ButtonList(saves) {
    this.saveButtons = [];
    this.currentPage = 0;
    this.autosave = new MenuButton(game.camera.width/2,
        100, 'Autosave', function() {
            console.log('load autosave');
        }
    );
    let currentH = 160;
    this.startI = 0;
    this.currentI = 0;
    if (saves) {
        for (let i = this.currentI; i < saves.length; i++) {
            this.currentI = i;
            this.saveButtons.push(new MenuButton(game.camera.width/2,
                 currentH,
                saves[i], function() {
                console.log('loading ' + saves[i]);
            }));
            currentH += 60;
            if (currentH > 460) {
                break;
            }
        }
    }
    console.log(this.startI, this.currentI);
    this.nextPageButton = new MenuButton(
        game.camera.width/2+80,
         game.camera.height-80, '>', () => {
            if (saves.length - this.startI < 6) return;
            this.currentPage += 1;
            for (;this.startI <= this.currentI; this.startI++) {
                this.saveButtons[this.startI].kill();
            }
            let currentH = 160;
            for (let i = this.startI; i<saves.length; i++) {
                this.currentI = i;
                this.saveButtons[i] =(new MenuButton(game.camera.width/2,
                    currentH,
                   saves[i], function() {
                   console.log('loading ' + saves[i]);
               }));
               currentH += 60;
               if (currentH > 460) {
                   break;
               }
            }
         });

    this.nextPrevPage = new MenuButton(
        game.camera.width/2-80,
         game.camera.height-80, '<', () => {
             if (this.currentPage === 0) return;
             this.currentPage -= 1;
            for (let i = this.startI; i <= this.currentI; i++) {
                this.saveButtons[i].kill();
            }
            this.startI -= 6;
            this.currentI = this.startI;
            currentH = 160;
            for (let i = this.startI; i<saves.length; i++) {
                this.currentI = i;
                this.saveButtons[i] = (new MenuButton(game.camera.width/2,
                    currentH,
                   saves[i], function() {
               }));
               currentH += 60;
               if (currentH > 460) {
                   break;
               }
            }
         });
}


LoadMenu.preload = function() {

};

LoadMenu.create = function() {
    // menu background stuff
    game.world.setBounds(0, 0, 1280, 640);
    this.map = game.add.tilemap('menu-map');
    this.map.addTilesetImage('outdoors', 'tileset');
    this.bgLayer = this.map.createLayer('bg1');
    game.camera.x = game.menuCameraPos;

    // back button to go to menu screen
    // add a back button
    this.back = game.add.button(game.camera.width - 100,
         game.camera.height - 80,
        null, function() {
            // when pressed start loading the game
           game.state.start('Menu');
           }, this, 2, 1, 0);
   // position the button in the right spot
   this.back.width = 130;
   this.back.height = 50;
   this.back.x -= 120/2;
   // add text over the button
   this.backText = game.add.text(game.camera.width - 80*2,
     game.camera.height - 85, 'Back');
   this.backText.font = 'Fauna One';
   this.backText.fill = '#000000';
   this.backText.fontSize = '40pt';
   // hover effect
   this.back.onInputOver.add( function() {
       this.backText.setShadow(3, 3, 'rgba(0,0,0,0.5)', 5);
   }, this);
   // hover off effect
   this.back.onInputOut.add( function() {
       this.backText.setShadow(0, 0, 'rgba(0,0,0,0.5)', 0);
       this.backText.fill = '#111111';
   }, this);
   this.back.fixedToCamera = true;
   this.backText.fixedToCamera = true;

   // test button
   testSaves = ['some', 'tests', 'saves',
    'more saves', 'saves are cool',
     'ram is not', 'even more saves', 'too',
      'many', 'saves', 'I', 'ran', 'out',
       'of', 'save', 'names'];
   this.testList = new ButtonList(testSaves);
};

LoadMenu.update = function() {
    // menu background stuff
    if (game.camera.x === 640) {
        game.camera.x = 0;
        game.menuCameraPos = game.camera.x;
    }
    game.camera.x += 1;
    game.menuCameraPos = game.camera.x;
};


module.exports = LoadMenu;
