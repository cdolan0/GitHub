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

// TODO:
// Trigun powerup
// Improve Navigation
// MEGA-SHIELDED

const WIDTH = 15;
const HEIGHT = 15;
const HIDDEN_DOOR_COLOR = 0x313639;
const SHIELD_COLOR = PS.COLOR_RED;
const INVIS_COLOR = PS.COLOR_GRAY;
const TRIGUN_COLOR = PS.COLOR_VIOLET;
const PLAYER_SHIELD_COLOR = PS.COLOR_ORANGE
const OBSTACLES = [ PS.COLOR_BLACK ];
const SHIELDED_ENEMY = 0x2FC819;
const DEFAULT_ENEMY = 0x80E81D;
const ENEMY_TYPES = [ DEFAULT_ENEMY, SHIELDED_ENEMY, 0x7DE339 ];
const POWERUPS = [ SHIELD_COLOR, INVIS_COLOR, TRIGUN_COLOR ];
const PORTAL_COLOR = 0xff148d;
const DOOR_COLOR = PS.COLOR_GRAY_DARK;
const E_SHIELD_COLOR = 0x04d9ff;

let Game;
let isOutOfBounds = false;
let level = 0;
let room = 0;
let startX;
let startY;
let pX = startX;
let pY = startY;//player x and y
let direction = "up";
let firing = false;
let returnX, returnY;
let shieldStrength;
let gameover = false;
let start;
let enemies = [];
let eastereggs = [];
let portalOpened = false;
let usedDoor = false;
let invis = false;
let trigun = false;
let firstStart = true;

let rgb;
let xMarker;
let yMarker;

let projectile = {
    projDir : "right",
    x : 0,
    y : 0,
    fired : false,
    destroyed : false
};
let projectile2 = {
    projDir : "right",
    x : 0,
    y : 0,
    fired : false,
    destroyed : false
};
let projectile3 = {
    projDir : "right",
    x : 0,
    y : 0,
    fired : false,
    destroyed : false
};

( function () {
    let target;
    let target2;
    let target3;

    let targetColor;
    let targetColor2;
    let targetColor3;

    let pastProjX;
    let pastProjY;

    let pastProjX2;
    let pastProjY2;

    let pastProjX3;
    let pastProjY3;

    let timer = null;
    let enemyMoveCounter = 12;
    let length = enemies.length;
    let gameoverCounter = 360;
    let hitting = false;
    let invisCount = 500;

    const tick = function () {
        length = enemies.length;
        if ( firing ) {
           Game.moveProjectiles();
        }
        if ( !isOutOfBounds && !gameover && !start && ( length > 0 ) ) {
            enemyMoveCounter -= 1;
            if ( ENEMY_TYPES.includes( targetColor ) && !hitting) {
                targetColor = null;
                hitting = true;
                Game.hitEnemy();
            }
            else if(ENEMY_TYPES.includes( targetColor2 ) && !hitting){
                targetColor2 = null;
                hitting = true;
                Game.hitEnemy();
            }
            else if(ENEMY_TYPES.includes( targetColor3 ) && !hitting){
                targetColor3 = null;
                hitting = true;
                Game.hitEnemy();
            }
            if ( enemyMoveCounter < 0 ) {
                Game.moveEnemies();
                enemyMoveCounter = 12;
            }
        }
        hitting = false;
        if ( length == 0 && !portalOpened && !gameover && !start){
            Game.openPortal();
        }
        if (gameover){
            gameoverCounter -= 1;
            if ( gameoverCounter == 0 ){
                gameover = false;
                gameoverCounter = 360;
                Game.startScreen();
            }
        }
        if(invis){
            invisCount -= 1;
            PS.alpha(pX, pY, 100);
            if(invisCount <= 0){
                invis = false;
                invisCount = 500;
                PS.alpha(pX, pY, 255);
            }
        }
        else{
            invisCount = 500;
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
            if ( level == 3 ){
                PS.fade ( 7, 7, 15 );
                Game.createBlock( 0, 0, 7, 7, PORTAL_COLOR );
            }
            if ( level == 4 && room == 1){
                PS.fade( 2, 3, 15);
                Game.createBlock( 0, 0, 2, 3, PORTAL_COLOR );
            }
            if ( level == 5 && room == 0) {
                PS.fade ( 7, 7, 15 );
                Game.createBlock( 0, 0, 7, 7, PORTAL_COLOR );
            }
            if ( level == 6 ) {
                PS.fade ( 7, 13, 15 );
                Game.createBlock( 0, 0, 7, 13, PORTAL_COLOR );
            }
            if ( level == 7 ) {
                PS.fade ( 7, 7, 15 );
                Game.createBlock( 0, 0, 7, 7, PORTAL_COLOR );
            }
            if ( level == 8 ) {
                PS.fade ( 7, 7, 15 );
                Game.createBlock( 0, 0, 7, 7, PORTAL_COLOR );
            }
            if ( level == 9 ) {
                PS.fade ( 7, 7, 15 );
                Game.createBlock( 0, 0, 7, 7, PORTAL_COLOR );
            }
            if ( level == 10 ) {
                PS.fade ( 7, 7, 15 );
                Game.createBlock( 0, 0, 7, 7, PORTAL_COLOR );
            }
            portalOpened = true;
            PS.audioPlay ( "Enemies_Defeated", { volume: 0.25, path: "GameAudio/" });
        },

        hitEnemy() {
            let i = 0;
            let enemyNum = 0;
            length = enemies.length;
            while (i < length)  {
                if (( enemies[ i ].x === projectile.x && enemies[ i ].y === projectile.y )){
                    enemyNum = i;
                    projectile.x = 0;
                    projectile.y = 0;
                    projectile.destroyed = true;
                    projectile.fired = false;
                    PS.glyph(projectile.x, projectile.y, "");
                    break;
                }
                else if(trigun && ( enemies[ i ].x === projectile2.x && enemies[ i ].y === projectile2.y )){
                    enemyNum = i;
                    projectile2.x = 0;
                    projectile2.y = 0;
                    projectile2.destroyed = true;
                    projectile2.fired = false;
                    PS.glyph(projectile2.x, projectile2.y, "");
                    break;
                }
                else if(trigun && ( enemies[ i ].x === projectile3.x && enemies[ i ].y === projectile3.y )){
                    projectile3.x = 0;
                    projectile3.y = 0;
                    projectile3.destroyed = true;
                    projectile3.fired = false;
                    PS.glyph(projectile3.x, projectile3.y, "");
                    break;
                }
                i++
            }
            if( enemies[enemyNum].shield <= 0 ){
                enemies[ enemyNum ].destroyed = true;
                PS.color( enemies[ enemyNum ].x, enemies[ enemyNum ].y, target );
            }
            else if( enemies[enemyNum].shield > 0 ){
                enemies[enemyNum].shield -= 3;
            }

            PS.glyph( enemies[ enemyNum ].x, enemies[ enemyNum ].y, "" );
            PS.glyphColor( enemies[ enemyNum ].x, enemies[ enemyNum ].y, PS.COLOR_BLACK );
        },

        GameOver() {
            PS.audioPlay ( "GameOver", { volume: 0.5, path: "GameAudio/" });
            level = 1;
            PS.color (pX, pY, PS.COLOR_GREEN);
            Game.deleteAllEnemies();
            firing = false;
            gameover = true;
        },

        moveProjectiles(){
                if(!projectile.destroyed) {
                    pastProjX = projectile.x;
                    pastProjY = projectile.y;
                    if ((projectile.projDir === "right") && (projectile.x < WIDTH - 1)) {
                        projectile.x = projectile.x + 1;
                    }
                    else if ((projectile.projDir === "left") && (projectile.x !== 0)) {
                        projectile.x = projectile.x - 1;
                    }
                    else if ((projectile.projDir === "up") && (projectile.y !== 0)) {
                        projectile.y = projectile.y - 1;
                    }
                    else if ((projectile.projDir === "down") && (projectile.y < HEIGHT - 1)) {
                        projectile.y = projectile.y + 1;
                    }
                    if(trigun) {
                        if(!projectile2.destroyed) {
                            pastProjX2 = projectile2.x;
                            pastProjY2 = projectile2.y;
                            if ((projectile2.projDir === "leftAndUp") && (projectile2.y !== 0)
                                && (projectile2.x !== 0)) {
                                projectile2.y = projectile2.y - 1;
                                projectile2.x = projectile2.x - 1;
                            } else if ((projectile2.projDir === "rightAndUp") && (projectile2.y !== 0)
                                && (projectile2.x < WIDTH - 1)) {
                                projectile2.y = projectile2.y - 1;
                                projectile2.x = projectile2.x + 1;
                            } else if ((projectile2.projDir === "leftAndDown") && (projectile2.y < HEIGHT - 1)
                                && (projectile2.x !== 0)) {
                                projectile2.y = projectile2.y + 1;
                                projectile2.x = projectile2.x - 1;
                            } else if ((projectile2.projDir === "rightAndDown") && (projectile2.y < HEIGHT - 1)
                                && (projectile2.x < WIDTH - 1)) {
                                projectile2.y = projectile2.y + 1;
                                projectile2.x = projectile2.x + 1;
                            }
                            PS.glyph(pastProjX2, pastProjY2, "");
                            PS.glyphColor(pastProjX2, pastProjY2, PS.COLOR_BLACK);
                            if (SHIELD_COLOR == PS.borderColor(projectile2.x, projectile2.y)) {
                                Game.triggerEgg(projectile2.x, projectile2.y);
                            }
                            else {
                                PS.glyph(projectile2.x, projectile2.y, "⬤");
                                PS.glyphColor(projectile2.x, projectile2.y, PS.COLOR_RED);
                            }

                            target2 = PS.data(projectile2.x, projectile2.y);
                            targetColor2 = PS.color(projectile2.x, projectile2.y);
                            // PS.debug(targetColor);


                            if (OBSTACLES.includes(target2) || target2 == DOOR_COLOR) {
                                projectile2.destroyed = true;
                                projectile2.fired = false;
                                PS.glyph(projectile2.x, projectile2.y, "");
                            }
                        }
                        else{
                            PS.glyph(projectile2.x, projectile2.y, "");
                            PS.debug("Projectil2 Not Moving");
                        }
                        if(!projectile3.destroyed) {
                            pastProjX3 = projectile3.x;
                            pastProjY3 = projectile3.y;
                            if ((projectile3.projDir === "leftAndUp") && (projectile3.y !== 0)
                                && (projectile3.x !== 0)) {
                                projectile3.y = projectile3.y - 1;
                                projectile3.x = projectile3.x - 1;
                            } else if ((projectile3.projDir === "rightAndUp") && (projectile3.y !== 0)
                                && (projectile3.x < WIDTH - 1)) {
                                projectile3.y = projectile3.y - 1;
                                projectile3.x = projectile3.x + 1;
                            } else if ((projectile3.projDir === "leftAndDown") && (projectile3.y < HEIGHT - 1)
                                && (projectile3.x !== 0)) {
                                projectile3.y = projectile3.y + 1;
                                projectile3.x = projectile3.x - 1;
                            } else if ((projectile3.projDir === "rightAndDown") && (projectile3.y < HEIGHT - 1)
                                && (projectile3.x < WIDTH - 1)) {
                                projectile3.y = projectile3.y + 1;
                                projectile3.x = projectile3.x + 1;
                            }
                            PS.glyph(pastProjX3, pastProjY3, "");
                            PS.glyphColor(pastProjX3, pastProjY3, PS.COLOR_BLACK);
                            if (SHIELD_COLOR == PS.borderColor(projectile3.x, projectile3.y)) {
                                Game.triggerEgg(projectile3.x, projectile3.y);
                            }
                            else {
                                PS.glyph(projectile3.x, projectile3.y, "⬤");
                                PS.glyphColor(projectile3.x, projectile3.y, PS.COLOR_RED);
                            }

                            target3 = PS.data(projectile3.x, projectile3.y);
                            targetColor3 = PS.color(projectile3.x, projectile3.y);
                            // PS.debug(targetColor);


                            if (OBSTACLES.includes(target3) || target3 == DOOR_COLOR) {
                                projectile3.destroyed = true;
                                projectile3.fired = false;
                                PS.glyph(projectile3.x, projectile3.y, "");
                            }
                        }
                        else{
                            PS.glyph(projectile3.x, projectile3.y, "");
                            PS.debug("Projectil3 Not Moving");
                        }
                    }
                    PS.glyph(pastProjX, pastProjY, "");
                    PS.glyphColor(pastProjX, pastProjY, PS.COLOR_BLACK);
                    if (SHIELD_COLOR == PS.borderColor(projectile.x, projectile.y)) {
                        Game.triggerEgg(projectile.x, projectile.y);
                    }
                    else {
                        PS.glyph(projectile.x, projectile.y, "⬤");
                        PS.glyphColor(projectile.x, projectile.y, PS.COLOR_RED);
                    }

                    target = PS.data(projectile.x, projectile.y);
                    targetColor = PS.color(projectile.x, projectile.y);
                    // PS.debug(targetColor);


                    if (OBSTACLES.includes(target) || target == DOOR_COLOR) {
                        projectile.destroyed = true;
                        projectile.fired = false;
                        PS.glyph(projectile.x, projectile.y, "");
                    }
                }

                if (projectile.destroyed) {
                    PS.glyph(projectile.x, projectile.y, "");
                    if( trigun && projectile2.destroyed && projectile3.destroyed ){
                            firing = false;
                            PS.glyph(projectile.x, projectile.y, "");
                            PS.glyph(projectile2.x, projectile2.y, "");
                            PS.glyph(projectile3.x, projectile3.y, "");
                    }
                    else if (!trigun) {
                        firing = false;
                    }
                }

        },

        moveEnemies() {
            let path;
            let nextStep;
            let nextX;
            let nextY;
            let nextBead;
            let nextColor
            let chosenNext = false;
            let choice;
            // let index;
            // let hit = false;

            // *BM* This is where your bug was hiding
            // In JavaScript, any variables in the loop end condition (i < length) are checked only ONCE,
            // at the beginning of the loop.
            // If that variable's value is changed inside the loop, JavaScript won't notice!
            // The way around this is to use a while() loop instead.

            length = enemies.length;
            let i = 0;
            while ( i < length && !invis) {
                if ( !gameover && !enemies[i].destroyed ) {
                    //PS.debug("moving enemy");
                    path = PS.line( enemies[ i ].x, enemies[ i ].y, pX, pY );
                    if(typeof path[0] != "undefined"){
                        nextStep = path[0];
                        nextX = nextStep[0];
                        nextY = nextStep[1];
                    }
                    if(typeof(nextStep[ 0 ]) != "undefined" && typeof(nextStep[ 1 ]) != "undefined"
                        && (enemies[i].room == room) ) {

                        nextBead = PS.data(nextX, nextY);
                        nextColor = PS.color(nextX, nextY);

                        if (!ENEMY_TYPES.includes(nextColor) && !OBSTACLES.includes(nextBead)
                            && !POWERUPS.includes(nextColor)) {
                          //  PS.debug("Enemy " + i + " not stuck ");
                            PS.color(enemies[i].x, enemies[i].y, PS.data(enemies[i].x, enemies[i].y));
                            PS.border(enemies[i].x, enemies[i].y, 0);
                            PS.borderColor(enemies[i].x, enemies[i].y, PS.COLOR_BLACK);
                            enemies[i].x = nextX;
                            enemies[i].y = nextY;
                            PS.color(enemies[i].x, enemies[i].y, enemies[i].type);
                            PS.bgColor(enemies[i].x, enemies[i].y, PS.data(enemies[i].x, enemies[i].y));
                            PS.border(enemies[i].x, enemies[i].y, enemies[i].shield);
                            PS.borderColor(enemies[i].x, enemies[i].y, E_SHIELD_COLOR);
                        }
                        else{
                            while(!chosenNext){
                                //PS.debug("Enemy " + i + " stuck ");
                                choice = Math.floor(Math.random() * 4);
                                //Up
                                if(choice == 0 && (enemies[ i ].y - 1 > 0)){
                                    nextY = enemies[ i ].y - 1;
                                    nextX = enemies[ i ].x;
                                }
                                //Right
                                else if(choice == 1 && (enemies[ i ].x + 1 < (WIDTH - 1))){
                                    nextY = enemies[ i ].y;
                                    nextX = enemies[ i ].x + 1;
                                }
                                //Down
                                if(choice == 2 && (enemies[ i ].y + 1 < (HEIGHT - 1))){
                                    nextY = enemies[ i ].y + 1;
                                    nextX = enemies[ i ].x;
                                }
                                //Left
                                if(choice == 3 && (enemies[ i ].x - 1 > 0)){
                                    nextY = enemies[ i ].y;
                                    nextX = enemies[ i ].x - 1;
                                }
                                nextBead = PS.data(nextX, nextY);
                                nextColor = PS.color(nextX, nextY);

                                if (!ENEMY_TYPES.includes(nextColor) && !OBSTACLES.includes(nextBead)
                                    && !POWERUPS.includes(nextColor)) {
                                    PS.color(enemies[i].x, enemies[i].y, PS.data(enemies[i].x, enemies[i].y));
                                    PS.border(enemies[i].x, enemies[i].y, 0);
                                    PS.borderColor(enemies[i].x, enemies[i].y, PS.COLOR_BLACK);
                                    enemies[i].x = nextX;
                                    enemies[i].y = nextY;
                                    PS.color(enemies[i].x, enemies[i].y, enemies[i].type);
                                    PS.bgColor(enemies[i].x, enemies[i].y, PS.data(enemies[i].x, enemies[i].y));
                                    PS.border(enemies[i].x, enemies[i].y, enemies[i].shield);
                                    PS.borderColor(enemies[i].x, enemies[i].y, E_SHIELD_COLOR);
                                    chosenNext = true;
                                }
                            }
                        }
                        if(PS.random(100) <= 2){
                            Game.alienAudio();
                        }
                    }
                    if ( ((enemies[ i ].x === projectile.x && enemies[ i ].y === projectile.y ) ||
                        (enemies[ i ].x === projectile2.x && enemies[ i ].y === projectile2.y ) ||
                        (enemies[ i ].x === projectile3.x && enemies[ i ].y === projectile3.y )) && !hitting){
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
                    PS.border( enemies[ i ].x, enemies[ i ].y, 0);
                    PS.borderColor( enemies[ i ].x, enemies[ i ].y, PS.COLOR_BLACK);
                    enemies.splice( i, 1 );
                    length -= 1; // *BM* NOTE: i is NOT incremented! It now points to next entry due to splice.
                    break;
                }
            }
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
                    room: Room,
                    shield: 0
                };
                if( enemy.type == SHIELDED_ENEMY ){
                    enemy.shield = 3;
                }
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
                        shieldStrength += 3;
                        PS.border( pX, pY, shieldStrength);
                        PS.borderColor( pX, pY, PLAYER_SHIELD_COLOR);
                        PS.audioPlay ( "Shield_Pickup", { volume: 0.25, path: "GameAudio/" });
                        eastereggs[i].used = true;
                    }
                    else if( eastereggs[i].type == INVIS_COLOR){
                        invis = true;
                        eastereggs[i].used = true;
                        PS.audioPlay ( "Invisibility", { volume: 0.25, path: "GameAudio/" });
                    }
                    else if( eastereggs[i].type == TRIGUN_COLOR){
                        trigun = true;
                        eastereggs[i].used = true;
                        PS.audioPlay ( "Trigun_Pickup", { volume: 0.25, path: "GameAudio/" });
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
                this.deleteAllEggs();
                level = 1;
            }
            this.makeLevel();
            if( level <= 5){
                PS.fade( PS.ALL, PS.ALL, 15 );
                PS.color( PS.ALL, PS.ALL, PS.COLOR_BLACK );
                PS.color( startX, startY, PS.COLOR_YELLOW );
            }
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
            if(level == 3 || level == 4){
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
            /*var randomShoot = PS.random(6);
            if ( randomShoot == 1 ) {
                PS.audioPlay( "fx_shoot1", { volume: 0.25 } );
            }
            if ( randomShoot == 2 ) {
                PS.audioPlay( "fx_shoot2", { volume: 0.25 } );
            }
            if ( randomShoot == 3 ) {
                PS.audioPlay( "fx_shoot3", { volume: 0.25 } );
            }
            if ( randomShoot == 4 ) {
                PS.audioPlay( "fx_shoot4", { volume: 0.25 } );
            }
            if ( randomShoot == 5 ) {
                PS.audioPlay( "fx_shoot5", { volume: 0.25 } );
            }
            if ( randomShoot == 6 ) {
                PS.audioPlay( "fx_shoot6", { volume: 0.25 } );
            }*/
            PS.audioPlay( "Laser_Shoot", { volume: 0.15, path: "GameAudio/" });

        },

        alienAudio(){
            var randomAlien = PS.random(4);
            if ( randomAlien == 1 ) {
                PS.audioPlay ( "Alien1", { volume: 0.25, path: "GameAudio/" });
            }
            if ( randomAlien == 2 ) {
                PS.audioPlay ( "Alien2", { volume: 0.25, path: "GameAudio/" });
            }
            if ( randomAlien == 3 ) {
                PS.audioPlay ( "Alien3", { volume: 0.25, path: "GameAudio/" });
            }
            if ( randomAlien == 4 ) {
                PS.audioPlay ( "Alien4", { volume: 0.25, path: "GameAudio/" });
            }
        },

        makeLevel() {
            if ( !timer ) {
                timer = PS.timerStart( 1, tick );
            }
            if (level > 5){
                PS.gridSize( WIDTH, HEIGHT );
                this.createBlock(WIDTH-1, HEIGHT-1, 0,0, PS.COLOR_GREEN);
                PS.border( PS.ALL, PS.ALL, 0 );

            }
            if( level == 1){
                room = 0;
                PS.gridSize( WIDTH, HEIGHT );
                PS.bgAlpha( PS.ALL, PS.ALL, 255 );
                PS.border( PS.ALL, PS.ALL, 0 );
                startX = 7;
                startY = 11;
                this.makeFloor( 180, 198, 205, 20 );
                //Enemies
                this.makeEnemy( 7, 3, DEFAULT_ENEMY, 0 );

                //Inner Walls
                this.createBlock( 6, 0, 4, 7, PS.COLOR_BLACK );

                //Outer Walls
                this.createBlock( 14, 0, 0, 0, PS.COLOR_BLACK );
                this.createBlock( 14, 0, 0, 14, PS.COLOR_BLACK );
                this.createBlock( 0, 14, 0, 0, PS.COLOR_BLACK );
                this.createBlock( 0, 14, 14, 0, PS.COLOR_BLACK );
                //this.makeEasterEgg( 3, 10, TRIGUN_COLOR, 0);

            }
            if( level == 2){
                room = 0;
                PS.gridSize( WIDTH, HEIGHT );
                PS.bgAlpha( PS.ALL, PS.ALL, 255 );
                PS.border( PS.ALL, PS.ALL, 0 );
                startX = 7;
                startY = 7;
                this.makeFloor( 180, 198, 205, 20 );
                //Enemies
                this.makeEnemy( 3, 3, DEFAULT_ENEMY, 0 );
                this.makeEnemy( 3, 11, SHIELDED_ENEMY, 0 );

                //Inner Walls
                this.createBlock( 0, 1, 4, 7, PS.COLOR_BLACK );
                this.createBlock( 0, 0, 8, 10, PS.COLOR_BLACK );
                this.createBlock( 0, 1, 10, 6, PS.COLOR_BLACK );
                this.createBlock( 1, 0, 7, 4, PS.COLOR_BLACK );

                //Outer Walls
                this.createBlock( 14, 0, 0, 0, PS.COLOR_BLACK );
                this.createBlock( 14, 0, 0, 14, PS.COLOR_BLACK );
                this.createBlock( 0, 14, 0, 0, PS.COLOR_BLACK );
                this.createBlock( 0, 14, 14, 0, PS.COLOR_BLACK );
            }
            if( level == 3 ) {
                room = 0;
                PS.gridSize( WIDTH, HEIGHT );
                PS.bgAlpha( PS.ALL, PS.ALL, 255 );
                PS.border( PS.ALL, PS.ALL, 0 );
                startX = 7;
                startY = 7;
                this.makeFloor( 180, 198, 205, 20 );
                //Enemies
                this.makeEnemy( 7, 3, DEFAULT_ENEMY, 0 );
                this.makeEnemy( 7, 11, DEFAULT_ENEMY, 0 );
                this.makeEnemy( 11, 7, SHIELDED_ENEMY, 0 );

                //Inner Walls
                this.createBlock( 3, 0, 1, 1, PS.COLOR_BLACK );
                this.createBlock( 0, 3, 1, 1, PS.COLOR_BLACK );
                this.createBlock( 0, 3, 1, 10, PS.COLOR_BLACK );
                this.createBlock( 3, 0, 1, 13, PS.COLOR_BLACK );
                this.createBlock( 3, 0, 10, 1, PS.COLOR_BLACK );
                this.createBlock( 0, 3, 13, 1, PS.COLOR_BLACK );
                this.createBlock( 0, 3, 13, 10, PS.COLOR_BLACK );
                this.createBlock( 3, 0, 10, 13, PS.COLOR_BLACK );
                this.createBlock( 0, 0, 2, 2, PS.COLOR_BLACK );
                this.createBlock( 0, 0, 12, 2, PS.COLOR_BLACK );
                this.createBlock( 0, 0, 2, 12, PS.COLOR_BLACK );
                this.createBlock( 0, 0, 12, 12, PS.COLOR_BLACK );
                this.createBlock( 4, 0, 5, 5, PS.COLOR_BLACK );
                this.createBlock( 4, 0, 5, 9, PS.COLOR_BLACK );
                this.createBlock( 0, 4, 9, 5, PS.COLOR_BLACK );

                //Outer Walls
                this.createBlock( 14, 0, 0, 0, PS.COLOR_BLACK );
                this.createBlock( 14, 0, 0, 14, PS.COLOR_BLACK );
                this.createBlock( 0, 14, 0, 0, PS.COLOR_BLACK );
                this.createBlock( 0, 14, 14, 0, PS.COLOR_BLACK );
            }
            if( level == 4){
                PS.gridSize( WIDTH, HEIGHT );
                PS.bgAlpha( PS.ALL, PS.ALL, 255 );
                PS.border( PS.ALL, PS.ALL, 0 );
                this.makeFloor( 180, 198, 205, 20 );
                if(enemies.length == 0 && !portalOpened){
                    this.makeEnemy( 11, 2, SHIELDED_ENEMY, 0 );
                    this.makeEnemy( 12, 11, DEFAULT_ENEMY, 0 );
                    this.makeEnemy( 8, 3, SHIELDED_ENEMY, 1 );
                    this.makeEnemy( 12, 8, DEFAULT_ENEMY, 1 );
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
            if( level == 5 ) {
                PS.gridSize( WIDTH, HEIGHT );
                PS.bgAlpha( PS.ALL, PS.ALL, 255 );
                PS.border( PS.ALL, PS.ALL, 0 );
                this.makeFloor( 180, 198, 205, 20 );
                if(enemies.length == 0 && !portalOpened) {
                    this.makeEnemy( 7, 2, DEFAULT_ENEMY, 0 );
                    this.makeEnemy( 12, 2, SHIELDED_ENEMY, 0 );
                    this.makeEnemy( 12, 7, SHIELDED_ENEMY, 0 );
                    this.makeEnemy( 10, 12, DEFAULT_ENEMY, 0 );
                    this.makeEnemy( 4, 7, SHIELDED_ENEMY, 1 );
                    this.makeEnemy( 10, 7, SHIELDED_ENEMY, 1 );
                }
                if(eastereggs.length == 0) {
                    this.makeEasterEgg(7, 4, INVIS_COLOR, 1);
                }
                if(room == 0) {
                    if (usedDoor) {
                        startX = 1;
                        startY = 0;
                    } else {
                        startX = 3;
                        startY = 8;
                    }
                    //Inner Walls
                    this.createBlock( 1, 1, 3, 4, PS.COLOR_BLACK );
                    this.createBlock( 1, 1, 9, 3, PS.COLOR_BLACK );
                    this.createBlock( 1, 1, 10, 9, PS.COLOR_BLACK );
                    this.createBlock( 1, 1, 4, 10, PS.COLOR_BLACK );

                    //Outer Walls
                    this.createBlock( 14, 0, 0, 0, PS.COLOR_BLACK );
                    this.createBlock( 14, 0, 0, 14, PS.COLOR_BLACK );
                    this.createBlock( 0, 14, 0, 0, PS.COLOR_BLACK );
                    this.createBlock( 0, 14, 14, 0, PS.COLOR_BLACK );

                    //Door
                    this.createBlock(0, 0, 1, 0, DOOR_COLOR);
                }
                else if(room == 1) {
                    startX = 1;
                    startY = 14;

                    //Inner Walls

                    //Outer Walls
                    this.createBlock(14, 0, 0, 0, PS.COLOR_BLACK);
                    this.createBlock(14, 0, 0, 14, PS.COLOR_BLACK);
                    this.createBlock(0, 14, 0, 0, PS.COLOR_BLACK);
                    this.createBlock(0, 14, 14, 0, PS.COLOR_BLACK);

                    //Door
                    this.createBlock(0, 0, 1, 14, DOOR_COLOR);
                }
            }
            if ( level == 6 ) {
                room = 0;
                PS.gridSize( WIDTH, HEIGHT );
                PS.bgAlpha( PS.ALL, PS.ALL, 255 );
                PS.border( PS.ALL, PS.ALL, 0 );
                startX = 1;
                startY = 13;
                this.makeFloor( 180, 198, 205, 20 );
                //Enemies
                this.makeEnemy( 5, 1, DEFAULT_ENEMY, 0 );
                this.makeEnemy( 13, 9, SHIELDED_ENEMY, 0 );
                this.makeEnemy( 8, 13, DEFAULT_ENEMY, 0 );
                this.makeEnemy( 13, 5, DEFAULT_ENEMY, 0 );
                this.makeEnemy( 7, 11, DEFAULT_ENEMY, 0 );

                //Inner Walls
                this.createBlock( 2, 0, 2, 2, PS.COLOR_BLACK );
                this.createBlock( 0, 2, 2, 2, PS.COLOR_BLACK );
                this.createBlock( 0, 4, 4, 2, PS.COLOR_BLACK );
                this.createBlock( 2, 0, 2, 2, PS.COLOR_BLACK );
                this.createBlock( 0, 1, 6, 1, PS.COLOR_BLACK );
                this.createBlock( 2, 0, 1, 6, PS.COLOR_BLACK );
                this.createBlock( 4, 0, 2, 8, PS.COLOR_BLACK );
                this.createBlock( 0, 7, 6, 6, PS.COLOR_BLACK );
                this.createBlock( 3, 0, 1, 10, PS.COLOR_BLACK );
                this.createBlock( 0, 1, 2, 12, PS.COLOR_BLACK );
                this.createBlock( 0, 1, 4, 11, PS.COLOR_BLACK );
                this.createBlock( 2, 0, 6, 4, PS.COLOR_BLACK );
                this.createBlock( 0, 4, 8, 2, PS.COLOR_BLACK );
                this.createBlock( 4, 0, 8, 2, PS.COLOR_BLACK );
                this.createBlock( 0, 2, 8, 8, PS.COLOR_BLACK );
                this.createBlock( 2, 0, 8, 8, PS.COLOR_BLACK );
                this.createBlock( 0, 4, 12, 2, PS.COLOR_BLACK );
                this.createBlock( 0, 8, 10, 4, PS.COLOR_BLACK );
                this.createBlock( 2, 0, 7, 12, PS.COLOR_BLACK );
                this.createBlock( 0, 0, 11, 6, PS.COLOR_BLACK );
                this.createBlock( 0, 2, 12, 8, PS.COLOR_BLACK );
                this.createBlock( 0, 0, 13, 10, PS.COLOR_BLACK );
                this.createBlock( 0, 2, 12, 12, PS.COLOR_BLACK );

                //Outer Walls
                this.createBlock( 14, 0, 0, 0, PS.COLOR_BLACK );
                this.createBlock( 14, 0, 0, 14, PS.COLOR_BLACK );
                this.createBlock( 0, 14, 0, 0, PS.COLOR_BLACK );
                this.createBlock( 0, 14, 14, 0, PS.COLOR_BLACK );
            }
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

    PS.audioLoad ( "Laser_Shoot", { path: "GameAudio/" });
    PS.audioLoad ( "Alarm", { path: "GameAudio/" });
    PS.audioLoad ( "Alien1", { path: "GameAudio/" });
    PS.audioLoad ( "Alien2", { path: "GameAudio/" });
    PS.audioLoad ( "Alien3", { path: "GameAudio/" });
    PS.audioLoad ( "Alien4", { path: "GameAudio/" });
    PS.audioLoad ( "Alien5", { path: "GameAudio/" });
    PS.audioLoad ( "Enemies_Defeated", { path: "GameAudio/" });
    PS.audioLoad ( "GameOver", { path: "GameAudio/" });
    PS.audioLoad ( "Invisibility", { path: "GameAudio/" });
    PS.audioLoad ( "Trigun_Pickup", { path: "GameAudio/" });
    PS.audioLoad ( "Shield_Pickup", { path: "GameAudio/" });

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
        projectile.projDir =  direction;
        projectile.x = x;
        projectile.y = y;
        projectile.fired = false;
        projectile.destroyed = false;
        if(trigun){
            if(direction == "up"){
                projectile2.projDir =  "rightAndUp";
                projectile2.x = x;
                projectile2.y = y;
                projectile2.fired = false;
                projectile2.destroyed = false;

                projectile3.projDir =  "leftAndUp";
                projectile3.x = x;
                projectile3.y = y;
                projectile3.fired = false;
                projectile3.destroyed = false;
            }
            else if(direction == "right"){
                projectile2.projDir =  "rightAndUp";
                projectile2.x = x;
                projectile2.y = y;
                projectile2.fired = false;
                projectile2.destroyed = false;

                projectile3.projDir =  "rightAndDown";
                projectile3.x = x;
                projectile3.y = y;
                projectile3.fired = false;
                projectile3.destroyed = false;
            }
            else if(direction == "down"){
                projectile2.projDir =  "rightAndDown";
                projectile2.x = x;
                projectile2.y = y;
                projectile2.fired = false;
                projectile2.destroyed = false;

                projectile3.projDir =  "leftAndDown";
                projectile3.x = x;
                projectile3.y = y;
                projectile3.fired = false;
                projectile3.destroyed = false;
            }
            else if(direction == "left"){
                projectile2.projDir =  "leftAndDown";
                projectile2.x = x;
                projectile2.y = y;
                projectile2.fired = false;
                projectile2.destroyed = false;

                projectile3.projDir =  "leftAndUp";
                projectile3.x = x;
                projectile3.y = y;
                projectile3.fired = false;
                projectile3.destroyed = false;
            }
        }

        firing = true;
        Game.shootAudio();
        if(invis){
            invis = false;
            PS.alpha(pX, pY, 255);
        }
    }
    else{
        if(projectile.destroyed){
           // PS.debug("Projectile1 Destroyed");
        }
        if(projectile2.destroyed){
        //    PS.debug("Projectile2 Destroyed");
        }
        if(projectile3.destroyed){
         //   PS.debug("Projectile3 Destroyed");
        }
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

        PS.alpha(pastX, pastY, 255);
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
            level += 1;
            room = 0;
            usedDoor = false;
            Game.deleteAllEggs();
            Game.startScreen();
        }
        if( nextBead == DOOR_COLOR){
            Game.changeRooms(pX, pY);
        }
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
        if(level == 1 && firstStart){
            firstStart = false;
           // PS.audioPlay ( "Alarm", { volume: 0.5, path: "GameAudio/" });
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

