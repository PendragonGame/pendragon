'use strict';
/**
 * @module states/Play
 */
const UI = require('../ui/ui');
const Player = require('../entity/Player');
const NavMesh = require('../ai/Nav-mesh.js');
const Monster = require('../entity/Monster');
const NPC = require('../entity/NPC');
const Factory = require('../factory/Factory');
const dataStore = require('../util/data');
const Map = require('../util/Map');
const Ripple = require('../ripple/engine');
const Item = require('../item/Item.js');
let electron = require('electron');
let window = electron.remote.getCurrentWindow();

const Sampling = require('discrete-sampling');


const npcBounds = [
    [new Phaser.Point(1397, 1344), new Phaser.Point(1684, 1472)],
    [new Phaser.Point(778, 1328), new Phaser.Point(1065, 1553)],
    [new Phaser.Point(1486, 735), new Phaser.Point(1690, 1050)],
    [new Phaser.Point(1800, 2200), new Phaser.Point(3000, 2700)],
];

const monsterBounds = [
    [new Phaser.Point(3510, 2907), new Phaser.Point(3908, 3458)],
    [new Phaser.Point(3464, 688), new Phaser.Point(3868, 1274)],
];

let loadedData = null;
let timerIDs = [];

let Play = {};

Play.init = function(data) {
    if (data) {
        loadedData = data;
    };
};

Play.setLoadData = function(data) {
    loadedData = data;
};

Play.preload = function() {
    /**
     * Map creation
     */
    this.map = game.add.tilemap('map');
    this.map.addTilesetImage('outdoors', 'tileset');
    this.bgLayer = this.map.createLayer('bgLayer');
    this.bgOverlap2 = this.map.createLayer('bgOverlap2');
    this.bgOverlap = this.map.createLayer('bgOverlap');
    this.blockOverlap = this.map.createLayer('blkOverlap');
    this.blockLayer = this.map.createLayer('blkLayer');
    game.add.existing(this.blockLayer);

    this.blockLayer.resizeWorld();
    this.bgLayer.resizeWorld();
    this.game = game;
    this.navMesh = new NavMesh(this.map);

    // Input for game
    this.keyboard = game.input.keyboard;
    this.keyboard.onDownCallback = () => {
        switch (game.input.keyboard.event.keyCode) {
            // 27 = escape
            case 27:
                this.pauseGame();
                break;
            case 73:
                this.toggleInventory();
                break;
            default:
                break;
        }
    };

    /**
     * HUD elements
     *
     * @todo(anand): Can this be improved? May be making code slow.
     */
    let margin = 5;

    // Weapon display
    this.wpn = game.add.sprite(0, 0, 'hud_Dagger');
    this.wpn.width /= 2;
    this.wpn.height /= 2;
    this.wpn.x = game.camera.width - this.wpn.width * 2 - margin;
    this.wpn.y = margin;
    this.wpn.fixedToCamera = true;

    // Next Weapon
    this.nxtWpn = new UI.MenuButton(game.camera.width - this.wpn.width / 2 - margin,
        (this.wpn.y + this.wpn.height / 2 + 5), '>', null, () => {
            this.player.currentWeapon++;
            if (this.player.currentWeapon == this.player.weapons.length) this.player.currentWeapon = 0;
            this.wpn.loadTexture('hud_' + this.player.weapons[this.player.currentWeapon], 0, false);
            if (this.player.weapons[this.player.currentWeapon] === 'Bow') this.player.loadTexture('player_shoot');
            if (this.player.weapons[this.player.currentWeapon] === 'Dagger') this.player.loadTexture('player');
        }, '2.5em');
    this.nxtWpn.fill = '#ffff00';

    // Next Weapon
    this.prvWpn = new UI.MenuButton(game.camera.width - this.wpn.width * 2.5 - margin - 1,
        (this.wpn.y + this.wpn.height / 2 + 5), '<', null, () => {
            this.player.currentWeapon--;
            if (this.player.currentWeapon == -1) this.player.currentWeapon = this.player.weapons.length - 1;
            this.wpn.loadTexture('hud_' + this.player.weapons[this.player.currentWeapon], 0, false);
            if (this.player.weapons[this.player.currentWeapon] === 'Bow') this.player.loadTexture('player_shoot');
            if (this.player.weapons[this.player.currentWeapon] === 'Dagger') this.player.loadTexture('player');
        }, '2.5em');

    this.textStyle = {
        font: 'Press Start 2P',
        fill: '#ffff00',
        align: 'center',
        fontSize: '2em',
        stroke: 'black',
        strokeThickness: '5',
    };
    // "Health" text
    this.healthLabel = game.add.text(margin, margin, 'Health', this.textStyle);
    this.healthLabel.fixedToCamera = true;
    // "Rep" text
    this.repLabel = game.add.text(margin, this.healthLabel.height + margin + margin,
        'Rep', this.textStyle);
    this.repLabel.fixedToCamera = true;

    // "Score" text
    this.scoreLabel = game.add.text(0, 0, 'Score: 0', this.textStyle);
    this.scoreLabel.x = game.camera.width - (1.5 * this.scoreLabel.width);
    this.scoreLabel.y = game.camera.height - this.scoreLabel.height;
    this.scoreLabel.fixedToCamera = true;

    // "Day" text
    this.dayLabel = game.add.text(0, 0, 'Score: 0', this.textStyle);
    this.dayLabel.x = game.camera.width - (1.5 * this.dayLabel.width);
    this.dayLabel.y = game.camera.height - (2 * this.dayLabel.height);
    this.dayLabel.fixedToCamera = true;

    // Sprite for empty health bar to represent health capacity
    this.emptyHealthBar = game.add.sprite(this.healthLabel.width + (2 * margin), margin,
        'hud_emptyHealth');
    this.emptyHealthBar.fixedToCamera = true;
    this.emptyHealthBar.height = 25;
    // A separate sprite is used within to represent current player health
    this.fullHealthBar = game.add.sprite(this.healthLabel.width + (2 * margin) + 2, 2 + margin,
        'hud_fullHealth');
    this.fullHealthBar.fixedToCamera = true;
    this.fullHealthBar.width /= 2;
    this.fullHealthBar.height = this.emptyHealthBar.height - 4;

    // Same deal for reputation
    this.emptyRepBar = game.add.sprite(this.healthLabel.width + (2 * margin),
        this.emptyHealthBar.height + (3 * margin),
        'hud_emptyHealth');
    this.emptyRepBar.fixedToCamera = true;
    this.emptyRepBar.height = 25;
    this.fullRepBar = game.add.sprite(this.healthLabel.width + (2 * margin) + 2,
        this.emptyHealthBar.height + (3 * margin) + 2,
        'hud_fullRep');
    this.fullRepBar.fixedToCamera = true;
    this.barRealWidth = this.fullRepBar.width;
    this.fullRepBar.width /= 2;
    this.fullRepBar.height = this.emptyRepBar.height - 4;


    this.hudGroup = game.add.group();
    this.hudGroup.addMultiple([
        this.wpn,
        this.healthLabel,
        this.repLabel,
        this.scoreLabel,
        this.dayLabel,
        this.emptyHealthBar,
        this.fullHealthBar,
        this.emptyRepBar,
        this.fullRepBar,
    ]);
};

/**
 * pauses the game
 */
Play.pauseGame = function() {
    // This if statement prevents pausing while the inventory is open.
    if (game.paused == true && this.pauseBg.visible == false) {
        /* nop */
    } else {
        game.paused ? game.paused = false : game.paused = true;
        this.rippleGossip.togglePause();
        if (game.paused) {
            // reveal pause menu
            for (let i = 0; i < this.pauseMenu.length; i++) {
                this.pauseMenu[i].reveal();
                this.pauseBg.visible = true;
                this.pauseBg.alpha = 0.2;
            }
        } else {
            // hide the menu
            for (let i = 0; i < this.pauseMenu.length; i++) {
                this.pauseMenu[i].hide();
                this.pauseBg.visible = false;
                this.controlText.visible = false;
            }
        }
    }
};

/**
 * opens/closes the inventory
 */
let openTab = 'food';
let numPages = 1;
let currentPage = 1;

Play.toggleInventory = function() {
    /**
     * This if statement prevents opening the inventory
     * while the game is paused.
     */
    if (game.paused == true && this.invBg.visible == false) {} else {
        game.paused ? game.paused = false : game.paused = true;
        if (game.paused) {
            // reveal inventory
            this.currencyText.text = 'Currency: ' + this.player.currency;
            for (let i = 0; i < this.inventory.length; i++) {
                this.inventory[i].visible = true;
            }
            for (let j = 0; j < this.inventoryButtons.length; j++) {
                this.inventoryButtons[j].reveal();
            }
            currentPage = 1;
            for (let k = 0; k < this.inventoryImages.length; k++) {
                switch (openTab) {
                    case ('food'):
                        if (k < this.player.food.length) {
                            this.inventoryList[k].visible = true;
                            this.inventoryList[k].text = '- ' + this.player.food[k];
                            this.inventoryImages[k].visible = true;
                            this.inventoryImages[k].loadTexture(this.player.food[k]);
                            numPages = Math.floor(this.player.food.length / 5) + 1;
                            if (this.player.food.length % 5 == 0) numPages--;
                            if (numPages == 0) numPages = 1;
                            this.pageText.text = currentPage + '/' + numPages;
                        } else this.inventoryImages[k].visible = false;
                        break;
                    case ('weapons'):
                        if (k < this.player.weapons.length) {
                            this.inventoryList[k].visible = true;
                            this.inventoryList[k].text = '- ' + this.player.weapons[k];
                            this.inventoryImages[k].visible = true;
                            this.inventoryImages[k].loadTexture(this.player.weapons[k]);
                            numPages = Math.floor(this.player.weapons.length / 5) + 1;
                            if (this.player.weapons.length % 5 == 0) numPages--;
                            if (numPages == 0) numPages = 1;
                            this.pageText.text = currentPage + '/' + numPages;
                        } else this.inventoryImages[k].visible = false;
                        break;
                    case ('misc'):
                        if (k < this.player.misc.length) {
                            this.inventoryList[k].visible = true;
                            this.inventoryList[k].text = '- ' + this.player.misc[k];
                            this.inventoryImages[k].visible = true;
                            this.inventoryImages[k].loadTexture(this.player.misc[k]);
                            numPages = Math.floor(this.player.misc.length / 5) + 1;
                            if (this.player.misc.length % 5 == 0) numPages--;
                            if (numPages == 0) numPages = 1;
                            this.pageText.text = currentPage + '/' + numPages;
                        } else this.inventoryImages[k].visible = false;
                        break;
                }
            }
            this.invBg.visible = true;
        } else {
            // hide the inventory
            for (let i = 0; i < this.inventory.length; i++) {
                this.inventory[i].visible = false;
            }
            for (let j = 0; j < this.inventoryButtons.length; j++) {
                this.inventoryButtons[j].hide();
            }
            for (let k = 0; k < this.inventoryImages.length; k++) {
                this.inventoryImages[k].visible = false;
            }
            for (let l = 0; l < this.inventoryList.length; l++) {
                this.inventoryList[l].visible = false;
                this.inventoryList[l].text = '';
            }
            this.invBg.visible = false;
        }
    }
};

Play.create = function() {
    // this.player.bringToTop();
    this.itemGroup = game.add.group();
    this.bulletGroup = game.add.group();
    game.physics.arcade.overlap(this.blockLayer, this.bulletGroup,
        function(bullet, layer) {
            bullet.kill();
        },
        null, this
    );
    game.physics.arcade.overlap(this.blockOverlap, this.bulletGroup,
        function(bullet, layer) {
            bullet.kill();
        },
        null, this
    );
    /**
     * Check if we should load game.
     */
    if (loadedData) {
        this.loadBoard(loadedData);
    } else {
        this.populateBoard();
    }
    /**
     * Center camera on player
     */
    this.game.camera.follow(this.player);

    this.map.setCollisionBetween(1, 10000, true, this.blockLayer);
    this.map.setCollisionBetween(1, 10000, true, this.blockOverlap);


    /**
     * Day night cycle
     */
    this.light = game.add.graphics();
    this.light.beginFill(0x18007A);
    this.light.alpha = 0;
    this.light.drawRect(0, 0, game.camera.width, game.camera.height);
    this.light.fixedToCamera = true;
    this.light.endFill();
    this.dayTime = true;

    /**
     * Inventory set up
     */
    this.inventory = [];
    this.inventoryButtons = [];
    this.inventoryList = [];
    this.inventoryImages = [];

    /**
     * Dim background layer from Inventory Window.
     */
    this.invBg = game.add.graphics();
    this.invBg.beginFill(0x0);
    this.invBg.alpha = .2;
    this.invBg.visible = false;
    this.invBg.drawRect(0, 0, game.camera.width, game.camera.height);
    this.invBg.fixedToCamera = true;

    /**
     * Main Inventory Window.
     * This is the colored portion along with it's black outline.
     * This is also the inner square with the button backgrounds.
     */
    this.invWindow = game.add.graphics();
    this.invWindow.visible = false;
    this.invWindow.beginFill(0x0);
    this.invWindow.drawRect(game.camera.width / 4 - 5, game.camera.height * 0.125 - 5, game.camera.width / 2 + (2 * 5), game.camera.height * 0.75 + (2 * 5));
    this.invWindow.beginFill(0xffd633);
    this.invWindow.drawRect(game.camera.width / 4, game.camera.height * 0.125, game.camera.width / 2, game.camera.height * 0.75);
    this.invWindow.beginFill(0x0);
    this.invWindow.drawRect(game.camera.width / 4 + 10, game.camera.height * 0.33, game.camera.width / 2 - 20, game.camera.height / 2);
    this.invWindow.beginFill(0xc3c3c3);
    this.invWindow.drawRect(game.camera.width / 4 + 13, game.camera.height * 0.33 + 3, game.camera.width / 2 - 26, game.camera.height / 2 - 6);
    this.invWindow.beginFill(0x0);
    this.invWindow.drawRect(game.camera.width / 4 + 10, game.camera.height * 0.33 - 50, game.camera.width / 2 - 20, 50);
    this.invWindow.beginFill(0xc3c3c3);
    let labelWidth = ((game.camera.width / 2 - 26) - 6) * 0.3335;
    this.invWindow.drawRect(game.camera.width / 4 + 13, game.camera.height * 0.33 - 47, labelWidth, 50);
    this.invWindow.drawRect(game.camera.width / 4 + 13 + labelWidth + 3, game.camera.height * 0.33 - 47, labelWidth, 47);
    this.invWindow.drawRect(game.camera.width / 4 + 13 + (2 * (labelWidth + 3)), game.camera.height * 0.33 - 47, labelWidth, 47);

    /*
     * Creating the text and image slots (5 of them).
     */
    for (let j = 0; j < 5; j++) {
        this.temp = game.add.text(game.camera.width / 4 + 85, (j * 60) + game.camera.height * 0.33 + 55, '');

        this.temp.font = 'Press Start 2P';
        this.temp.fill = '#ffff00';
        this.temp.stroke = '#0';
        this.temp.strokeThickness = 5;
        this.temp.fontSize = '2em';
        this.temp.anchor.setTo(0, .5);
        this.temp.fixedToCamera = true;
        this.temp.visible = false;

        this.temp1 = game.add.sprite(game.camera.width / 4 + 50, (j * 60) + game.camera.height * 0.33 + 40, '');
        this.temp1.fixedToCamera = true;
        this.temp1.visible = false;
        this.temp1.width = 30;
        this.temp1.height = 30;

        this.inventoryList.push(this.temp);
        this.inventoryImages.push(this.temp1);
        this.inventory.push(this.inventoryList[j]);

        if (j < this.player.food.length) {
            this.inventoryList[j].text = '- ' + this.player.food[j];
            this.inventoryImages[j].loadTexture(this.player.food[j], 0, false);
        }
        this.inventoryList[j].visible = false;
        this.inventoryImages[j].visible = false;
    }

    if (this.player.food.length % 5 == 0) numPages--;
    if (numPages == 0) numPages = 1;
    this.pageText = game.add.text(game.camera.width / 2, game.camera.height * 0.75 + 20, currentPage + '/' + numPages);
    this.pageText.font = 'Press Start 2P';
    this.pageText.fill = '#ffff00';
    this.pageText.stroke = '#0';
    this.pageText.strokeThickness = 5;
    this.pageText.fontSize = '2em';
    this.pageText.anchor.setTo(.5, .5);
    this.pageText.fixedToCamera = true;
    this.pageText.visible = false;

    // Prev Page Button
    this.inventoryButtons.push(new UI.MenuButton(game.camera.width / 2 - 130,
        game.camera.height * 0.75 + 20, '< Prev', null, () => {
            // Calculates the current page and updates the label
            if (currentPage > 1) currentPage--;
            this.pageText.text = currentPage + '/' + numPages;

            // Repopulates the current 5 item slots
            for (let a = 0; a < this.inventoryList.length; a++) {
                let nextIndex = (currentPage - 1) * 5 + a;
                if ((openTab === 'food') && (nextIndex < this.player.food.length) ||
                    (openTab === 'weapons') && (nextIndex < this.player.weapons.length) ||
                    (openTab === 'misc') && (nextIndex < this.player.misc.length)) {
                    this.inventoryList[a].visible = true;
                    this.inventoryImages[a].visible = true;
                    switch (openTab) {
                        case ('food'):
                            this.inventoryImages[a].loadTexture(this.player.food[nextIndex]);
                            this.inventoryList[a].text = '- ' + this.player.food[nextIndex];
                            break;
                        case ('weapons'):
                            this.inventoryImages[a].loadTexture(this.player.weapons[nextIndex]);
                            this.inventoryList[a].text = '- ' + this.player.weapons[nextIndex];
                            break;
                        case ('misc'):
                            this.inventoryImages[a].loadTexture(this.player.misc[nextIndex]);
                            this.inventoryList[a].text = '- ' + this.player.misc[nextIndex];
                            break;
                    }
                } else {
                    this.inventoryList[a].visible = false;
                    this.inventoryImages[a].visible = false;
                }
            }
        }, '1.5em'));

    // Next Page Button
    this.inventoryButtons.push(new UI.MenuButton(game.camera.width / 2 + 130,
        game.camera.height * 0.75 + 20, 'Next >', null, () => {
            // Calculates currentPage and updates label.
            if (currentPage < numPages) currentPage++;
            this.pageText.text = currentPage + '/' + numPages;

            // Repopulates the current 5 item slots
            for (let a = 0; a < this.inventoryList.length; a++) {
                let nextIndex = (currentPage - 1) * 5 + a;
                if ((openTab === 'food') && (nextIndex < this.player.food.length) ||
                    (openTab === 'weapons') && (nextIndex < this.player.weapons.length) ||
                    (openTab === 'misc') && (nextIndex < this.player.misc.length)) {
                    this.inventoryList[a].visible = true;
                    this.inventoryImages[a].visible = true;
                    switch (openTab) {
                        case ('food'):
                            this.inventoryImages[a].loadTexture(this.player.food[nextIndex]);
                            this.inventoryList[a].text = '- ' + this.player.food[nextIndex];
                            break;
                        case ('weapons'):
                            this.inventoryImages[a].loadTexture(this.player.weapons[nextIndex]);
                            this.inventoryList[a].text = '- ' + this.player.weapons[nextIndex];
                            break;
                        case ('misc'):
                            this.inventoryImages[a].loadTexture(this.player.misc[nextIndex]);
                            this.inventoryList[a].text = '- ' + this.player.misc[nextIndex];
                            break;
                    }
                } else {
                    this.inventoryList[a].visible = false;
                    this.inventoryImages[a].visible = false;
                }
            }
        }, '1.5em'));

    let startX = game.camera.width / 4 + 115;
    // Food button
    this.inventoryButtons.push(new UI.MenuButton(startX,
        game.camera.height * 0.33 - 20, '  Food  ', null, () => {
            openTab = 'food';
            currentPage = 1;
            numPages = Math.floor(this.player.food.length / 5) + 1;
            if (this.player.food.length % 5 == 0) numPages--;
            if (numPages == 0) numPages = 1;
            this.pageText.text = currentPage + '/' + numPages;
            this.invWindow.beginFill(0xc3c3c3);
            this.invWindow.drawRect(game.camera.width / 4 + 13, game.camera.height * 0.33, labelWidth, 3);
            this.invWindow.beginFill(0x0);
            this.invWindow.drawRect(game.camera.width / 4 + 13 + labelWidth + 3, game.camera.height * 0.33, labelWidth, 3);
            this.invWindow.drawRect(game.camera.width / 4 + 13 + (2 * (labelWidth + 3)), game.camera.height * 0.33, labelWidth, 3);
            for (let x = 0; x < 5; x++) {
                if (x >= this.player.food.length) {
                    this.inventoryList[x].visible = false;
                    this.inventoryImages[x].visible = false;
                } else {
                    this.inventoryList[x].text = '- ' + this.player.food[x];
                    this.inventoryImages[x].loadTexture(this.player.food[x], 0, false);
                    this.inventoryImages[x].visible = true;
                    this.inventoryList[x].visible = true;
                }
            }
        }, '1.5em'));

    // Weapon Button
    this.inventoryButtons.push(new UI.MenuButton(startX + labelWidth + 3,
        game.camera.height * 0.33 - 20, '  Weapons  ', null, () => {
            openTab = 'weapons';
            currentPage = 1;
            numPages = Math.floor(this.player.weapons.length / 5) + 1;
            if (this.player.weapons.length % 5 == 0) numPages--;
            if (numPages == 0) numPages = 1;
            this.pageText.text = currentPage + '/' + numPages;
            this.invWindow.beginFill(0x0);
            this.invWindow.drawRect(game.camera.width / 4 + 13, game.camera.height * 0.33, labelWidth, 3);
            this.invWindow.beginFill(0xc3c3c3);
            this.invWindow.drawRect(game.camera.width / 4 + 13 + labelWidth + 3, game.camera.height * 0.33, labelWidth, 3);
            this.invWindow.beginFill(0x0);
            this.invWindow.drawRect(game.camera.width / 4 + 13 + (2 * (labelWidth + 3)), game.camera.height * 0.33, labelWidth, 3);
            for (let x = 0; x < 5; x++) {
                if (x >= this.player.weapons.length) {
                    this.inventoryList[x].visible = false;
                    this.inventoryImages[x].visible = false;
                } else {
                    this.inventoryList[x].text = '- ' + this.player.weapons[x];
                    this.inventoryImages[x].loadTexture(this.player.weapons[x], 0, false);
                    this.inventoryImages[x].visible = true;
                    this.inventoryList[x].visible = true;
                }
            }
        }, '1.5em'));

    // Misc Button
    this.inventoryButtons.push(new UI.MenuButton(startX + (2 * labelWidth) + 6,
        game.camera.height * 0.33 - 20, '  Misc  ', null, () => {
            openTab = 'misc';
            currentPage = 1;
            numPages = Math.floor(this.player.misc.length / 5) + 1;
            if (this.player.misc.length % 5 == 0) numPages--;
            if (numPages == 0) numPages = 1;
            this.pageText.text = currentPage + '/' + numPages;
            this.invWindow.beginFill(0x0);
            this.invWindow.drawRect(game.camera.width / 4 + 13, game.camera.height * 0.33, labelWidth, 3);
            this.invWindow.drawRect(game.camera.width / 4 + 13 + labelWidth + 3, game.camera.height * 0.33, labelWidth, 3);
            this.invWindow.beginFill(0xc3c3c3);
            this.invWindow.drawRect(game.camera.width / 4 + 13 + (2 * (labelWidth + 3)), game.camera.height * 0.33, labelWidth, 3);
            for (let x = 0; x < 5; x++) {
                if (x >= this.player.misc.length) {
                    this.inventoryList[x].visible = false;
                    this.inventoryImages[x].visible = false;
                } else {
                    this.inventoryList[x].text = '- ' + this.player.misc[x];
                    this.inventoryImages[x].loadTexture(this.player.misc[x], 0, false);
                    this.inventoryImages[x].visible = true;
                    this.inventoryList[x].visible = true;
                }
            }
        }, '1.5em'));

    // "Inventory" text
    this.invTitle = game.add.text(game.camera.width / 2, game.camera.height * 0.125 + 25, 'Inventory');
    this.invTitle.font = 'Press Start 2P';
    this.invTitle.fill = '#ffff00';
    this.invTitle.stroke = '#0';
    this.invTitle.strokeThickness = 5;
    this.invTitle.fontSize = '3em';
    this.invTitle.anchor.setTo(.5, .5);
    this.invTitle.align = 'left';
    this.invTitle.fixedToCamera = true;
    this.invTitle.visible = false;

    // "Currency" text
    this.currencyText = game.add.text(game.camera.width / 4 + 10, game.camera.height * 0.125 + 65, 'Currency: 0');
    this.currencyText.font = 'Press Start 2P';
    this.currencyText.fill = '#ffff00';
    this.currencyText.stroke = '#0';
    this.currencyText.strokeThickness = 5;
    this.currencyText.fontSize = '2em';
    this.currencyText.anchor.setTo(0, .5);
    this.currencyText.fixedToCamera = true;
    this.currencyText.visible = false;
    // "Gems" text
    this.gemText = game.add.text(
        game.camera.width * 0.75 - 10,
        game.camera.height * 0.125 + 65,
        'Gems: 0'
    );
    this.gemText.font = 'Press Start 2P';
    this.gemText.fill = '#ffff00';
    this.gemText.stroke = '#0';
    this.gemText.strokeThickness = 5;
    this.gemText.fontSize = '2em';
    this.gemText.anchor.setTo(1, .5);
    this.gemText.fixedToCamera = true;
    this.gemText.visible = false;

    this.invWindow.fixedToCamera = true;

    this.inventory.push(this.invWindow);
    this.inventory.push(this.invTitle);
    this.inventory.push(this.currencyText);
    this.inventory.push(this.gemText);
    this.inventory.push(this.pageText);

    // hide the inventory
    for (let k = 0; k < this.inventoryButtons.length; k++) {
        this.inventoryButtons[k].text.fill = '#ffff00';
        this.inventoryButtons[k].text.stroke = '#0';
        this.inventoryButtons[k].text.strokeThickness = 5;
        this.inventoryButtons[k].hide();
    }

    /**
     * Pause menu set up
     */
    this.pauseMenu = [];
    // pause background
    this.pauseBg = game.add.graphics();
    this.pauseBg.beginFill(0x0);
    this.pauseBg.alpha = .2;
    this.pauseBg.visible = false;
    this.pauseBg.drawRect(0, 0, game.camera.width, game.camera.height);
    this.pauseBg.fixedToCamera = true;


    // controls
    let strControls = 'Controls:\n\n' +
        'Movement:\n - W, A, S, D: Move Up, Left, Down, Right respectively.\n' +
        ' - Shift:      Sprint\n\n' +
        'Attacking:\n' +
        ' - M: Melee. Only if a melee weapon is equipped.\n' +
        ' - N: Shoot. Only if a shooting weapon is equipped.\n' +
        ' - To change your weapon, click either \'<\' or \'>\' in the\n' +
        '   top-right of the Heads Up Display.\n\n' +
        'Looting:\n' +
        ' - L: Loot. Pick up items that NPCs drop.\n' +
        '      *Note: For convenience, Food items are looted automatically.\n' +
        ' - I: Inventory. Open your Inventory to view looted items.\n\n' +
        'Health:\n' +
        ' - E: Eat. Removes first food item from Inventory. +10 HP.\n\n' +
        'Other:\n' +
        ' - Esc: Toggle Pause Menu. Press now to return to the game.';
    this.controlText = game.add.text(game.camera.width * 0.5, 100, strControls);
    this.controlText.font = 'Press Start 2P';
    this.controlText.fill = '#ff9100';
    this.controlText.stroke = '#0';
    this.controlText.strokeThickness = 5;
    this.controlText.fontSize = '1.5em';
    this.controlText.anchor.setTo(.5, 0);
    this.controlText.align = 'left';
    this.controlText.fixedToCamera = true;
    this.controlText.visible = false;
    // add a save button
    this.pauseMenu.push(new UI.MenuButton(game.camera.width / 2,
        200, '  Save  ', null, () => {
            console.log('Manually saving');
            this.pauseMenu[0].text.text = '  Save ' +
                String.fromCodePoint(0x1F60A);
            setTimeout(() => {
                this.pauseMenu[0].text.text = '  Save  ';
            }, 750);
            dataStore.manualSaveState();
        }, '4.5em'));
    // add a settings button
    this.pauseMenu.push(new UI.MenuButton(game.camera.width / 2,
        300, window.isFullScreen() ? 'Windowed' : 'Fullscreen',
        null, () => {
            console.log('fulscreen toggled');
            game.paused = false;
            window.setResizable(true);
            window.setFullScreenable(true);
            if (window.isFullScreen()) {
                window.setFullScreen(false);
                this.pauseMenu[1].text.text = 'Fullscreen';
            } else {
                window.setFullScreen(true);
                this.pauseMenu[1].text.text = 'Windowed';
            }
            window.setResizable(false);
            window.setFullScreenable(false);
            game.paused = true;
        }, '4.5em'));
    // add a menu button
    this.pauseMenu.push(new UI.MenuButton(game.camera.width / 2,
        500, 'Main Menu', null, () => {
            game.input.keyboard.onDownCallback = null;
            game.state.start('Menu');
            game.paused = false;
        }, '4.5em'));
    // add resume button
    this.pauseMenu.push(new UI.MenuButton(game.camera.width / 2,
        100, 'Resume', null, () => {
            this.pauseGame();
        }, '4.5em'));
    // add controls button
    this.pauseMenu.push(new UI.MenuButton(game.camera.width / 2,
        400, 'Controls', null, () => {
            this.pauseBg.alpha = 0.8;
            this.controlText.visible = true;
            for (let i = 0; i < this.pauseMenu.length; i++) {
                this.pauseMenu[i].text.fill = '#00bbff';
                this.pauseMenu[i].text.stroke = '#0';
                this.pauseMenu[i].text.strokeThickness = 5;
                this.pauseMenu[i].hide();
            }
        }, '4.5em'));
    // hide the pause menu
    for (let i = 0; i < this.pauseMenu.length; i++) {
        this.pauseMenu[i].text.fill = '#00bbff';
        this.pauseMenu[i].text.stroke = '#0';
        this.pauseMenu[i].text.strokeThickness = 5;
        this.pauseMenu[i].hide();
    }

    /**
     * Setting datastore callback interval
     *
     * Start autosaving 10 seconds after game starts
     */
    let i = setInterval(() => {
        this.entitiesGroup.forEachAlive(dataStore.autosaveEntity);
    }, 1000);
    timerIDs.push(i);

    game.world.bringToTop(this.hudGroup);

    this.rippleGossip = new Ripple();
    i = setInterval(() => {
        /**
         * Trigger a few conversations
         */
        /**
         * Build the datastructure keeping track of Entities
         *
         * Period: 1.5 sec
         *
         * What I did here is call the things immediately and then
         */
        this.generateMap();
        let totalEntities =
            this.entitiesGroup.total - 1;
        Map.discreteSamples(Math.floor(totalEntities / 3))
            .forEach(function(p, i) {
                this.rippleGossip.triggerGossip(p);
            }, this);
    }, 1000);
    timerIDs.push(i);
};

Play.update = function() {
    if (this.player.state === 'dead') {
        game.score = this.player.score;
        game.dayCount = this.player.daysSurvived;
        setTimeout(() => {
            game.state.start('Game Over');
        }, 2000);
    }

    const hpPercent = this.player.HP / this.player.maxHP;
    this.fullHealthBar.width = (146 * (hpPercent));
    while (this.fullHealthBar.width < (146 * (hpPercent))) {
        this.fullHealthBar.width += 1;
    }

    this.scoreLabel.text = 'Score: ' + this.player.score;
    this.dayLabel.text = 'Day ' + this.player.daysSurvived;
    /**
     * Debug Stuff
     */
    // game.debug.body(this.player);
    // this.navMesh.navMesh.debugClear(); // Clears the overlay
    //     this.navMesh.navMesh.debugDrawMesh({
    //     drawCentroid: false, drawBounds: false,
    //      drawNeighbors: false, drawPortals: false,
    // });


    // day / night cycle
    if (this.dayTime) {
        this.light.alpha += .0001;
    } else {
        this.light.alpha -= .0007;
    }
    if (this.light.alpha <= 0 && this.dayTime === false) {
        this.dayTime = true;
        this.player.daysSurvived++;
        this.light.alpha = 0;
    }
    if (this.light.alpha >= .5) {
        this.dayTime = false;
    }

    /**
     * Deal with collision of entities
     */
    game.physics.arcade.collide(this.entitiesGroup, this.blockLayer);
    game.physics.arcade.collide(this.entitiesGroup, this.blockOverlap);
    game.physics.arcade.collide(this.entitiesGroup, this.entitiesGroup,
        entityCollision, null, this);
    game.physics.arcade.overlap(
        this.player, this.itemGroup, itemCollision, null, this
    );
    game.physics.arcade.overlap(
        this.entitiesGroup, this.bulletGroup, bulletCollision, null, this
    );

    /**
     * NPC Code
     *
     * Threshold distance to attack is 8 tiles.
     * => 4 tiles on either side
     * => Distance to player = 128
     * => 128^2 = 16384
     */
    let tL = new Phaser.Point(772, 448);
    let bR = new Phaser.Point(3426, 2893);
    let tL2 = new Phaser.Point(3151, 568);
    let bR2 = new Phaser.Point(4452, 3565);

    this.entitiesGroup.sort('y', Phaser.Group.SORT_ASCENDING);

    this.entitiesGroup.forEach((e) => {
        if (!e) return;
        if (e.state === 'dead') e.sendToBack();
        if (e.type === 'npc') {
            /**
             * NOTE(anand):
             *
             * At this point, the NPC can either attack the player
             * or run away if they dont like the player
             * or do nothing otherwise.
             *
             * What I will do is this.
             *
             * If Reputation is below 0 (it will always be >= -1):
             * Generate a random number between -1 and 0.
             * - If the number lies between -1 and the reputation
             *   - avoid the player
             * - Else
             *   - attck the player
             * Else (Rep >= 0)
             * - wander
             */
            let attitude = 'neutral';
            if (e.reputation < 0) {
                let decision = -Math.random();
                if (decision > e.reputation) {
                    attitude = 'aggressive';
                }
            }
            e.updateAI(this.navMesh, tL, bR, this.player, attitude);
        } else if (e.type === 'monster') {
            /**
             * NOTE(anand):
             *
             * For monster, I will attack regardless,
             * but I will sprint if I realllllly don't
             * like the player (less than -0.8?)
             */
            let attitude = 'aggressive';
            if (e.reputation < -0.8) {
                // Really aggro
                e.slowSprint = e.sprintSpeed;
                e.sprintSpeed = 2 * e.slowSprint;
            }
            e.updateAI(this.navMesh,
                tL2, bR2, this.player, attitude);
        }
    });

    /**
     * PLAYER CODE
     */
    if (this.player.state === 'dead') return;
    // Displays the hitbox for the Player
    // this.game.debug.body(this.player);
    // game.debug.body(this.player.collideBox);
    // game.debug.bodyInfo(this.player.collideBox, 32, 32);

    // SHIFT for running
    let sprint = false;
    if (this.keyboard.isDown(Phaser.Keyboard.SHIFT)) {
        sprint = true;
    }

    if (this.keyboard.isDown(Phaser.Keyboard.E)) {
        if (this.player.eatAgain == 1 &&
            this.player.food.length > 0 &&
            this.player.HP < 100) {
            this.player.eatAgain = 0;
            this.player.HP += 10;
            if (this.player.HP > 100) this.player.HP = 100;
            this.player.food.splice(0, 1);
        }
    } else this.player.eatAgain = 1;

    // Shoot
    if ((this.keyboard.isDown(Phaser.Keyboard.N)) &&
        (this.player.weapons[this.player.currentWeapon] === 'Bow')) {
        console.log(this.player.state);
        if (this.player.state !== 'shooting') {
            this.player.shoot();
            setTimeout(() => {
                let tempBullet = null;
                switch (this.player.direction) {
                    case ('up'):
                        tempBullet = game.add.sprite(
                            this.player.body.x, this.player.body.y, 'Arrow_Up'
                        );
                        game.physics.enable(
                            tempBullet, Phaser.Physics.ARCADE
                        );
                        tempBullet.body.velocity.y = -500;
                        break;
                    case ('down'):
                        tempBullet = game.add.sprite(
                            this.player.body.x, this.player.body.y, 'Arrow_Down'
                        );
                        game.physics.enable(tempBullet, Phaser.Physics.ARCADE);
                        tempBullet.body.velocity.y = 500;
                        break;
                    case ('left'):
                        tempBullet = game.add.sprite(
                            this.player.body.x, this.player.body.y, 'Arrow_Left'
                        );
                        game.physics.enable(tempBullet, Phaser.Physics.ARCADE);
                        tempBullet.body.velocity.x = -500;
                        break;
                    case ('right'):
                        tempBullet = game.add.sprite(
                            this.player.body.x, this.player.body.y, 'Arrow_Right'
                        );
                        game.physics.enable(tempBullet, Phaser.Physics.ARCADE);
                        tempBullet.body.velocity.x = 500;
                        break;
                }
                tempBullet.visible = true;
                game.world.add(tempBullet);
                this.bulletGroup.add(tempBullet);

                /**
                 * @todo(anand): 
                 */
                setTimeout(() => {
                    tempBullet.kill();
                    this.bulletGroup.remove(tempBullet);
                }, 10000);
            }, 500);
        }
    } else {
        let temp = this.player.frame - 207;
        if ((temp % 13 === 0)) {
            this.player.state = 'idling';
        }
    }

    // Attack
    if ((this.keyboard.isDown(Phaser.Keyboard.M)) &&
        (this.player.state !== 'attacking') &&
        (this.player.weapons[this.player.currentWeapon] === 'Dagger')) {
        this.player.attack();
    } else {
        /**
         * attacking == false
         * iff we are on the last frame. ie. the whole animation has played.
         */
        //
        let temp = this.player.frame - 161;
        if ((temp % 13 === 0) && (this.player.state === 'attacking')) {
            if (!(this.keyboard.isDown(Phaser.Keyboard.M))) {
                this.player.state = 'idling';
            }
        }
    }

    // Moving the player, but only if you aren't attacking.

    if (this.keyboard.isDown(Phaser.Keyboard.W)) {
        this.player.moveInDirection('up', sprint);
    } else if (this.keyboard.isDown(Phaser.Keyboard.S)) {
        this.player.moveInDirection('down', sprint);
    } else if (this.keyboard.isDown(Phaser.Keyboard.A)) {
        this.player.moveInDirection('left', sprint);
    } else if (this.keyboard.isDown(Phaser.Keyboard.D)) {
        this.player.moveInDirection('right', sprint);
    } else if ((this.player.state !== 'attacking')
                && (this.player.state !== 'shooting')) {
        this.player.idleHere();
    }

    /**
     * Deciding which character to render on top of the other.
     *
     * @todo(anand): Only do this check for the nearest 4 neighbors.
     */
    // let nearest4 = Map.nearest(this.player);
    // nearest4.forEach((entity) => {
    //     // console.log(JSON.stringify([entity[0].trueXY(), entity[1]]));
    //     if ((this.player.y + this.player.height) >
    //      (entity[0].y + entity[0].height)) {
    //         game.world.bringToTop(this.player);
    //         // console.log('player on top');
    //     } else {
    //         // console.log('entity on top');
    //         game.world.bringToTop(entity[0]);
    //     }
    // });

    let totalEntities = this.entitiesGroup.total - 1;
    let repNum = 0;
    let repSum = 0;
    Map.nearest(this.player, totalEntities, game.camera.width / 2)
        .forEach((point) => {
            /**
             * Get the average reputation of all the entities withing
             * the screen.
             */
            if (point[0].alive) {
                repSum += point[0].reputation;
                repNum += 1;
            }
        });
    let avgRep = (isNaN(repSum / repNum)) ? 0 : repSum / repNum;
    // console.log('Average Reputation: ' + avgRep);
    this.fullRepBar.width = (this.barRealWidth / 2) * (1 + (avgRep));
    if (this.fullRepBar.width < this.barRealWidth / 2) {
        this.fullRepBar.tint = 0x800000;
    } else if (this.fullRepBar.width > this.barRealWidth / 2) {
        this.fullRepBar.tint = 0x66ff33;
    } else {
        this.fullRepBar.tint = 0x999999;
    }
};
let r = 0;

/**
 * 
 * @param {Entity} entity 
 * @param {Phaser.Sprite} bullet 
 */
function bulletCollision(entity, bullet) {
    if (entity !== this.player) {
        if (entity.state !== 'dead') {
            switch (entity.type) {
                case 'npc':
                    let coins = Math.floor(Math.random() * 4) + 2;
                    this.player.currency += coins;

                    r = Math.floor(Math.random() * 2);
                    if (r == 1) {
                        r = Math.floor(Math.random() * 4);
                        let k = '';
                        if (r == 0) k = 'Carrot';
                        if (r == 1) k = 'Apple';
                        if (r == 2) k = 'Pear';
                        if (r == 3) k = 'Mutton';
                        let i = new Item(entity.x + (entity.width / 2), entity.y + (entity.height / 2), k, 'food');
                        this.itemGroup.add(i);
                    }
                    break;
                case 'monster':
                    r = Math.floor(Math.random() * 5);
                    if (r == 1) {
                        r = Math.floor(Math.random() * 3);
                        let k = '';
                        if (r == 0) k = 'Tusk';
                        if (r == 1) k = 'Cigar';
                        if (r == 2) k = 'Book';
                        let i = new Item(entity.x + (entity.width / 2), entity.y + (entity.height / 2), k, 'misc');
                        this.itemGroup.add(i);
                    }
                    this.player.score++;
                    break;
            }

            bullet.kill();
            entity.die();
            entity.body.enable = false;
            this.engageGossip(entity, this.player, 'kill');
        }
    }
};

/**
 * 
 * @param {Player} player 
 * @param {Phaser.Sprite} item 
 */
function itemCollision(player, item) {
    if (item.type === 'food' || this.keyboard.isDown(Phaser.Keyboard.L)) {
        item.kill();
        this.itemGroup.remove(item);
        this.player.converse('+' + item.key);
        this.player.addToInventory(item.key, item.type);
    }
};


/**
 * Handle collision between two `Entities`
 *
 * This needs to be run in the context of Play state
 *
 * @param {any} entity1
 * @param {any} entity2
 */
function entityCollision(entity1, entity2) {
    // entity2 seems to be the Player, and entity1 is the Enemy
    if (entity1.frame === 272) {
        entity1.kill();
        return;
    }
    if (entity2.frame === 272) {
        entity2.kill();
        return;
    }
    /**
     * @todo(anand): Handle code to get injured
     */

    if (game.physics.arcade.collide(entity1, this.blockLayer) ||
        game.physics.arcade.collide(entity1, this.blockOverlap) ||
        game.physics.arcade.collide(entity2, this.blockLayer) ||
        game.physics.arcade.collide(entity2, this.blockOverlap)) {
        return;
    }


    // This block handles when an entity collided with an attacking entitity
    let dead = null;
    let perp = null;
    let action = '';

    if (entity2.state === 'attacking') {
        entity2.attack();
        let f2 = entity2.animations.currentAnim.frame;
        if (f2 == 158 || f2 == 184 || f2 == 171 || f2 == 197) { // if statement should be replaced eventually with an entity state called 'injured'
            this.calculateDamage(entity2, entity1);
        }
    }
    if (entity1.state === 'attacking') {
        entity1.attack();
        let f1 = entity1.animations.currentAnim.frame;
        if (f1 == 158 || f1 == 184 || f1 == 171 || f1 == 197) { // if statement should be replaced eventually with an entity state called 'injured'
            this.calculateDamage(entity1, entity2);
        }
    }

    if (entity1.state === 'dead') {
        dead = entity1;
        perp = entity2;
        action = 'kill';
        this.engageGossip(dead, perp, action);
    }

    if (entity2.state === 'dead') {
        dead = entity2;
        perp = entity1;
        action = 'kill';
        this.engageGossip(dead, perp, action);
    }
    /**
     * @todo(anand): Need to implement Game Over
     */
    let r;
    if (dead && perp && action) {
        if (perp.type === 'player') {
            switch (dead.type) {
                case 'npc':
                    let coins = Math.floor(Math.random() * 4) + 2;
                    this.player.currency += coins;

                    r = Math.floor(Math.random() * 2);
                    if (r == 1) {
                        r = Math.floor(Math.random() * 4);
                        let k = '';
                        if (r == 0) k = 'Carrot';
                        if (r == 1) k = 'Apple';
                        if (r == 2) k = 'Pear';
                        if (r == 3) k = 'Mutton';
                        let i = new Item(dead.x + (dead.width / 2), dead.y + (dead.height / 2), k, 'food');
                        this.itemGroup.add(i);
                    }
                    break;
                case 'monster':
                    r = Math.floor(Math.random() * 5);
                    if (r == 1) {
                        r = Math.floor(Math.random() * 3);
                        let k = '';
                        if (r == 0) k = 'Tusk';
                        if (r == 1) k = 'Cigar';
                        if (r == 2) k = 'Book';
                        let i = new Item(dead.x + (dead.width / 2), dead.y + (dead.height / 2), k, 'misc');
                        this.itemGroup.add(i);
                    }
                    this.player.score++;
                    break;
            }
        }

        // let nearest = Map.nearest(this.player, 3, 256);
        // nearest.forEach(function(p, i) {
        //     if (p[0].state !== 'dead') {
        //         let witness =p[0];
        //         this.rippleGossip.createRumor(
        //             witness,
        //             dead,
        //             perp,
        //             action);
        //     }
        // }, this);
        let nearest = Map.nearest(this.player, 3, 256);
        let numWitnesses = Math.floor(Math.random() * nearest.length);
        let witnesses = Sampling.sample_from_array(nearest, numWitnesses, false);

        if (!witnesses) return;
        witnesses.forEach(function(p, i) {
            if (p[0].state !== 'dead') {
                let witness = p[0];
                this.rippleGossip.createRumor(
                    witness,
                    dead,
                    perp,
                    action);
            }
        }, this);
    }
}

Play.populateBoard = function() {
    this.entitiesGroup = game.add.group();
    this.monsterGroup = game.add.group();
    this.npcGroup = game.add.group();
    /**
     * Generate a factory and a few monsters
     */
    this.monsterFactory = new Factory(Monster, this.monsterGroup,
        monsterBounds, 30);
    for (let i = 0; i < 30; i++) {
        /**
         * Generate a random location withing 3/4ths of the map
         */
        this.monsterFactory.next(null, null, 'enemy');
    }
    this.monsters = this.monsterGroup.getAll();
    /**
     * Generate a factory and a few NPCs
     */
    this.npcFactory = new Factory(NPC, this.npcGroup, npcBounds, 40);
    for (let i = 0; i < 40; i++) {
        /**
         * Generate a random location withing 3/4ths of the map
         */
        this.npcFactory.next(null, null, 'woman');
    }
    this.npcs = this.npcGroup.getAll();
    /**
     * Create the Player, setting location and naming as 'player'.
     * Giving him Physics and allowing collision with the world boundaries.
     */
    this.player = new Player(1971,
        504,
        'player');

    /**
     * Add all Entities to the same group.
     */
    this.entitiesGroup.addMultiple(this.monsterGroup.getAll());
    this.entitiesGroup.addMultiple(this.npcGroup.getAll());
    this.entitiesGroup.add(this.player);
};

Play.loadBoard = function(data) {
    let playerData = data.player;
    let monstersData = data.monsters;
    let npcData = data.npc;

    /**
     * Generate a factory and a few monsters
     */
    this.monsterGroup = game.add.group();
    this.monsterFactory = new Factory(Monster, this.monsterGroup,
        monsterBounds, Object.keys(monstersData).length);
    let i = 0;
    for (let id in monstersData) {
        if (Object.prototype.hasOwnProperty.call(monstersData, id)) {
            i = i + 1;
            // console.debug('Monster #' + i);
            let e = monstersData[id];
            let E = this.monsterFactory.next(e.x, e.y, e.key);
            E.deserialize(e);
        }
    }
    this.monsters = this.monsterGroup.getAll();
    /**
     * Generate a factory and a few NPCs
     */
    i = 0;
    this.npcGroup = game.add.group();
    this.npcFactory = new Factory(NPC, this.npcGroup, npcBounds,
        Object.keys(npcData).length);
    for (let id in npcData) {
        if (Object.prototype.hasOwnProperty.call(npcData, id)) {
            i = i + 1;
            // console.debug('NPC #' + i);
            let e = npcData[id];
            let E = this.npcFactory.next(e.x, e.y, e.key);
            E.deserialize(e);
        }
    }
    this.npcs = this.npcGroup.getAll();

    /**
     * Create the Player, setting location and naming as 'player'.
     * Giving him Physics and allowing collision with the world boundaries.
     */
    this.player = new Player(playerData.x, playerData.y, playerData.key);
    this.player.deserialize(playerData);

    /**
     * Add all Entities to the same group.
     */
    this.entitiesGroup = game.add.group();
    this.entitiesGroup.addMultiple(this.monsterGroup.getAll());
    this.entitiesGroup.addMultiple(this.npcGroup.getAll());
    this.entitiesGroup.add(this.player);
};


Play.generateMap = function() {
    // setTimeout(() => {
    this.entitiesGroup.removeChild(this.player);
    let entities = this.entitiesGroup.getAll();
    this.entitiesGroup.add(this.player);
    // entities.push(this.player);
    // I see no point in adding the player
    // this.monsterGroup.forEachAlive(function(monster) {
    //     entities.push(monster);
    // });
    // this.npcGroup.forEachAlive(function(npc) {
    //     entities.push(npc);
    // });
    Map.create(entities);
    // }, 1500);
};

Play.autosaveData = function() {
    setTimeout(() => {
        this.entitiesGroup.forEachAlive(dataStore.autosaveEntity);
    }, 1000);
};

Play.manualSaveData = function() {
    const self = this;
    self.entitiesGroup.forEachAlive(dataStore.autosaveEntity);
};

/**
 * This will return the distance to the player squared.
 *
 * Square root calculation is not trivial.
 *
 * @param {Entity} entity
 * @return {number}
 */
Play.getPlayerDistance2 = function(entity) {
    let player = this.player.trueXY();
    let e = entity.trueXY();
    return Math.pow(player.x - e.x, 2) + Math.pow(player.y - e.y, 2);
};

Play.shutdown = function() {
    if (this.rippleGossip) {
        this.rippleGossip.kill();
    }
    Map.reset();
    timerIDs.forEach((id) => {
        clearInterval(id);
    });
};

Play.calculateDamage = function(attacker, defender) {
    defender.HP = defender.HP - (attacker.attackStat / defender.defenseStat);
    if (defender.HP == 0) {
        defender.die();
        defender.body.enable = false;
    }
};

Play.engageGossip = function(dead, perp, action) {
    if (dead && perp && action) {
        if (perp.type === 'player') {
            switch (dead.type) {
                case 'npc':
                    console.log('Killed an NPC :(');
                    break;
                case 'monster':
                    // this.player.score++;
                    break;
            }
        }

        // let nearest = Map.nearest(this.player, 3, 256);
        // nearest.forEach(function(p, i) {
        //     if (p[0].state !== 'dead') {
        //         let witness =p[0];
        //         this.rippleGossip.createRumor(
        //             witness,
        //             dead,
        //             perp,
        //             action);
        //     }
        // }, this);
        let nearest = Map.nearest(this.player, 3, 256);
        let numWitnesses = Math.floor(Math.random() * nearest.length);
        let witnesses = Sampling.sample_from_array(
            nearest, numWitnesses, false
        );

        if (!witnesses) return;
        witnesses.forEach(function(p, i) {
            if (p[0].state !== 'dead') {
                let witness = p[0];
                this.rippleGossip.createRumor(
                    witness,
                    dead,
                    perp,
                    action);
            }
        }, this);
    }
};

Phaser.Tilemap.prototype.setCollisionBetween = function(start, stop,
    collides, layer, recalculate) {
    if (collides === undefined) {
        collides = true;
    }
    if (layer === undefined) {
        layer = this.currentLayer;
    }
    if (recalculate === undefined) {
        recalculate = true;
    }

    layer = this.getLayer(layer);

    for (let index = start; index <= stop; index++) {
        if (collides) {
            this.collideIndexes.push(index);
        } else {
            let i = this.collideIndexes.indexOf(index);

            if (i > -1) {
                this.collideIndexes.splice(i, 1);
            }
        }
    }

    for (let y = 0; y < this.layers[layer].height; y++) {
        for (let x = 0; x < this.layers[layer].width; x++) {
            let tile = this.layers[layer].data[y][x];

            if (tile && tile.index >= start && tile.index <= stop) {
                if (collides) {
                    tile.setCollision(true, true, true, true);
                } else {
                    tile.resetCollision();
                }

                tile.faceTop = collides;
                tile.faceBottom = collides;
                tile.faceLeft = collides;
                tile.faceRight = collides;
            }
        }
    }

    if (recalculate) {
        //  Now re-calculate interesting faces
        this.calculateFaces(layer);
    }

    return layer;
};

module.exports = Play;
