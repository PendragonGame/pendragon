/**
 * @module states.LoadMenu
 */
'use strict';
const dataStore = require('../util/data');
const moment = require('moment');
const ui = require('../ui/ui');

let LoadMenu = {};

/**
 * 
 * 
 * @param {any} key 
 */
function loadGame() {
    console.log('Loading: ' + this.key);
    dataStore.loadState(this.key)
        .then((data) => {
            game.state.start('Load', true, false, data);
        });
}

LoadMenu.preload = function() {

};

LoadMenu.create = function() {
    // menu background stuff
    game.world.setBounds(0, 0, 2560, 800);
    this.map = game.add.tilemap('menu-map');
    this.map.addTilesetImage('outdoors', 'tileset');
    this.bgLayer = this.map.createLayer('bg1');
    game.camera.x = game.menuCameraPos;

    // back button to go to menu screen
    this.back = new ui.MenuButton(0, 0, 'Back', null, ()=>{
            // when pressed start loading the game
            game.state.start('Menu');
    }, '4em');
    this.back.setLocation(game.camera.width - this.back.button.width,
         game.camera.height - this.back.button.height);
    console.log(this.back.button.x);


    let saveStates = [];
    dataStore.getSaveStates()
        .then((keys) => {
            saveStates = keys.map((k) => {
                let t = 'Autosave';
                if (k !== 'autosave') {
                    let o = moment(k, moment.ISO_8601);
                    t = o.format('MMM Do YY - hh:mm:ss. a');
                }
                return {
                    key: k,
                    title: t,
                };
            });
            saveStates.sort((a, b) => {
                if (a.key == 'autosave') return 1;
                if (b.key == 'autosave') return -1;
                let am = moment(a.key);
                let bm = moment(b.key);
                if (am.isAfter(bm)) return -1;
                if (am.isBefore(bm)) return 1;
                return 0;
            });
            let autosaveIndex = saveStates.findIndex(
                (s) =>s.key === 'autosave');
            if (autosaveIndex > -1) {
                saveStates.splice(autosaveIndex, 1);
                this.autosave = new ui.MenuButton(game.camera.width / 2,
                    100, 'Autosave',
                    'autosave',
                    loadGame
                );
            }
            this.buttonList = new ui.ButtonList(saveStates, loadGame);
        })
        .catch((reason) => {
            console.error(reason);
        });
};

LoadMenu.update = function() {
    // menu background stuff
    if (game.camera.x === 1280) {
        game.camera.x = 0;
        game.menuCameraPos = game.camera.x;
    }
    game.camera.x += 1;
    game.menuCameraPos = game.camera.x;
};


module.exports = LoadMenu;
