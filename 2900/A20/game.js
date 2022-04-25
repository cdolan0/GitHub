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
const SHIELD_COLOR = PS.COLOR_RED;
const PLAYER_SHIELD_COLOR = PS.COLOR_ORANGE
const OBSTACLES = [ PS.COLOR_BLACK ];
const ENEMY_TYPES = [ 0x80E81D, 0x2FC819, 0x7DE339 ];
const POWERUPS = [ SHIELD_COLOR ];
const PORTAL_COLOR = 0xff148d;
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
let eastereggs = [];
let portalOpened = false;
let usedDoor = false;
let unlocked = true;

let rgb;
let xMarker;
let yMarker;

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
            PS.glyph(pastProjX, pastProjY, "");
            PS.glyphColor(pastProjX, pastProjY, PS.COLOR_BLACK);
            if( POWERUPS.includes( PS.borderColor(projectile.x, projectile.y) )){
                Game.triggerEgg( projectile.x, projectile.y);
            }
            else {
                PS.glyph(projectile.x, projectile.y, "⬤");
                PS.glyphColor(projectile.x, projectile.y, PS.COLOR_RED);
            }
            Game.shootAudio();

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
                PS.fade( 7, 11, 15);
                Game.createBlock( 0, 0, 7, 11, PORTAL_COLOR );
            }
            if ( level == 2 ){
                PS.fade( 7, 7, 15);
                Game.createBlock( 0, 0, 7, 7, PORTAL_COLOR );
            }
            if ( level == 3 && room == 1){
                PS.fade( 2, 3, 15);
                Game.createBlock( 0, 0, 2, 3, PORTAL_COLOR );
            }
            if ( level == 4 && room == 1) {
                PS.fade (7, 7, 15);
                Game.createBlock( 0, 0, 7, 7, PORTAL_COLOR );
            }
            portalOpened = true;
            PS.audioPlay( "fx_pop" );
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
                        if(shieldStrength > 0){
                            enemies[i].destroyed = true;
                            enemies.splice( i, 1 );
                            shieldStrength -= 1;
                            PS.border(pX, pY, shieldStrength);
                            PS.color( pX, pY, 0x238fe6 );
                            break;
                        }

                        else{
                            Game.GameOver();
                            gameover = true;
                            break;
                        }
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
                if( room == enemy.room ) {
                    PS.color(x, y, enemy.type);
                }
            }
        },

        makeEasterEgg( x, y, type, Room ){
            if (POWERUPS.includes( type ) ) {
                let easter_egg = {
                    x : x,
                    y : y,
                    type : type,
                    triggered: false,
                    used : false,
                    room: Room
                };
                eastereggs.push( easter_egg );
                if( room == easter_egg.room ) {
                    PS.color(x, y, easter_egg.type);
                }
            }
        },

        triggerEgg(x, y){
            let length = eastereggs.length;
            let i = 0;
            //PS.debug("Egg Triggered ");
            while(i < length){
                if( eastereggs[i].room == room && eastereggs[i].x == x && eastereggs[i].y == y ){
                    //PS.debug("Found Egg ");
                    if( eastereggs[i].type == SHIELD_COLOR && !eastereggs[i].triggered ){
                        //PS.debug("Filled Egg ");
                        PS.fade(eastereggs[i].x, eastereggs[i].y, 15);
                        PS.color(eastereggs[i].x, eastereggs[i].y, SHIELD_COLOR);
                        PS.radius(eastereggs[i].x, eastereggs[i].y, 50);
                        eastereggs[i].triggered = true;
                        PS.border(eastereggs[i].x, eastereggs[i].y, 0);
                        PS.borderColor(eastereggs[i].x, eastereggs[i].y, PS.COLOR_BLACK);
                    }
                    else if( eastereggs[i].type == SHIELD_COLOR && eastereggs[i].triggered && !eastereggs[i].used){
                        //PS.debug("Used Egg ");
                        PS.fade(eastereggs[i].x, eastereggs[i].y, 0);
                        shieldStrength = 3;
                        PS.border( pX, pY, shieldStrength);
                        PS.borderColor( pX, pY, PLAYER_SHIELD_COLOR);
                        eastereggs[i].used = true;
                    }
                }
                i += 1;
            }
        },

        drawEggs(){
            let length = eastereggs.length;
            let i = 0;
            while(i < length){
                if(!eastereggs[i].used && eastereggs[i].room == room) {
                    if (eastereggs[i].type == SHIELD_COLOR) {
                        PS.radius(eastereggs[i].x, eastereggs[i].y, 50);
                        PS.border(eastereggs[i].x, eastereggs[i].y, 2);
                        PS.borderColor(eastereggs[i].x, eastereggs[i].y, SHIELD_COLOR);
                        PS.bgColor(eastereggs[i].x, eastereggs[i].y, PS.data(eastereggs[i].x, eastereggs[i].y,));
                        if(eastereggs[i].triggered){
                            PS.color(eastereggs[i].x, eastereggs[i].y, eastereggs[i].type);
                            PS.border(eastereggs[i].x, eastereggs[i].y, 0);
                            PS.borderColor(eastereggs[i].x, eastereggs[i].y, PS.COLOR_BLACK);
                        }
                    }
                    else{
                        PS.color(eastereggs[i].x, eastereggs[i].y, eastereggs[i].type);
                    }
                }
                i += 1;
            }
        },

        deleteAllEnemies() {
            length = enemies.length;
            for ( let i = 0; i < length; i += 1 ) {
                enemies.pop();
            }
        },

        deleteAllEggs() {
            length = eastereggs.length;
            for ( let i = 0; i < length; i += 1 ) {
                eastereggs.pop();
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

        makeFloor(rVal, gVal, bVal, randomValue ) {
            for ( yMarker = 0; yMarker < HEIGHT; yMarker++ ) {
                for ( xMarker = 0; xMarker < WIDTH; xMarker ++ ) {
                    var rValRandom = rVal - PS.random(randomValue);
                    var gValRandom = gVal - PS.random(randomValue);
                    var bValRandom = bVal - PS.random(randomValue);
                    rgb = PS.makeRGB(rValRandom, gValRandom, bValRandom);
                    this.createBlock( 0, 0, xMarker, yMarker, rgb );
                }
            }
        },

        changeRooms(x, y){
            if(level == 3){
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

        shootAudio() {
            var randomShoot = PS.random(6);
            if ( randomShoot == 1 ) {
                PS.audioPlay( "fx_shoot1" );
            }
            if ( randomShoot == 2 ) {
                PS.audioPlay( "fx_shoot2" );
            }
            if ( randomShoot == 3 ) {
                PS.audioPlay( "fx_shoot3" );
            }
            if ( randomShoot == 4 ) {
                PS.audioPlay( "fx_shoot4" );
            }
            if ( randomShoot == 5 ) {
                PS.audioPlay( "fx_shoot5" );
            }
            if ( randomShoot == 6 ) {
                PS.audioPlay( "fx_shoot6" );
            }
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
                startY = 11;
                this.makeFloor( 180, 198, 205, 20 );
                //Enemies
                this.makeEnemy( 7, 3, 0x2fc819, 0 );

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
                this.makeFloor( 180, 198, 205, 20 );
                //Enemies
                this.makeEnemy( 3, 3, 0x80e81d, 0 );
                this.makeEnemy( 3, 11, 0x2fc819, 0 );
                this.makeEnemy( 12, 6, 0x7de339, 0 );

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
                this.makeFloor( 180, 198, 205, 20 );
                if(enemies.length == 0 && !portalOpened){
                    this.makeEnemy( 11, 2, 0x2fc819, 0 );
                    this.makeEnemy( 12, 11, 0x80e81d, 0 );
                    this.makeEnemy( 8, 3, 0x2fc819, 1 );
                    this.makeEnemy( 12, 8, 0x80e81d, 1 );
                    this.makeEnemy( 10, 12, 0x7de339, 1 );
                }
                if(eastereggs.length == 0){
                    this.makeEasterEgg(13, 1, SHIELD_COLOR, 1);
                }
                if(room == 0){
                    if(usedDoor){
                        startX = 14;
                        startY = 10;
                    }
                    else {
                        startX = 2;
                        startY = 12;
                    }

                    //Inner Walls
                    this.createBlock( 0, 2, 6, 1, PS.COLOR_BLACK );
                    this.createBlock( 0, 8, 6, 6, PS.COLOR_BLACK );
                    this.createBlock( 1, 0, 7, 8, PS.COLOR_BLACK );
                    this.createBlock( 2, 0, 11, 8, PS.COLOR_BLACK );

                    //Outer Walls
                    this.createBlock( 14, 0, 0, 0, PS.COLOR_BLACK );
                    this.createBlock( 14, 0, 0, 14, PS.COLOR_BLACK );
                    this.createBlock( 0, 14, 0, 0, PS.COLOR_BLACK );
                    this.createBlock( 0, 14, 14, 0, PS.COLOR_BLACK );

                    //Door
                    this.createBlock(0, 0, 14, 10, DOOR_COLOR);
                }
                else if(room == 1){
                    startX = 0;
                    startY = 10;

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

                    //Outer Walls
                    this.createBlock( 14, 0, 0, 0, PS.COLOR_BLACK );
                    this.createBlock( 14, 0, 0, 14, PS.COLOR_BLACK );
                    this.createBlock( 0, 14, 0, 0, PS.COLOR_BLACK );
                    this.createBlock( 0, 14, 14, 0, PS.COLOR_BLACK );

                    //Door
                    this.createBlock(0, 0, 0, 10, DOOR_COLOR);
                }
            }
            /*
            if( level == 4 ) {
                PS.gridSize( WIDTH, HEIGHT );
                PS.bgAlpha( PS.ALL, PS.ALL, 255 );
                PS.border( PS.ALL, PS.ALL, 0 );
                this.makeFloor( 180, 198, 205, 20 );
                if(enemies.length == 0 && !portalOpened) {
                    this.makeEnemy();
                }
                if(room == 0) {
                    if (usedDoor) {
                        startX = 14;
                        startY = 7;
                    } else {
                        startX = 3;
                        startY = 7;
                    }
                }
                    //Inner Walls

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

                    //Outer Walls
                    this.createBlock( 14, 0, 0, 0, PS.COLOR_BLACK );
                    this.createBlock( 14, 0, 0, 14, PS.COLOR_BLACK );
                    this.createBlock( 0, 14, 0, 0, PS.COLOR_BLACK );
                    this.createBlock( 0, 14, 14, 0, PS.COLOR_BLACK );

                    //Door
                    this.createBlock(0, 0, 0, 10, DOOR_COLOR);
            }
            */
        }
    };
}() );

PS.init = function ( system, options ) {
    PS.statusText("The Dark Side of The Mouse");
    level = 1;
    shieldStrength = 0;
    Game.startScreen();

    PS.audioLoad( "fx_pop" );
    PS.audioLoad ( "fx_shoot1" );
    PS.audioLoad ( "fx_shoot2" );
    PS.audioLoad ( "fx_shoot3" );
    PS.audioLoad ( "fx_shoot4" );
    PS.audioLoad ( "fx_shoot5" );
    PS.audioLoad ( "fx_shoot6" );
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
    if ( !firing && !isOutOfBounds && !gameover && !start) {
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
    let nextBeadColor = PS.color( x, y );
    let pastX = pX;
    let pastY = pY;
    pX = x;
    pY = y;
    if ( !isOutOfBounds && !gameover && !start &&
        !OBSTACLES.includes( nextBead ) && !ENEMY_TYPES.includes( nextBead ) ) {
        PS.color( pX, pY, 0x238fe6 );
        PS.border(pX, pY, shieldStrength);
        PS.borderColor(pX, pY, PLAYER_SHIELD_COLOR);
        PS.bgColor( pX, pY, PS.data( pX, pY ) );
        PS.radius( pX, pY, 50 );

        PS.color( pastX, pastY, PS.data( pastX, pastY ) );
        PS.radius( pastX, pastY, 0 );
        PS.border( pastX, pastY, 0 );

        if ( pastX - pX < 0 ) {
            direction = "right";
            PS.glyph( pX, pY, ">" );
            PS.glyphColor( pX, pY, PS.COLOR_WHITE );
        }
        else if ( pastX - pX > 0 ) {
            direction = "left";
            PS.glyph( pX, pY, "<" );
            PS.glyphColor( pX, pY, PS.COLOR_WHITE );
        }
        else if ( pastY - pY < 0 ) {
            direction = "down";
            PS.glyph( pX, pY, "v" );
            PS.glyphColor( pX, pY, PS.COLOR_WHITE );
        }
        else if ( pastY - pY > 0 ) {
            direction = "up";
            PS.glyph( pX, pY, "^" );
            PS.glyphColor( pX, pY, PS.COLOR_WHITE );
        }
        PS.glyph( pastX, pastY, "" );
        if( POWERUPS.includes(nextBeadColor) ){
            Game.triggerEgg(pX, pY);
        }
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
        PS.radius( PS.ALL, PS.ALL, 0);
        PS.borderColor( PS.ALL, PS.ALL, PS.COLOR_BLACK);
        PS.color( pastX, pastY, PS.COLOR_GREEN );
        PS.bgColor( pastX, pastY, PS.COLOR_BLACK );
        PS.radius( pastX, pastY, 50);
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
        PS.color( returnX, returnY, 0x238fe6 );
        PS.bgColor( returnX, returnY, PS.data( returnX, returnY ) );
        Game.reDrawEnemies();
        Game.drawEggs();
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
        PS.color( pX, pY, 0x238fe6 );
        PS.bgColor( pX, pY, PS.data( pX, pY ) );
        PS.radius( pX, pY, 50 );
        Game.reDrawEnemies();
        Game.drawEggs();
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

