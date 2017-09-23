let Play = {};

Play.init = function () {

};

Play.create = function () {
    // Anand did this part. I don't even know.
    this.map = game.add.tilemap('map1');
    this.map.addTilesetImage('outdoors', 'tileset');
    this.bgLayer = this.map.createLayer('bgLayer');
    this.blockLayer = this.map.createLayer('blkLayer');
    this.game.add.existing(this.blockLayer);
    this.map.setCollisionBetween(1, 2000, true, 'blkLayer');
    this.bgLayer.resizeWorld();

    // Input for game
    this.keyboard = game.input.keyboard;

    // Create the Player, setting location and naming as
    // 'player'. Giving him Physics and
    // allowing collision with the world 
    // boundaries.his.player = game.add.sprite(window.innerWidth / 2,
    //  window.innerHeight / 2, 'player');
    game.physics.enable(this.player, Phaser.Physics.ARCADE);
    this.player.body.collideWorldBounds = true;

    // Adding animations for the player. 1 spritesheet contains every movement. 
    // You target sections of the sprite sheet by using array[0...n],
    // where 0 is the top left corner of the image
    // and n is the bottom right corner of the image. 
    // Spritesheets and their corresponding integers
    // count left to right, top to bottom.

    this.player.animations.add('walk4',
     [118, 119, 120, 121, 122, 123, 124, 125], 10, true);
    this.player.animations.add('walk1',
     [105, 106, 107, 108, 109, 110, 111, 112], 10, true);
    this.player.animations.add('walk3',
     [131, 132, 133, 134, 135, 136, 137, 138], 10, true);
    this.player.animations.add('walk2',
     [144, 145, 146, 147, 148, 149, 150, 151], 10, true);
    // Displaying Player as idle as initial.
    this.player.frame = 3;

    // Creating the enemy. Same procedure for as the player.
    this.enemy = game.add.sprite(window.innerWidth / 2,
        window.innerHeight * 3 / 4, 'enemy');
    game.physics.enable(this.enemy, Phaser.Physics.ARCADE);
    this.enemy.body.collideWorldBounds = true;
    this.enemy.animations.add('walk4',
     [118, 119, 120, 121, 122, 123, 124, 125], 10, true);
    this.enemy.animations.add('walk1',
     [105, 106, 107, 108, 109, 110, 111, 112], 10, true);
	this.enemy.animations.add('walk3',
     [131, 132, 133, 134, 135, 136, 137, 138], 10, true);
	this.enemy.animations.add('walk2',
     [144, 145, 146, 147, 148, 149, 150, 151], 10, true);
	this.enemy.animations.add('lay',
     [260, 261, 262, 263, 264], 10, true);
    this.enemy.frame = 118;
};

/**
 * 
 * 
 * @param {*} p - player
 * @param {*} e  - enemy
 * @return {boolean}
 */
function playerHitsEnemy(p, e) {
    if (((p.x + p.width / 6) < (e.x - e.width / 6)) ||
        ((p.x - p.width / 6) > (e.x + e.width / 6)) ||
        ((p.y + p.height / 6) < (e.y - e.height / 6)) ||
        ((p.y - p.height / 6) > (e.y + e.height / 6))) {
        return false;
    } else {
        return true;
    }
}

/**
 * 
 */
let newDirection = 0;
Play.update = function () {
    if (playerHitsEnemy(this.player, this.enemy)) {
        this.enemy.animations.play('lay', 10, true);
        this.player.animations.stop();
        this.player.frame = 3;
        return;
    }
    // =========================================================================
    // NOTE: Directions are numbered 1-8, where Direction 1 is "Up", Direction 
    // 2 is  "Up and to the Right", and continuing clockwise about the Player 
    // ending at direction 8, which is "Up and to the Left".
    // =========================================================================
    // =========================================================================
    // MORE NOTE: The upcoming code is for the behavior of the NPC only.  
    // Code for the Player is organized after the NPC code.
    // =========================================================================
    let enemySpeed = 1;

    let rand = 3;
    // This value is used to calculate the NPC's decision to change
    // directions. According to this, 1 out of 1000 chance. Direction
    // 0 (stationary) is a valid direction here.
    // NPC can stop if he decides to.
    rand = Math.round(Math.random() * 50) + 1;
    if (rand === 1) {
        rand = Math.round(Math.random() * 4); 
        newDirection = rand;
    }

    // This block handles what happens when the NPC hits walls,
    // whether one at a time or in corners.
    // When the PNC hits a wall, 
    // a new number is generated in the range of viable directions that 
    // the NPC could choose. If the random number needs to go over 8,
    // we subtract 8 to account for 
    // the 1-8 direction system.
    if (this.enemy.body.blocked.up === true) newDirection = 3;
    else if (this.enemy.body.blocked.down === true) newDirection = 1;
    else if (this.enemy.body.blocked.left === true) newDirection = 2;
    else if (this.enemy.body.blocked.right === true) newDirection = 4;

    this.enemy.direction = newDirection;
    // This block handles the movement of the NPC
    // as well as its animation once the
    // direction has been determined.

    this.game.physics.arcade.collide(this.player, this.blkLayer);

    switch (newDirection) {
        case 0: // Not moving
            this.enemy.animations.stop(null, true);
            this.enemy.frame = 134;
            break;
        case 1: // Straight Up
            this.enemy.animations.play('walk1', 30, true);
            this.enemy.y -= enemySpeed;
            break;
        case 2: // Straight Right
            this.enemy.animations.play('walk2', 30, true);
            this.enemy.x += enemySpeed;
            break;
        case 3: // Straight Down
            this.enemy.animations.play('walk3', 30, true);
            this.enemy.y += enemySpeed;
            break;
        case 4: // Straight Left
            this.enemy.animations.play('walk4', 30, true);
            this.enemy.x -= enemySpeed;
            break;
    }


    // =======================================================
    //* **
    // THIS IS NOW THE CONTROLS FOR THE PLAYER
    //* **
    // =======================================================

    // Variables to keep track of which buttons are being
    // pressed and the direction of the player.
    // This will help later for displaying the 
    // approriate sprites for each direction.
    let isUp = false;
    let isDown = false;
    let isRight = false;
    let isLeft = false;
    let direction;
    let playerSpeed = 2;

    // W Key is the Up Button
    if (this.keyboard.isDown(Phaser.Keyboard.W)) {
        this.player.body.y -= playerSpeed; // Move the player 4 "units"
    // The Game Camera automatically stops 
    // at the edge of the world so the player can get 
    // un-centered. When that happens, 
    // the player runs out of the middle of the screen. In
    // this case for the W Key, 
        if (this.player.body.y <= (this.game.camera.y +
             window.innerHeight / 2)) {
            this.game.camera.y -= playerSpeed; // Move the camera 4 "units"
        }
        isRight = false;
        isLeft = false;
        isUp = true;
        isDown = false;
    } else if (this.keyboard.isDown(Phaser.Keyboard.S)) {
        this.player.body.y += playerSpeed;
        if (this.player.body.y >= (this.game.camera.y +
             window.innerHeight / 2)) {
            this.game.camera.y += playerSpeed;
        }
        isRight = false;
        isLeft = false;
        isDown = true;
        isUp = false;
    } else if (this.keyboard.isDown(Phaser.Keyboard.A)) {
        this.player.body.x -= playerSpeed;
        if (this.player.body.x <= (this.game.camera.x +
             window.innerWidth / 2)) {
            this.game.camera.x -= playerSpeed;
        }
        isLeft = true;
        isRight = false;
        isUp = false;
        isDown = false;
    } else if (this.keyboard.isDown(Phaser.Keyboard.D)) {
        this.player.body.x += playerSpeed;
        if (this.player.body.x >= (this.game.camera.x +
             window.innerWidth / 2)) {
            this.game.camera.x += playerSpeed;
        }
        isRight = true;
        isLeft = false;
        isUp = false;
        isDown = false;
    } else {
        isRight = false;
        isLeft = false;
        isUp = false;
        isDown = false;
    }

    // Animations
    if (isUp) {
        this.player.animations.play('walk1', 20, true);
        direction = 1;
    } else if (isRight) {
        this.player.animations.play('walk2', 20, true);
        direction = 2;
    } else if (isDown) {
        this.player.animations.play('walk3', 20, true);
        direction = 3;
    } else if (isLeft) {
        this.player.animations.play('walk4', 20, true);
        direction = 4;
    } else {
        this.player.animations.stop();
        switch (direction) {
            case 1:
                this.player.frame = 108;
                break;
            case 2:
                this.player.frame = 147;
                break;
            case 3:
                this.player.frame = 134;
                break;
            case 4:
                this.player.frame = 121;
                break;
        }
    }

    // Decinding which character to render on top of the other.
    if ((this.player.y + this.player.height) > (this.enemy.y +
         this.enemy.height)) {
        this.game.world.bringToTop(this.player);
    } else {
        this.game.world.bringToTop(this.enemy);
    }
};


module.exports = Play;
