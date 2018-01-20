// This section contains some game constants. It is not super interesting
var GAME_WIDTH = 1000;
var GAME_HEIGHT = 667;

var ENEMY_WIDTH = 125;
var ENEMY_HEIGHT = 125;
var MAX_ENEMIES = 2;

var FRIEND_WIDTH = 125;
var FRIEND_HEIGHT = 125;
var MAX_FRIENDS = 1;



var PLAYER_WIDTH = 125;
var PLAYER_HEIGHT = 200;

// These two constants keep us from using "magic numbers" in our code
var LEFT_ARROW_CODE = 37;
var RIGHT_ARROW_CODE = 39;
var UP_ARROW_CODE = 38;
var DOWN_ARROW_CODE = 40;
var SPACE_BAR = 32;

// These two constants allow us to DRY
var MOVE_LEFT = 'left';
var MOVE_RIGHT = 'right';
var MOVE_UP = "up";
var MOVE_DOWN = 'down';

// Preload game images
var images = ['desert.png','cactus.png','sun.png','drop.png'];
    images.forEach(imgName => {
    var img = document.createElement('img');
    img.src = 'images/' + imgName;
    images[imgName] = img;
});



// This section is where you will be doing most of your coding
class Entity {
    render(ctx) {
        ctx.drawImage(this.sprite, this.x, this.y);
    }
}



class Enemy extends Entity {
    constructor(xPos) {
        super();
        this.x = xPos;
        this.y = -ENEMY_HEIGHT;
        this.sprite = images['drop.png']
            
        // Each enemy should have a different speed
        this.speed = Math.random() / 4 + 0.25;
        }

    update(timeDiff) {
        this.y = this.y + timeDiff * this.speed;
    } 
}

class Friend extends Entity {
    constructor(xPos) {
        super();
        this.x = xPos;
        this.y = -FRIEND_HEIGHT;
        this.sprite = images['sun.png']
            
        // Each friend should have a different speed
        this.speed = Math.random() / 4 + 0.45;
        }

    update(timeDiff) {
        this.y = this.y + timeDiff * this.speed;
    } 
}

class Player extends Entity {
    constructor() {
        super('player')
        this.x = 2 * PLAYER_WIDTH;
        this.y = GAME_HEIGHT - PLAYER_HEIGHT;
        this.sprite = images['cactus.png'];
    }

    // This method is called by the game engine when left/right arrows are pressed
    move(direction) {
        if (direction === MOVE_LEFT && this.x > 0) {
            this.x = this.x - PLAYER_WIDTH;
        }
        else if (direction === MOVE_RIGHT && this.x < GAME_WIDTH - PLAYER_WIDTH) {
            this.x = this.x + PLAYER_WIDTH;
        }
        else if (direction === MOVE_UP && this.y > 0) {
            this.y = this.y - PLAYER_HEIGHT;
        } 
        else if (direction === MOVE_DOWN && this.y < GAME_HEIGHT - PLAYER_HEIGHT) {
            this.y = this.y + PLAYER_HEIGHT;
         }  
    }
}





/*
This section is a tiny game engine.
This engine will use your Enemy and Player classes to create the behavior of the game.
The engine will try to draw your game at 60 frames per second using the requestAnimationFrame function
*/
class Engine {
    constructor(element) {
        // Setup the player
        this.player = new Player();

        // Setup enemies, making sure there are always three
        this.setupEnemies();

        // set up friends

       this.setupFriends();

        // Setup the <canvas> element where we will be drawing
        var canvas = document.createElement('canvas');
        canvas.width = GAME_WIDTH;
        canvas.height = GAME_HEIGHT;
        element.appendChild(canvas);

        this.ctx = canvas.getContext('2d');

        // Since gameLoop will be called out of context, bind it once here.
        this.gameLoop = this.gameLoop.bind(this);
    }

    /*
     The game allows for 5 horizontal slots where an enemy can be present.
     At any point in time there can be at most MAX_ENEMIES enemies otherwise the game would be impossible
     */
    setupEnemies() {
        if (!this.enemies) {
            this.enemies = [];
        }

        while (this.enemies.filter(e => !!e).length < MAX_ENEMIES) {
            this.addEnemy();
        }
    }

    // This method finds a random spot where there is no enemy, and puts one in there
    addEnemy() {
        var enemySpots = GAME_WIDTH / ENEMY_WIDTH;

        var enemySpot;
        // Keep looping until we find a free enemy spot at random
        while (enemySpot === undefined || this.enemies[enemySpot]) {
            enemySpot = Math.floor(Math.random() * enemySpots);
        }
        this.enemies[enemySpot] = new Enemy(enemySpot * ENEMY_WIDTH);
        console.log(this.enemies[enemySpot]);      
    }

    // FRIEND SECTION - same as enemy 

    setupFriends() {
        if (!this.friends) {
            this.friends = [];
        }

        while (this.friends.filter(e => !!e).length < MAX_FRIENDS) {
            this.addFriend();
        }
    }

    
    addFriend() {
        var friendSpots = GAME_WIDTH / FRIEND_WIDTH;

        var friendSpot;

        while (friendSpot === true || this.friends[friendSpot]) {
            friendSpot = Math.floor(Math.random() * friendSpots);
        }
        this.friends[friendSpot] = new Friend(friendSpot * FRIEND_WIDTH);   
    }

    // This method kicks off the game
    start() {
        this.score = 0;
        this.lastFrame = Date.now();

        // Listen for keyboard left/right and update the player
        document.addEventListener('keydown', e => {
            if (e.keyCode === LEFT_ARROW_CODE) {
                this.player.move(MOVE_LEFT);
            }
            else if (e.keyCode === RIGHT_ARROW_CODE) {
                this.player.move(MOVE_RIGHT);
            }
            else if (e.keyCode === UP_ARROW_CODE) {
                this.player.move(MOVE_UP);
            }
            else if (e.keyCode === DOWN_ARROW_CODE) {
                this.player.move(MOVE_DOWN);
            }else if (e.keyCode === SPACE_BAR) {
                requestAnimationFrame(this.gameLoop);
    
            }
        });

        this.gameLoop();
    }

    /*
    This is the core of the game engine. The `gameLoop` function gets called ~60 times per second
    During each execution of the function, we will update the positions of all game entities
    It's also at this point that we will check for any collisions between the game entities
    Collisions will often indicate either a player death or an enemy kill

    In order to allow the game objects to self-determine their behaviors, gameLoop will call the `update` method of each entity
    To account for the fact that we don't always have 60 frames per second, gameLoop will send a time delta argument to `update`
    You should use this parameter to scale your update appropriately
     */
    gameLoop() {
        // Check how long it's been since last frame
        var currentFrame = Date.now();
        var timeDiff = currentFrame - this.lastFrame;

        // Increase the score!
        this.score += timeDiff;

        // Call update on all enemies
        this.enemies.forEach(enemy => enemy.update(timeDiff));
        this.friends.forEach(friend => friend.update(timeDiff));

        // Draw everything!
        this.ctx.drawImage(images['desert.png'], 0, 0); // draw the star bg
        this.enemies.forEach(enemy => enemy.render(this.ctx)); // draw the enemies
        this.friends.forEach(friend => friend.render(this.ctx)); // draw the friends
        this.player.render(this.ctx); // draw the player

        // Check if any enemies should die
        this.enemies.forEach((enemy, enemyIdx) => {
            if (enemy.y > GAME_HEIGHT) {
                delete this.enemies[enemyIdx];
            }
        });
        this.setupEnemies();

        // repeat for friends

        this.friends.forEach((friend, friendIdx) => {
            if (friend.y > GAME_HEIGHT) {
                delete this.friends[friendIdx];
            }
        });
        this.setupFriends();

        // Check if player is dead
        if (this.isPlayerDead()) {
            // If they are dead, then it's game over!
            this.ctx.font = 'lighter 30px Helvetica';
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillText("SCORE: " + this.score,400, 175);
            this.ctx.font = 'bold 85px Helvetica';
            this.ctx.fillText("G A M E   O V E R", 140, 300);
            this.ctx.font = 'lighter 30px Helvetica';
            this.ctx.fillText("PRESS SPACE BAR", 375,400);
            this.score = 0;
        }

// If player finds a friend then add 5000 to the score
        else if (this.isFriendHit()){
            
            this.ctx.font = 'bold 75px Helvetica';
            this.ctx.fillStyle = '#FDFDD9';
            this.ctx.fillText("B O N U S", 345, 300);
            this.score = this.score + 2000;
            this.ctx.font = 'bold 40px Helvetica';
            this.ctx.fillText(this.score, 5, 30)

            // Set the time marker and redraw
            this.lastFrame = Date.now();
            requestAnimationFrame(this.gameLoop);

        }

 // If a player scores 20000 points they reach level 2

        else if (this.isNextLevel()){
            this.ctx.font = 'lighter 30px Helvetica';
            this.ctx.fillStyle = '#FFE1E1';
            this.ctx.fillText("SCORE: " + this.score,400, 175);
            this.ctx.font = 'bold 75px Helvetica';
            this.ctx.fillText("NEXT LEVEL", 305, 300);
            this.ctx.font = 'lighter 30px Helvetica';
            this.ctx.fillText("PRESS SPACE BAR", 375,400);
            this.score = 100001;
            
            
            
            // Set the time marker and redraw
            // this.lastFrame = Date.now();
            // requestAnimationFrame(this.gameLoop);

        }

        else {
            // If player is not dead, then draw the score
            this.ctx.font = '40px Helvetica';
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillText(this.score, 5, 30);

            // Set the time marker and redraw
            this.lastFrame = Date.now();
            requestAnimationFrame(this.gameLoop);
        }        
    }


    isPlayerDead() {
        var enemyHit = (enemy) => {
            if (enemy.x === this.player.x 
                && (enemy.y + ENEMY_HEIGHT) > (this.player.y)
                && (enemy.y + ENEMY_HEIGHT) < (this.player.y + PLAYER_HEIGHT))
                {
                console.log("HIT!");
                return true;
            }          
        };
        return this.enemies.some(enemyHit)
    }

    isFriendHit() {
        var friendHit = (friend) => {
            if (friend.x === this.player.x 
                && (friend.y + FRIEND_HEIGHT) > (this.player.y)
                && (friend.y + FRIEND_HEIGHT) < (this.player.y + PLAYER_HEIGHT))
                {
                console.log("BONUS!");
                return true;
            }          
        };
        return this.friends.some(friendHit)
    }

    isNextLevel(score) {
        if (this.score >= 50000 && this.score <=100000){
            return true

    }
    
    }
} 
 







// This section will start the game
var gameEngine = new Engine(document.getElementById('app'));
gameEngine.start();

// 1 - have multiple enemies - DONE
// 2- friends give points, not kill - DONE
// 3- center game
//4- background image on game and surrounding
//5- second level - faster more enemies at once- based on time without dying
// 6- background music

