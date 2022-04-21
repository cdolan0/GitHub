/*
 game.js for Perlenspiel 3.3.x
 Last revision: 2022-03-15 (BM)
 */

/* jshint browser : true, devel : true, esversion : 6, freeze : true */
/* globals PS : true */

"use strict"; // Do NOT remove this directive!

/*
 PS.init( system, options )
 Called once after engine is initialized but before event-polling begins.
 This function doesn't have to do anything, although initializing the grid dimensions with PS.gridSize() is recommended.
 If PS.grid() is not called, the default grid dimensions (8 x 8 beads) are applied.
 Any value returned is ignored.
 [system : Object] = A JavaScript object containing engine and host platform information properties; see API documentation for details.
 [options : Object] = A JavaScript object with optional data properties; see API documentation for details.
 */

const WIDTH = 15;
const HEIGHT = 15;
const OBSTACLES = [ PS.COLOR_BLACK ];
const ENEMY_TYPES = [ PS.COLOR_GREEN ];
const PORTAL_COLOR = PS.COLOR_VIOLET;
const DOOR_COLOR = PS.COLOR_GRAY_DARK;
const KEY_COLOR = PS.COLOR_YELLOW;

let Game;
let isOutOfBounds = false;
let level = 0;
let room = 0;
let startX;
let startY;
let pX = startX;
let pY = startY;//player x and y
let direction;
let firing = false;
let returnX, returnY;
let shieldStrength;
let gameover = false;
let start;
let enemies = [];
let portalOpened = false;
let usedDoor = false;
let unlocked = true;


const projectile = {
    projDir : "right",
    x : 0,
    y : 0,
    fired : false,
    destroyed : false
};

( function () {
    let target;
    let targetColor;
    let pastProjX;
    let pastProjY;
    let timer = null;
    let enemyMoveCounter = 12;
    let length = enemies.length;
    let gameoverCounter = 60
    let hitting = false;

    const tick = function () {
        length = enemies.length;
        if ( firing ) {
            //    PS.debug("firing");
            pastProjX = projectile.x;
            pastProjY = projectile.y;
            if ( ( projectile.projDir === "right" ) && ( projectile.x < WIDTH - 1 ) ) {
                projectile.x = projectile.x + 1;
            }
            else if ( ( projectile.projDir === "left" ) && ( projectile.x !== 0 ) ) {
                projectile.x = projectile.x - 1;
            }
            else if ( ( projectile.projDir === "up" ) && ( projectile.y !== 0 ) ) {
                projectile.y = projectile.y - 1;
            }
            else if ( ( projectile.projDir === "down" ) && ( projectile.y < HEIGHT - 1 ) ) {
                projectile.y = projectile.y + 1;
            }
            PS.glyph( pastProjX, pastProjY, "" );
            PS.glyphColor( pastProjX, pastProjY, PS.COLOR_BLACK );
            PS.glyph( projectile.x, projectile.y, "*" );
            PS.glyphColor( projectile.x, projectile.y, PS.COLOR_RED );

            target = PS.data( projectile.x, projectile.y );
            targetColor = PS.color( projectile.x, projectile.y );
            // PS.debug(targetColor);
            if ( OBSTACLES.includes( target ) || target == DOOR_COLOR) {
                projectile.destroyed = true;
                projectile.fired = false;
                firing = false;
            }
            /*else if(ENEMY_TYPES.includes(targetColor)){
             Game.hitEnemy(0, true);
             }*/
            if(projectile.destroyed){
                PS.glyph(projectile.x, projectile.y, "");
            }
        }
        if ( !isOutOfBounds && !gameover && !start && ( length > 0 ) ) {
            enemyMoveCounter -= 1;
            if ( ENEMY_TYPES.includes( targetColor ) && !hitting) {
                targetColor = null;
                hitting = true;
                Game.hitEnemy();
            }
            if ( enemyMoveCounter < 0 ) {
                Game.moveEnemies();
                enemyMoveCounter = 12;
            }
        }
        hitting = false;
        if ( unlocked && length == 0 && !portalOpened && !gameover && !start){
            Game.openPortal();
        }
        if (gameover){
            gameoverCounter -= 1;
            if ( gameoverCounter == 0 ){
                gameover = false;
                gameoverCounter = 60;
                Game.startScreen();
            }
        }
    };

    Game = {
        createBlock( w, h, x, y, color ) {
            for ( let i = x; i <= ( x + w ); i += 1 ) {
                for ( let j = y; j <= ( y + h ); j += 1 ) {
                    PS.color( i, j, color );
                    PS.data( i, j, color );
                }
            }
        },

        openPortal(){
            if ( level == 1 ){
                PS.fade( 7, 7, 15);
                Game.createBlock( 0, 0, 7, 7, PORTAL_COLOR );
            }
            if ( level == 2 && room == 0){
                PS.fade( 7, 7, 15);
                Game.createBlock( 0, 0, 7, 7, PORTAL_COLOR );
            }
            portalOpened = true;
        },

        hitEnemy() {
            let i = 0;
            let enemyNum = 0;
            projectile.destroyed = true;
            projectile.fired = false;
            firing = false;
            length = enemies.length;
            while (i < length)  {
                if ( ( enemies[ i ].x === projectile.x ) && ( enemies[ i ].y === projectile.y ) ) {
                    //PS.debug( "hit" );
                    enemyNum = i;
                    break;
                }
                i++
            }
            enemies[ enemyNum ].destroyed = true;
            PS.color( projectile.x, projectile.y, target );
            PS.glyph( projectile.x, projectile.y, "" );
            PS.glyphColor( projectile.x, projectile.y, PS.COLOR_BLACK );
            projectile.x = 0;
            projectile.y = 0;
        },

        GameOver() {
            level = 1;
            PS.color (pX, pY, PS.COLOR_GREEN);
            Game.deleteAllEnemies();
            gameover = true;
        },

        moveEnemies() {
            let path;
            let nextStep;
            let nextX;
            let nextY;
            let nextBead;
            // let index;
            // let hit = false;

            // *BM* This is where your bug was hiding
            // In JavaScript, any variables in the loop end condition (i < length) are checked only ONCE,
            // at the beginning of the loop.
            // If that variable's value is changed inside the loop, JavaScript won't notice!
            // The way around this is to use a while() loop instead.

            length = enemies.length;
            let i = 0;
            while ( i < length ) {
                if ( !gameover && !enemies[i].destroyed ) {
                    //PS.debug("moving enemy");
                    path = PS.line( enemies[ i ].x, enemies[ i ].y, pX, pY );
                    nextStep = path[ 0 ];
                    nextX = nextStep[ 0 ];
                    nextY = nextStep[ 1 ];
                    nextBead = PS.data( nextX, nextY );
                    var nextColor = PS.color( nextX, nextY );
                    if ( !ENEMY_TYPES.includes( nextColor ) && !OBSTACLES.includes( nextBead )
                        && (enemies[i].room == room)) {
                        PS.color( enemies[ i ].x, enemies[ i ].y, PS.data( enemies[ i ].x, enemies[ i ].y ) );
                        enemies[ i ].x = nextX;
                        enemies[ i ].y = nextY;
                        PS.color( enemies[ i ].x, enemies[ i ].y, enemies[ i ].type );
                        PS.bgColor( enemies[ i ].x, enemies[ i ].y, PS.data( enemies[ i ].x, enemies[ i ].y ) );
                    }
                    if (( enemies[ i ].x === projectile.x ) && ( enemies[ i ].y === projectile.y ) && !hitting){
                        Game.hitEnemy();
                    }
                    if ( ( enemies[ i ].x === pX ) && ( enemies[ i ].y === pY ) && enemies[i].room == room) {
                        Game.GameOver();
                        gameover = true;
                        break;
                    }
                    i += 1; // increment i here

                }
                else if ( enemies[ i ].destroyed ) {
                    PS.color( enemies[ i ].x, enemies[ i ].y, PS.data( enemies[ i ].x, enemies[ i ].y ) );
                    enemies.splice( i, 1 );
                    length -= 1; // *BM* NOTE: i is NOT incremented! It now points to next entry due to splice.
                    break;
                }
            }

            // for ( let i = 0; i < length; i += 1 ) {
            // 	if ( !gameover ) {
            // 		//PS.debug("moving enemy");
            // 		path = PS.line( enemies[ i ].x, enemies[ i ].y, pX, pY );
            // 		nextStep = path[ 0 ];
            // 		nextX = nextStep[ 0 ];
            // 		nextY = nextStep[ 1 ];
            // 		nextBead = PS.data( nextX, nextY );
            // 		if ( enemies[ i ].destroyed ) {
            // 			index = i;
            // 			hit = true;
            // 			break;
            // 		}
            // 		else if ( !OBSTACLES.includes( nextBead ) && !ENEMY_TYPES.includes( nextBead ) ) {
            // 			PS.color( enemies[ i ].x, enemies[ i ].y, PS.data( enemies[ i ].x, enemies[ i ].y ) );
            // 			enemies[ i ].x = nextX;
            // 			enemies[ i ].y = nextY;
            // 			PS.color( enemies[ i ].x, enemies[ i ].y, enemies[ i ].type );
            // 			PS.bgColor( enemies[ i ].x, enemies[ i ].y, PS.data( enemies[ i ].x, enemies[ i ].y ) );
            // 		}
            // 		if ( enemies[ i ].x === pX && enemies[ i ].y === pY ) {
            // 			Game.GameOver();
            // 		}
            // 	}
            // }

            // if ( hit ) {
            // 	PS.color( enemies[ index ].x, enemies[ index ].y, PS.data( enemies[ index ].x, enemies[ index ].y ) );
            // 	enemies.splice( index, 1 );
            // }
        },

        reDrawEnemies() {
            length = enemies.length;
            for ( let i = 0; i < length; i += 1 ) {
                if(enemies[i].room == room && !enemies[i].destroyed) {
                    PS.color(enemies[i].x, enemies[i].y, enemies[i].type);
                }
            }
        },

        makeEnemy( x, y, type, Room) {
            if ( ENEMY_TYPES.includes( type ) ) {
                let enemy = {
                    x : x,
                    y : y,
                    type : type,
                    destroyed : false,
                    room: Room
                };
                enemies.push( enemy );
                if(room == enemy.room ) {
                    PS.color(x, y, enemy.type);
                }
            }
        },

        deleteAllEnemies() {
            length = enemies.length;
            for ( let i = 0; i < length; i += 1 ) {
                enemies.pop();
            }
        },

        startScreen() {
            if(gameover){
                this.deleteAllEnemies();
                level = 1;
            }
            this.makeLevel();
            PS.fade( PS.ALL, PS.ALL, 15 );
            PS.color( PS.ALL, PS.ALL, PS.COLOR_BLACK );
            PS.color( startX, startY, PS.COLOR_YELLOW );
            start = true;
        },

        changeRooms(x, y){
            if(level == 2){
                if(room == 0){
                    room = 1;
                }
                else if(room == 1){
                    room = 0
                }
            }
            usedDoor = true;
            Game.startScreen();
        },

        makeLevel() {
            if ( !timer ) {
                timer = PS.timerStart( 1, tick );
            }
            if( level == 1){
                unlocked = true;
                room = 0;
                PS.gridSize( WIDTH, HEIGHT );
                PS.bgAlpha( PS.ALL, PS.ALL, 255 );
                PS.border( PS.ALL, PS.ALL, 0 );
                startX = 7;
                startY = 12;
                this.createBlock( WIDTH - 1, HEIGHT - 1, 0, 0, PS.COLOR_GRAY_LIGHT );
                //Enemies
                this.makeEnemy( 7, 3, PS.COLOR_GREEN, 0 );

                //Inner Walls
                this.createBlock( 6, 0, 4, 7, PS.COLOR_BLACK );

                //Outer Walls
                this.createBlock( 14, 0, 0, 0, PS.COLOR_BLACK );
                this.createBlock( 14, 0, 0, 14, PS.COLOR_BLACK );
                this.createBlock( 0, 14, 0, 0, PS.COLOR_BLACK );
                this.createBlock( 0, 14, 14, 0, PS.COLOR_BLACK );
            }
            if( level == 2){
                unlocked = true;
                room = 0;
                PS.gridSize( WIDTH, HEIGHT );
                PS.bgAlpha( PS.ALL, PS.ALL, 255 );
                PS.border( PS.ALL, PS.ALL, 0 );
                startX = 7;
                startY = 7;
                this.createBlock( WIDTH - 1, HEIGHT - 1, 0, 0, PS.COLOR_GRAY_LIGHT );
                //Enemies
                this.makeEnemy( 3, 3, PS.COLOR_GREEN, 0 );
                this.makeEnemy( 3, 11, PS.COLOR_GREEN, 0 );
                this.makeEnemy( 12, 6, PS.COLOR_GREEN, 0 );

                //Inner Walls
                this.createBlock( 0, 1, 4, 7, PS.COLOR_BLACK );
                this.createBlock( 0, 0, 5, 9, PS.COLOR_BLACK );
                this.createBlock( 0, 0, 8, 10, PS.COLOR_BLACK );
                this.createBlock( 0, 1, 10, 6, PS.COLOR_BLACK );
                this.createBlock( 1, 0, 7, 4, PS.COLOR_BLACK );

                //Outer Walls
                this.createBlock( 14, 0, 0, 0, PS.COLOR_BLACK );
                this.createBlock( 14, 0, 0, 14, PS.COLOR_BLACK );
                this.createBlock( 0, 14, 0, 0, PS.COLOR_BLACK );
                this.createBlock( 0, 14, 14, 0, PS.COLOR_BLACK );
            }
            if( level == 3){
                PS.gridSize( WIDTH, HEIGHT );
                PS.bgAlpha( PS.ALL, PS.ALL, 255 );
                PS.border( PS.ALL, PS.ALL, 0 );
                this.createBlock( WIDTH - 1, HEIGHT - 1, 0, 0, PS.COLOR_GRAY_LIGHT );
                if(enemies.length == 0 && !portalOpened){
                    //Enemies
                    PS.debug("Making Enemies");
                    this.makeEnemy( 10, 2, PS.COLOR_GREEN, 0 );
                    this.makeEnemy( 12, 4, PS.COLOR_GREEN, 0 );
                    this.makeEnemy( 6, 3, PS.COLOR_GREEN, 1 );
                    this.makeEnemy( 12, 8, PS.COLOR_GREEN, 1 );
                    this.makeEnemy( 10, 12, PS.COLOR_GREEN, 1 );
                }
                if(room == 0){
                    if(usedDoor){
                        startX = 14;
                        startY = 7;
                    }
                    else {
                        startX = 2;
                        startY = 12;
                    }

                    //Inner Walls
                    this.createBlock( 0, 2, 5, 11, PS.COLOR_BLACK );
                    this.createBlock( 1, 0, 1, 8, PS.COLOR_BLACK );
                    this.createBlock( 0, 1, 7, 3, PS.COLOR_BLACK );
                    this.createBlock( 0, 0, 8, 5, PS.COLOR_BLACK );
                    this.createBlock( 0, 0, 9, 6, PS.COLOR_BLACK );
                    this.createBlock( 1, 0, 10, 7, PS.COLOR_BLACK );

                    //Outer Walls
                    this.createBlock( 14, 0, 0, 0, PS.COLOR_BLACK );
                    this.createBlock( 14, 0, 0, 14, PS.COLOR_BLACK );
                    this.createBlock( 0, 14, 0, 0, PS.COLOR_BLACK );
                    this.createBlock( 0, 14, 14, 0, PS.COLOR_BLACK );

                    //Door
                    this.createBlock(0, 0, 14, 7, DOOR_COLOR);
                }
                else if(room == 1){
                    startX = 0;
                    startY = 7;

                    //Inner Walls
                    this.createBlock( 0, 0, 1, 6, PS.COLOR_BLACK );
                    this.createBlock( 1, 0, 3, 6, PS.COLOR_BLACK );
                    this.createBlock( 7, 0,  7, 6, PS.COLOR_BLACK );
                    this.createBlock( 0, 5, 4, 1, PS.COLOR_BLACK );
                    this.createBlock( 0, 5, 10, 1, PS.COLOR_BLACK );
                    this.createBlock( 0, 0, 10, 3, PS.COLOR_GRAY_LIGHT );

                    this.createBlock( 2, 0, 1, 9, PS.COLOR_BLACK );
                    this.createBlock( 2, 0, 5, 9, PS.COLOR_BLACK );
                    this.createBlock( 0, 6, 8, 8, PS.COLOR_BLACK );

                    //Key
                    // this.createBlock( 0, 0, 13, 1, KEY_COLOR);

                    //Outer Walls
                    this.createBlock( 14, 0, 0, 0, PS.COLOR_BLACK );
                    this.createBlock( 14, 0, 0, 14, PS.COLOR_BLACK );
                    this.createBlock( 0, 14, 0, 0, PS.COLOR_BLACK );
                    this.createBlock( 0, 14, 14, 0, PS.COLOR_BLACK );

                    //Door
                    this.createBlock(0, 0, 0, 7, DOOR_COLOR);

                }
            }
        }
    };
}() );

PS.init = function ( system, options ) {
    PS.statusText("The Dark Side of The Mouse");
    level = 1;
    Game.startScreen();
};

/*
 PS.touch ( x, y, data, options )
 Called when the left mouse button is clicked over bead(x, y), or when bead(x, y) is touched.
 This function doesn't have to do anything. Any value returned is ignored.
 [x : Number] = zero-based x-position (column) of the bead on the grid.
 [y : Number] = zero-based y-position (row) of the bead on the grid.
 [data : *] = The JavaScript value previously associated with bead(x, y) using PS.data(); default = 0.
 [options : Object] = A JavaScript object with optional data properties; see API documentation for details.
 */

PS.touch = function ( x, y, data, options ) {
    if ( !firing && !isOutOfBounds && !gameover ) {
        projectile.x = x;
        projectile.y = y;
        projectile.projDir = direction;
        projectile.destroyed = false;
        firing = true;
    }
};

/*
 PS.release ( x, y, data, options )
 Called when the left mouse button is released, or when a touch is lifted, over bead(x, y).
 This function doesn't have to do anything. Any value returned is ignored.
 [x : Number] = zero-based x-position (column) of the bead on the grid.
 [y : Number] = zero-based y-position (row) of the bead on the grid.
 [data : *] = The JavaScript value previously associated with bead(x, y) using PS.data(); default = 0.
 [options : Object] = A JavaScript object with optional data properties; see API documentation for details.
 */

PS.release = function ( x, y, data, options ) {
    // Uncomment the following code line to inspect x/y parameters:

    // PS.debug( "PS.release() @ " + x + ", " + y + "\n" );

    // Add code here for when the mouse button/touch is released over a bead.
};

/*
 PS.enter ( x, y, button, data, options )
 Called when the mouse cursor/touch enters bead(x, y).
 This function doesn't have to do anything. Any value returned is ignored.
 [x : Number] = zero-based x-position (column) of the bead on the grid.
 [y : Number] = zero-based y-position (row) of the bead on the grid.
 [data : *] = The JavaScript value previously associated with bead(x, y) using PS.data(); default = 0.
 [options : Object] = A JavaScript object with optional data properties; see API documentation for details.
 */

PS.enter = function ( x, y, data, options ) {
    let nextBead = data; // *BM* This info is passed in the data parameter! No need for PS.data( x, y );
    let pastX = pX;
    let pastY = pY;
    pX = x;
    pY = y;
    if ( !isOutOfBounds && !gameover && !start &&
        !OBSTACLES.includes( nextBead ) && !ENEMY_TYPES.includes( nextBead ) ) {
        PS.color( pX, pY, PS.COLOR_BLUE );
        PS.bgColor( pX, pY, PS.data( pX, pY ) );
        PS.radius( pX, pY, 50 );
        PS.color( pastX, pastY, PS.data( pastX, pastY ) );
        PS.radius( pastX, pastY, 0 );
        if ( pastX - pX < 0 ) {
            direction = "right";
            PS.glyph( pX, pY, ">" );
        }
        else if ( pastX - pX > 0 ) {
            direction = "left";
            PS.glyph( pX, pY, "<" );
        }
        else if ( pastY - pY < 0 ) {
            direction = "down";
            PS.glyph( pX, pY, "v" );
        }
        else if ( pastY - pY > 0 ) {
            direction = "up";
            PS.glyph( pX, pY, "^" );
        }
        PS.glyph( pastX, pastY, "" );
        if( nextBead == PORTAL_COLOR ){
            portalOpened = false;
            usedDoor = false;
            //unlocked = false;
            level += 1;
            Game.startScreen();
        }
        if( nextBead == DOOR_COLOR){
            Game.changeRooms(pX, pY);
        }
        /* if( nextBead == KEY_COLOR){
             unlocked = true;
         }*/
    }
    else if ( !isOutOfBounds && !gameover && !start && OBSTACLES.includes( nextBead ) ) {
        isOutOfBounds = true;
        PS.fade( PS.ALL, PS.ALL, 5 );
        PS.color( PS.ALL, PS.ALL, PS.COLOR_BLACK );
        PS.color( pastX, pastY, PS.COLOR_GREEN );
        PS.bgColor( pastX, pastY, PS.COLOR_BLACK );
        returnX = pastX;
        returnY = pastY;
    }
    else if ( isOutOfBounds && !gameover && !start && ( returnX === pX ) && ( returnY === pY ) ) {
        PS.fade( PS.ALL, PS.ALL, 0 );
        isOutOfBounds = false;
        for ( let i = 0; i < WIDTH; i += 1 ) {
            for ( let j = 0; j < HEIGHT; j += 1 ) {
                PS.color( i, j, PS.data( i, j ) );
            }
        }
        PS.color( returnX, returnY, PS.COLOR_BLUE );
        PS.bgColor( returnX, returnY, PS.data( returnX, returnY ) );
        Game.reDrawEnemies();
    }
    else if ( start && ( pX === startX ) && ( pY === startY ) ) {
        PS.fade( PS.ALL, PS.ALL, 0 );
        gameover = false;
        start = false;
        for ( let i = 0; i < WIDTH; i += 1 ) {
            for ( let j = 0; j < HEIGHT; j += 1 ) {
                PS.color( i, j, PS.data( i, j ) );
            }
        }
        PS.color( pX, pY, PS.COLOR_BLUE );
        PS.bgColor( pX, pY, PS.data( pX, pY ) );
        PS.radius( pX, pY, 50 );
    }
};

/*
 PS.exit ( x, y, data, options )
 Called when the mouse cursor/touch exits bead(x, y).
 This function doesn't have to do anything. Any value returned is ignored.
 [x : Number] = zero-based x-position (column) of the bead on the grid.
 [y : Number] = zero-based y-position (row) of the bead on the grid.
 [data : *] = The JavaScript value previously associated with bead(x, y) using PS.data(); default = 0.
 [options : Object] = A JavaScript object with optional data properties; see API documentation for details.
 */

PS.exit = function ( x, y, data, options ) {
    // Uncomment the following code line to inspect x/y parameters:

    // PS.debug( "PS.exit() @ " + x + ", " + y + "\n" );

    // Add code here for when the mouse cursor/touch exits a bead.
};

/*
 PS.exitGrid ( options )
 Called when the mouse cursor/touch exits the grid perimeter.
 This function doesn't have to do anything. Any value returned is ignored.
 [options : Object] = A JavaScript object with optional data properties; see API documentation for details.
 */

PS.exitGrid = function ( options ) {
    // Uncomment the following code line to verify operation:

    // PS.debug( "PS.exitGrid() called\n" );

    // Add code here for when the mouse cursor/touch moves off the grid.
};

/*
 PS.keyDown ( key, shift, ctrl, options )
 Called when a key on the keyboard is pressed.
 This function doesn't have to do anything. Any value returned is ignored.
 [key : Number] = ASCII code of the released key, or one of the PS.KEY_* constants documented in the API.
 [shift : Boolean] = true if shift key is held down, else false.
 [ctrl : Boolean] = true if control key is held down, else false.
 [options : Object] = A JavaScript object with optional data properties; see API documentation for details.
 */

PS.keyDown = function ( key, shift, ctrl, options ) {
    // Uncomment the following code line to inspect first three parameters:

    // PS.debug( "PS.keyDown(): key=" + key + ", shift=" + shift + ", ctrl=" + ctrl + "\n" );

    // Add code here for when a key is pressed.
};

/*
 PS.keyUp ( key, shift, ctrl, options )
 Called when a key on the keyboard is released.
 This function doesn't have to do anything. Any value returned is ignored.
 [key : Number] = ASCII code of the released key, or one of the PS.KEY_* constants documented in the API.
 [shift : Boolean] = true if shift key is held down, else false.
 [ctrl : Boolean] = true if control key is held down, else false.
 [options : Object] = A JavaScript object with optional data properties; see API documentation for details.
 */

PS.keyUp = function ( key, shift, ctrl, options ) {
    // Uncomment the following code line to inspect first three parameters:

    // PS.debug( "PS.keyUp(): key=" + key + ", shift=" + shift + ", ctrl=" + ctrl + "\n" );

    // Add code here for when a key is released.
};

/*
 PS.input ( sensors, options )
 Called when a supported input device event (other than those above) is detected.
 This function doesn't have to do anything. Any value returned is ignored.
 [sensors : Object] = A JavaScript object with properties indicating sensor status; see API documentation for details.
 [options : Object] = A JavaScript object with optional data properties; see API documentation for details.
 NOTE: Currently, only mouse wheel events are reported, and only when the mouse cursor is positioned directly over the grid.
 */

PS.input = function ( sensors, options ) {
    // Uncomment the following code lines to inspect first parameter:

//	 var device = sensors.wheel; // check for scroll wheel
//
//	 if ( device ) {
//	   PS.debug( "PS.input(): " + device + "\n" );
//	 }

    // Add code here for when an input event is detected.
};

