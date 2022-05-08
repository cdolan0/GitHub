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


//SOUNDS FOUND ON FREESOUND.ORG BY:
//spookymodem, Sonicfreak, Darsycho, outroelison, StormwaveAudio, CGEffex, steveygos93, Breviceps, Blockfighter298,
// SlykMrByches, roboroo, jacobalcook, NicknameLarry, distillerystudio

const WIDTH = 15;
const HEIGHT = 15;
const HIDDEN_DOOR_COLOR = 0x030102;
const PLAYER_COLOR = 0x238fe6;
const REGEN_COLOR = 0x238fe5;
const LAVA_COLOR = 0xd53e00;
const SHIELD_COLOR = PS.COLOR_RED;
const INVIS_COLOR = PS.COLOR_GRAY;
const TRIGUN_COLOR = PS.COLOR_VIOLET;
const PLAYER_SHIELD_COLOR = PS.COLOR_ORANGE
const OBSTACLES = [ PS.COLOR_BLACK, LAVA_COLOR ];
const SHIELDED_ENEMY = 0x2FC819;
const DEFAULT_ENEMY = 0x80E81D;
const MEGA_ENEMY = 0x014421;
const FINAL_BOSS_1 = 0x030110;
const FINAL_BOSS_2 = PS.COLOR_WHITE;;
const LAVA_ENEMY = 0xEA7401;
const SPAWNER_ENEMY = 0x6a3893;
// 0x7DE339
const ENEMY_TYPES = [ DEFAULT_ENEMY, SHIELDED_ENEMY, MEGA_ENEMY, LAVA_ENEMY, SPAWNER_ENEMY, FINAL_BOSS_1, FINAL_BOSS_2 ];
const LAVA_IGNORE = [LAVA_ENEMY, FINAL_BOSS_2];
const POWERUPS = [ SHIELD_COLOR, INVIS_COLOR, TRIGUN_COLOR, REGEN_COLOR ];
const PORTAL_COLOR = 0xff148d;
const DOOR_COLOR = PS.COLOR_GRAY_LIGHT;
const E_SHIELD_COLOR = 0x04d9ff;
const FINAL_SHIELD = 0x8A0303;
const ALTAR_COLOR_1 = 0x911717;
const ALTAR_COLOR_2 = 0xc62828;
const ALTAR_COLOR_3 = 0xd74e4e;
const ALTAR_COLOR_4 = 0xe86060;
const ALTAR_COLORS = [ALTAR_COLOR_1, ALTAR_COLOR_2, ALTAR_COLOR_3, ALTAR_COLOR_4];

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
let returnX, returnY, exitX, exitY;
let shieldStrength;
let gameover = false;
let start;
let enemies = [];
let eastereggs = [];
let blood = [];
let portalOpened = false;
let usedDoor, usedDoor2, usedDoor3, usedDoor4 = false;
let invis = false;
let regen = false;
let trigun = false;
let firstStart = true;
let finalLevel = false;
let runComplete = false;

let rgb;
let xMarker;
let yMarker;
let portalX;
let portalY;
let portalRoom;

let music = "";
let space = "";
let planet = "";

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
    let enemyMoveCounter = 22;
    let length = enemies.length;
    let gameoverCounter = 360;
    let hitting = false;
    let invisCount = 500;
    let boundsCount = 20;
    let startCount = 20;
    let portalCount = 20;
    let finalCount = 300;
    let spotNum = 196
    let lavaX;
    let lavaY;
    let chosenSpot = false
    let finishCount = 180;
    let regenCount = 300;

    let spawner = false;
    let spawnX;
    let spawnY;
    let spawningX;
    let spawningY;
    let spawnerCount = 180;
    let spawnRoom;

    let bloodLength = 0;
    let bloodCount = 30;
    let finishOver = false;

    let wentX = false;
    let wentY = false;
    let deathX;
    let deathY;
    let diagonalChoice;
    let alienDeath = false;
    let lavaDeath = false;
    let takingDamage = false;


    const tick = function () {
        length = enemies.length;

        if ( firing ) {
           Game.moveProjectiles();
        }

        if(isOutOfBounds){
            boundsCount -= 1;
            if(boundsCount == 10 ){
                PS.borderColor(returnX, returnY, PS.COLOR_YELLOW);
            }
            else if(boundsCount == 0){
                PS.borderColor(returnX, returnY, PS.COLOR_BLUE);
                boundsCount = 20;
            }
        }
        if(start){
            startCount -= 1;
            if(startCount == 10 ){
                PS.borderColor(startX, startY, PORTAL_COLOR);
            }
            else if(startCount == 0){
                PS.borderColor(startX, startY, PLAYER_COLOR);
                startCount = 20;
            }
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
                if(level < 5) {
                    enemyMoveCounter = 22;
                }
                else{
                    enemyMoveCounter = 16;
                }
            }
        }
        hitting = false;
        if ( length == 0 && !portalOpened && !gameover && !start){
           if(level === 15 && !runComplete){
               PS.fade(PS.ALL, PS.ALL, 30);
                PS.audioPlay ( "Victory", { volume: 0.25, path: "GameAudio/" });
                runComplete = true;
           }
           else if (!runComplete){
               portalOpened = true;
               PS.audioPlay ( "Enemies_Defeated", { volume: 0.25, path: "GameAudio/" });
           }
        }
        if(runComplete && !finishOver){
            bloodCount -= 1;
            if(bloodCount == 0 && bloodLength < blood.length){
                bloodCount = 30;
                if(blood[bloodLength].alien){
                    Game.makeBloodF(blood[bloodLength].x, blood[bloodLength].y, 190, 117, 202, 40);
                }
                else{
                    Game.makeBloodF(blood[bloodLength].x, blood[bloodLength].y, 220, 20, 60, 10);
                }
                bloodLength += 1;
            }
            else if (bloodLength >= blood.length){
                finishOver = true;
            }
        }
        if(finishOver){
            finishCount -= 1;
            if(finishCount === 0){
                PS.gridColor(PS.COLOR_BLACK);
                PS.radius(PS.ALL, PS.ALL, 0);
                PS.border(PS.ALL, PS.ALL, 0);
                PS.fade(PS.ALL, PS.ALL, 0);
                PS.color(PS.ALL, PS.ALL, PS.COLOR_BLACK);
                PS.audioPlay ( "AlienVictory1", { volume: 0.50, path: "GameAudio/" });
            }
        }
        else if( length != 0){
            portalOpened = false;
        }
        if(portalOpened){
            Game.openPortal();
            portalCount-=1
            if(portalCount <= 0){
                Game.makePortalBorder(25);
                portalCount = 20;
            }
        }
        if (gameover){
            if(alienDeath) {
                PS.bgColor(deathX, deathY, PS.COLOR_RED);
                if (gameoverCounter == 300) {
                    PS.audioFade ( space, PS.CURRENT, 0, 300);
                    PS.audioFade ( planet, PS.CURRENT, 0, 300);
                    if (Math.floor(Math.random() * 2) == 1) {
                        if (!OBSTACLES.includes(PS.data(deathX - 1, deathY))) {
                            PS.bgColor(deathX - 1, deathY, PS.COLOR_RED);
                            PS.alpha(deathX - 1, deathY, 50);
                        } else if (!OBSTACLES.includes(PS.data(deathX + 1, deathY))) {
                            PS.bgColor(deathX + 1, deathY, PS.COLOR_RED);
                            PS.alpha(deathX + 1, deathY, 50);
                        }
                        wentX = true;
                    } else {
                        if (!OBSTACLES.includes(PS.data(deathX, deathY - 1))) {
                            PS.bgColor(deathX, deathY - 1, PS.COLOR_RED);
                            PS.alpha(deathX, deathY - 1, 50);
                        } else if (!OBSTACLES.includes(PS.data(deathX, deathY + 1))) {
                            PS.bgColor(deathX, deathY + 1, PS.COLOR_RED);
                            PS.alpha(deathX, deathY + 1, 50);
                        }
                        wentY = false;
                    }
                    PS.glyph(PS.ALL, PS.ALL, "");
                }
                if (gameoverCounter == 270) {
                    if (wentY) {
                        if (!OBSTACLES.includes(PS.data(deathX - 1, deathY))) {
                            PS.bgColor(deathX - 1, deathY, PS.COLOR_RED);
                            PS.alpha(deathX - 1, deathY, 50);
                        } else if (!OBSTACLES.includes(PS.data(deathX + 1, deathY))) {
                            PS.bgColor(deathX + 1, deathY, PS.COLOR_RED);
                            PS.alpha(deathX + 1, deathY, 50);
                        }
                        wentY = false
                    } else if (wentX) {
                        if (!OBSTACLES.includes(PS.data(deathX, deathY - 1))) {
                            PS.bgColor(deathX, deathY - 1, PS.COLOR_RED);
                            PS.alpha(deathX, deathY - 1, 50);
                        } else if (!OBSTACLES.includes(PS.data(deathX, deathY + 1))) {
                            PS.bgColor(deathX, deathY + 1, PS.COLOR_RED);
                            PS.alpha(deathX, deathY + 1, 50);
                        }
                        wentX = false;
                    }
                }
                if (gameoverCounter == 240) {
                    if (Math.floor(Math.random() * 2) == 1) {
                        if (!OBSTACLES.includes(PS.data(deathX - 1, deathY)) && PS.bgColor(deathX - 1, deathY) != PS.COLOR_RED) {
                            PS.bgColor(deathX - 1, deathY, PS.COLOR_RED);
                            PS.alpha(deathX - 1, deathY, 50);
                        } else if (!OBSTACLES.includes(PS.data(deathX + 1, deathY)) && PS.bgColor(deathX + 1, deathY) != PS.COLOR_RED) {
                            PS.bgColor(deathX + 1, deathY, PS.COLOR_RED);
                            PS.alpha(deathX + 1, deathY, 50);
                        }
                        wentX = true;
                    } else {
                        if (!OBSTACLES.includes(PS.data(deathX, deathY - 1)) && PS.bgColor(deathX, deathY - 1) != PS.COLOR_RED) {
                            PS.bgColor(deathX, deathY - 1, PS.COLOR_RED);
                            PS.alpha(deathX, deathY - 1, 50);
                        } else if (!OBSTACLES.includes(PS.data(deathX, deathY + 1)) && PS.bgColor(deathX, deathY + 1) != PS.COLOR_RED) {
                            PS.bgColor(deathX, deathY + 1, PS.COLOR_RED);
                            PS.alpha(deathX, deathY + 1, 50);
                        }
                        wentY = false;
                    }
                }
                if (gameoverCounter == 210) {
                    if (wentY) {
                        if (!OBSTACLES.includes(PS.data(deathX - 1, deathY)) && PS.bgColor(deathX - 1, deathY) != PS.COLOR_RED) {
                            PS.bgColor(deathX - 1, deathY, PS.COLOR_RED);
                            PS.alpha(deathX - 1, deathY, 50);
                        } else if (!OBSTACLES.includes(PS.data(deathX + 1, deathY)) && PS.bgColor(deathX + 1, deathY) != PS.COLOR_RED) {
                            PS.bgColor(deathX + 1, deathY, PS.COLOR_RED);
                            PS.alpha(deathX + 1, deathY, 50);
                        }
                    } else if (wentX) {
                        if (!OBSTACLES.includes(PS.data(deathX, deathY - 1)) && PS.bgColor(deathX, deathY - 1) != PS.COLOR_RED) {
                            PS.bgColor(deathX, deathY - 1, PS.COLOR_RED);
                            PS.alpha(deathX, deathY - 1, 50);
                        } else if (!OBSTACLES.includes(PS.data(deathX, deathY + 1)) && PS.bgColor(deathX, deathY + 1) != PS.COLOR_RED) {
                            PS.bgColor(deathX, deathY + 1, PS.COLOR_RED);
                            PS.alpha(deathX, deathY + 1, 50);
                        }
                    }
                }
                if (gameoverCounter == 180) {
                    diagonalChoice = Math.floor(Math.random() * 4);
                    if (diagonalChoice == 1 && !OBSTACLES.includes(PS.data(deathX + 1, deathY + 1))) {
                        PS.bgColor(deathX + 1, deathY + 1, PS.COLOR_RED);
                        PS.alpha(deathX + 1, deathY + 1, 25);
                    } else if (diagonalChoice == 2 && !OBSTACLES.includes(PS.data(deathX + 1, deathY - 1))) {
                        PS.bgColor(deathX + 1, deathY - 1, PS.COLOR_RED);
                        PS.alpha(deathX + 1, deathY - 1, 25);
                    } else if (diagonalChoice == 3 && !OBSTACLES.includes(PS.data(deathX - 1, deathY - 1))) {
                        PS.bgColor(deathX - 1, deathY - 1, PS.COLOR_RED);
                        PS.alpha(deathX - 1, deathY - 1, 25);
                    } else if (diagonalChoice == 4 && !OBSTACLES.includes(PS.data(deathX - 1, deathY + 1))) {
                        PS.bgColor(deathX - 1, deathY + 1, PS.COLOR_RED);
                        PS.alpha(deathX - 1, deathY + 1, 25);
                    }
                }
                if (gameoverCounter == 60) {
                    PS.alpha(deathX, deathY + 1, 255);
                    PS.alpha(deathX, deathY - 1, 255);
                    PS.alpha(deathX + 1, deathY, 255);
                    PS.alpha(deathX - 1, deathY, 255);
                    PS.alpha(deathX + 1, deathY + 1, 255);
                    PS.alpha(deathX + 1, deathY - 1, 255);
                    PS.alpha(deathX - 1, deathY - 1, 255);
                    PS.alpha(deathX + 1, deathY + 1, 255);
                }
                if (gameoverCounter == 0) {
                    PS.audioFade ( space, PS.CURRENT, 0.25, 30);
                    gameover = false;
                    alienDeath = false;
                    wentX = false;
                    wentY = false;
                    gameoverCounter = 360;
                    Game.startScreen();
                }
            }
            else if(lavaDeath){
                    PS.border(deathX, deathY, 0);
                    PS.radius(deathX, deathY, 50);
                    PS.bgColor(deathX, deathY, LAVA_COLOR);
                    PS.fade(deathX, deathY, 200);
                    PS.color(deathX, deathY, LAVA_COLOR);
                if ( gameoverCounter == 0 ){
                    gameover = false;
                    lavaDeath = false;
                    gameoverCounter = 360;
                    Game.startScreen();
                }
            }
            gameoverCounter -= 1;
        }
        if(invis && !isOutOfBounds && !gameover && !start){
            invisCount -= 1;
            if(invisCount <= 0){
                invis = false;
                invisCount = 500;
                PS.alpha(pX, pY, 255);
            }
        }
        else if (!invis){
            invisCount = 500;
        }
        if(regen && shieldStrength === 0 && !isOutOfBounds && !gameover && !start){
            regenCount -= 1;
            if(regenCount === 0){
                shieldStrength = 1
                PS.border(pX, pY, shieldStrength);
                PS.borderColor(pX, pY, PLAYER_SHIELD_COLOR);
                PS.audioPlay ( "PlayerShield", { path: "GameAudio/", volume: 0.10 });
                regenCount = 300;
            }
        }
        if(spawner && spawnRoom === room && !isOutOfBounds && !gameover && !start){
            if(spawnerCount === 170){
                while(!chosenSpot){
                    spawningX = spawnX-1 + Math.floor(Math.random() * 3);
                    spawningY = spawnY-1 + Math.floor(Math.random() * 3);
                    if( !ENEMY_TYPES.includes(PS.color(spawningX, spawningY)) &&
                        !OBSTACLES.includes(PS.color(spawningX, spawningY))){
                        chosenSpot = true;
                        spotNum += 1;
                    }
                }
                PS.bgColor(spawningX, spawningY, 0xc300ff);
                PS.color(spawningX, spawningY, 0xc300ff);
            }
            else if(spawnerCount === 120){
                PS.bgColor(spawningX, spawningY,PS.data(spawningX, spawningY));
                PS.color(spawningX, spawningY, PS.data(spawningX, spawningY));
            }
            else if(spawnerCount === 60){
                PS.bgColor(spawningX, spawningY, 0xc300ff);
                PS.color(spawningX, spawningY, 0xc300ff);
            }
            else if(spawnerCount === 0){
                PS.bgColor(spawningX, spawningY,PS.data(spawningX, spawningY));
                Game.makeEnemy(spawningX, spawningY, DEFAULT_ENEMY, room);
                chosenSpot = false;
                spawnerCount = 300;
            }
            spawnerCount -= 1;
        }
        if(finalLevel && !isOutOfBounds && !gameover && !start && !runComplete){
            chosenSpot = false;
            if(finalCount === 290){
                while(!chosenSpot){
                    lavaX = PS.random(WIDTH-1);
                    lavaY = PS.random(HEIGHT-1);
                    if(PS.data(lavaX, lavaY) !== LAVA_COLOR){
                        chosenSpot = true;
                        spotNum += 1;
                    }
                    else if( spotNum === 196 ){
                        chosenSpot = true;
                    }
                }
                PS.bgColor(lavaX, lavaY, PS.COLOR_YELLOW);
                PS.color(lavaX, lavaY, PS.COLOR_YELLOW);
            }
            else if(finalCount === 240){
                PS.bgColor(lavaX, lavaY, PS.data(lavaX, lavaY));
                PS.color(lavaX, lavaY, PS.data(lavaX, lavaY));
            }
            else if(finalCount === 180){
                PS.bgColor(lavaX, lavaY, PS.COLOR_YELLOW);
                PS.color(lavaX, lavaY, PS.COLOR_YELLOW);
            }
            else if(finalCount === 120){
                PS.bgColor(lavaX, lavaY, PS.data(lavaX, lavaY));
                PS.color(lavaX, lavaY, PS.data(lavaX, lavaY));
            }
            else if(finalCount === 60){
                PS.bgColor(lavaX, lavaY, PS.COLOR_YELLOW);
                PS.color(lavaX, lavaY, PS.COLOR_YELLOW);
            }
            else if(finalCount === 0){
                Game.createBlock(0, 0, lavaX, lavaY, LAVA_COLOR);
                Game.lavaSizzle();
                chosenSpot = false;
                finalCount = 300;
            }
            finalCount -= 1;
        }
    };

    Game = {
        createBlock( w, h, x, y, color ) {
            for ( let i = x; i <= ( x + w ); i += 1 ) {
                for ( let j = y; j <= ( y + h ); j += 1 ) {
                    PS.color( i, j, color );
                    PS.bgColor( i, j, color );
                    PS.data( i, j, color );
                }
            }
        },

        openPortal(){
            if ( room == portalRoom ) {
                PS.fade(portalX, portalY, 15);
                PS.color(portalX, portalY, PORTAL_COLOR);
                PS.bgColor(portalX, portalY, PS.data(portalX, portalY));
                PS.radius(portalX, portalY, 30);
            }
        },

        hitEnemy() {
            let i = 0;
            let enemyNum;
            let enemyNumLength;
            let bloodSplat;
            length = enemies.length;
            while (i < length) {
                if ((enemies[i].x === projectile.x && enemies[i].y === projectile.y)) {
                    enemyNum = i;
                    projectile.x = 0;
                    projectile.y = 0;
                    projectile.destroyed = true;
                    projectile.fired = false;
                    PS.glyph(projectile.x, projectile.y, "");
                    this.damageTarget(enemyNum);
                    break;
                }
                if (enemies[i].x === projectile2.x && enemies[i].y === projectile2.y) {
                    enemyNum = i;
                    projectile2.x = 0;
                    projectile2.y = 0;
                    projectile2.destroyed = true;
                    projectile2.fired = false;
                    PS.glyph(projectile2.x, projectile2.y, "");
                    this.damageTarget(enemyNum);
                    break;
                }
                if (enemies[i].x === projectile3.x && enemies[i].y === projectile3.y) {
                    enemyNum = i;
                    projectile3.x = 0;
                    projectile3.y = 0;
                    projectile3.destroyed = true;
                    projectile3.fired = false;
                    PS.glyph(projectile3.x, projectile3.y, "");
                    this.damageTarget(enemyNum);
                    break;
                }
                i++
            }
        },

        damageTarget(enemyNum){
            let bloodSplat;
            if( enemies[enemyNum].shield <= 0 && enemies.length > 0 && !enemies[enemyNum].invuln) {
                if(enemies[enemyNum].type === FINAL_BOSS_1){
                    PS.audioPlay ( "BossChange", { path: "GameAudio/", volume: 0.25 });
                    enemies[enemyNum].shield = 12;
                    enemies[enemyNum].type = FINAL_BOSS_2;
                    PS.color(enemies[enemyNum].x, enemies[enemyNum].y, enemies[enemyNum].type);
                    PS.border(enemies[enemyNum].x, enemies[enemyNum].y, enemies[enemyNum].shield);
                    PS.borderColor(enemies[enemyNum].x, enemies[enemyNum].y, FINAL_SHIELD);
                }
                else {
                    if( enemies[enemyNum].type === FINAL_BOSS_2){
                        PS.audioPlay ( "BossDeath", { path: "GameAudio/", volume: 0.25 });
                    }
                    else{
                        this.alienDeath();
                    }
                    enemies[enemyNum].destroyed = true;
                    if (level == 9 && room == 0 && ALTAR_COLORS.includes(PS.data(enemies[enemyNum].x, enemies[enemyNum].y))) {
                        this.trigunAltar();
                    }
                    this.makeBlood(enemies[enemyNum].x, enemies[enemyNum].y, 190, 117, 202, 40);
                    this.alienSplatt();
                    bloodSplat = {
                        x: enemies[enemyNum].x,
                        y: enemies[enemyNum].y,
                        room: room,
                        level: level,
                        alien: true
                    }
                    blood.push(bloodSplat);
                    if(enemies[enemyNum].type === SPAWNER_ENEMY){
                        spawner = false;
                        spawnerCount = 300;
                        PS.color(spawningX, spawningY, PS.data(spawningX, spawningY));
                    }
                    /*  PS.border( enemies[ i ].x, enemies[ i ].y, 0);
                      PS.borderColor( enemies[ i ].x, enemies[ i ].y, PS.COLOR_BLACK);
                      enemies.splice( i, 1 );
                      length -= 1; // *BM* NOTE: i is NOT incremented! It now points to next entry due to splice.
                      //break;
                   ;*/
                }
            }
            else if( enemies[enemyNum].shield > 0 && !enemies[enemyNum].invuln){
                if(enemies[enemyNum].type === FINAL_BOSS_1 || enemies[enemyNum].type === FINAL_BOSS_2){
                    enemies[enemyNum].shield -= 0.5;
                    // PS.debug(enemies[enemyNum].shield);
                }
                else{
                    enemies[enemyNum].shield -= 3;
                }
                PS.audioPlay ( "EnemyShield", { path: "GameAudio/", volume: 0.25 });
                PS.border( enemies[ enemyNum ].x, enemies[ enemyNum ].y, enemies[ enemyNum ].shield);
            }
            else if(enemies[enemyNum].invuln){
                PS.audioPlay ( "Invuln", { path: "GameAudio/", volume: 0.25 });
            }
            PS.glyph( enemies[ enemyNum ].x, enemies[ enemyNum ].y, "" );
            PS.glyphColor( enemies[ enemyNum ].x, enemies[ enemyNum ].y, PS.COLOR_BLACK );
        },

        drawBlood(){
          for(let i = 0; i < blood.length; i += 1){
              if(level == blood[i].level && room == blood[i].room){
                  if(blood[i].alien && PS.data(blood[i].x, blood[i].y) !== LAVA_COLOR){
                      this.makeBlood(blood[i].x, blood[i].y, 190, 117, 202, 40);
                  }
                  else if (PS.data(blood[i].x, blood[i].y) !== LAVA_COLOR){
                      this.makeBlood(blood[i].x, blood[i].y, 220, 20, 60, 10);
                  }
              }
          }
        },

        trigunAltar(){
            trigun = true;
            PS.audioPlay ( "Trigun_Pickup", { volume: 0.25, path: "GameAudio/" });
            this.makeFloor( 145, 23, 23, 30, 0, 0, WIDTH, HEIGHT );
            //Trigun Altar
            this.createBlock( 0, 0, 7, 7, ALTAR_COLOR_1 );
            this.createBlock( 0, 0, 6, 7, ALTAR_COLOR_2 );
            this.createBlock( 0, 0, 7, 8, ALTAR_COLOR_2 );
            this.createBlock( 0, 0, 8, 6, ALTAR_COLOR_2 );
            this.createBlock( 0, 0, 6, 6, ALTAR_COLOR_3 );
            this.createBlock( 0, 0, 8, 8, ALTAR_COLOR_3 );
            this.createBlock( 0, 0, 6, 9, ALTAR_COLOR_4 );
            this.createBlock( 0, 0, 5, 7, ALTAR_COLOR_4 );
            this.createBlock( 0, 0, 7, 5, ALTAR_COLOR_4 );
            PS.color( pX, pY, PLAYER_COLOR );
            PS.border(pX, pY, shieldStrength);
            PS.borderColor(pX, pY, PLAYER_SHIELD_COLOR);
            PS.bgColor( pX, pY, PS.data( pX, pY ) );
            //Outer Walls
            this.createBlock( 14, 0, 0, 0, PS.COLOR_BLACK );
            this.createBlock( 14, 0, 0, 14, PS.COLOR_BLACK );
            this.createBlock( 0, 14, 0, 0, PS.COLOR_BLACK );
            this.createBlock( 0, 14, 14, 0, PS.COLOR_BLACK );
            this.createBlock(0, 0, 14, 7, DOOR_COLOR);
        },

        GameOver(type) {
            spawner = false;
            finalLevel = false;
            room = 0;
            usedDoor = false;
            trigun = false;
            shieldStrength = 0;
            let bloodSplat;
            deathX = pX;
            deathY = pY;
            bloodSplat = {
                x: deathX,
                y: deathY,
                room: room,
                level: level,
                alien: false
            }
            blood.push(bloodSplat);
            Game.deleteAllEggs();
            PS.color( pX, pY, PLAYER_COLOR );
            PS.audioPlay ( "GameOver", { volume: 0.3, path: "GameAudio/" });
            PS.fade ( PS.ALL, PS.ALL, 280 );
            PS.border(PS.ALL, PS.ALL,  0);
            PS.color( PS.ALL, PS.ALL, PS.COLOR_BLACK );
            PS.fade( pX, pY, 300)
            PS.border(pX, pY, 1);
            PS.borderColor(pX, pY, 0);
            PS.color( pX, pY, DEFAULT_ENEMY);
            level = 1;
            //PS.color (pX, pY, PS.COLOR_RED);
            Game.deleteAllEnemies();
            firing = false;
            if(type == "Alien"){
                alienDeath = true;
                this.alienVictory();
            }
            else if(type == "Lava"){
                lavaDeath = true;
                PS.audioPlay ( "LavaDeath", { path: "GameAudio/", volume: 0.5 });
            }
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
                    else if((projectile.y == HEIGHT - 1) || (projectile.y == 0) || (projectile.x == 0) ||
                        (projectile.x == WIDTH - 1)){
                        projectile.destroyed = true;
                        projectile.fired = false;
                        PS.glyph(projectile.x, projectile.y, "");
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
                            else if((projectile2.y == HEIGHT - 1) || (projectile2.y == 0) || (projectile2.x == 0) ||
                                (projectile2.x == WIDTH - 1)){
                                projectile2.destroyed = true;
                                projectile2.fired = false;
                                PS.glyph(projectile2.x, projectile2.y, "");
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


                            if ((OBSTACLES.includes(target2) && target2 != LAVA_COLOR) || target2 == DOOR_COLOR) {
                                projectile2.destroyed = true;
                                projectile2.fired = false;
                                PS.glyph(projectile2.x, projectile2.y, "");
                            }
                        }
                        else{
                            PS.glyph(projectile2.x, projectile2.y, "");
                            //PS.debug("Projectil2 Not Moving");
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
                            else if((projectile3.y == HEIGHT - 1) || (projectile3.y == 0) || (projectile3.x == 0) ||
                                (projectile3.x == WIDTH - 1)){
                                projectile3.destroyed = true;
                                projectile3.fired = false;
                                PS.glyph(projectile3.x, projectile3.y, "");
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


                            if ((OBSTACLES.includes(target3) && target3 != LAVA_COLOR)  || target3 == DOOR_COLOR) {
                                projectile3.destroyed = true;
                                projectile3.fired = false;
                                PS.glyph(projectile3.x, projectile3.y, "");
                            }
                        }
                        else{
                            PS.glyph(projectile3.x, projectile3.y, "");
                            //PS.debug("Projectil3 Not Moving");
                        }
                    }
                    PS.glyph(pastProjX, pastProjY, "");
                    PS.glyphColor(pastProjX, pastProjY, PS.COLOR_BLACK);
                    target = PS.data(projectile.x, projectile.y);
                    targetColor = PS.color(projectile.x, projectile.y);
                    if (SHIELD_COLOR == PS.borderColor(projectile.x, projectile.y) || targetColor == REGEN_COLOR) {
                        Game.triggerEgg(projectile.x, projectile.y);
                    }
                    else {
                        PS.glyph(projectile.x, projectile.y, "⬤");
                        PS.glyphColor(projectile.x, projectile.y, PS.COLOR_RED);
                    }


                    // PS.debug(targetColor);


                    if ((OBSTACLES.includes(target) && target != LAVA_COLOR)  || target == DOOR_COLOR) {
                        projectile.destroyed = true;
                        projectile.fired = false;
                        PS.glyph(projectile.x, projectile.y, "");
                    }
                }

                if (projectile.destroyed) {
                    PS.glyph(projectile.x, projectile.y, "");
                  /*  if( trigun && projectile2.destroyed && projectile3.destroyed ){
                            firing = false;
                            PS.glyph(projectile.x, projectile.y, "");
                            PS.glyph(projectile2.x, projectile2.y, "");
                            PS.glyph(projectile3.x, projectile3.y, "");
                    }
                    else if (!trigun) {
                        firing = false;
                    }*/
                    firing = false;
                    PS.glyph(projectile.x, projectile.y, "");
                    PS.glyph(projectile2.x, projectile2.y, "");
                    PS.glyph(projectile3.x, projectile3.y, "");
                    projectile.x = 0;
                    projectile.y = 0;
                    projectile2.x = 0;
                    projectile2.y = 0;
                    projectile3.x = 0;
                    projectile3.y = 0;
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
            var chose1 = false;
            var chose2 = false;
            var chose3 = false;
            var chose4 = false;

            // let index;
            // let hit = false;

            // *BM* This is where your bug was hiding
            // In JavaScript, any variables in the loop end condition (i < length) are checked only ONCE,
            // at the beginning of the loop.
            // If that variable's value is changed inside the loop, JavaScript won't notice!
            // The way around this is to use a while() loop instead.

            length = enemies.length;
            let i = 0;
            while ( i < length && !invis ) {
                if ( !gameover && !enemies[i].destroyed ) {
                    if(enemies[i].room == room && enemies[i].type !== SPAWNER_ENEMY) {
                        if(enemies[i].type === FINAL_BOSS_1 && (Math.abs(enemies[i].x-pX) < 4 && Math.abs(enemies[i].y-pY) < 4)){
                            enemies[i].invuln = false;
                            PS.borderColor(enemies[i].x, enemies[i].y, E_SHIELD_COLOR);
                        }
                        else if(enemies[i].type === FINAL_BOSS_1 ){
                            enemies[i].invuln = true;
                            PS.borderColor(enemies[i].x, enemies[i].y, FINAL_SHIELD);
                        }
                        if(enemies[i].type === FINAL_BOSS_2 && (Math.abs(enemies[i].x-pX) < 4 && Math.abs(enemies[i].y-pY) < 4)){
                            enemies[i].invuln = true;
                            PS.borderColor(enemies[i].x, enemies[i].y, FINAL_SHIELD);
                        }
                        else if(enemies[i].type === FINAL_BOSS_2 ){
                            enemies[i].invuln = false;
                            PS.borderColor(enemies[i].x, enemies[i].y, E_SHIELD_COLOR);
                        }
                        //PS.debug("moving enemy");
                        path = PS.line(enemies[i].x, enemies[i].y, pX, pY);
                        if (typeof path[0] != "undefined") {
                            nextStep = path[0];
                            nextX = nextStep[0];
                            nextY = nextStep[1];
                        }
                        if (typeof (nextStep) !== "undefined" && typeof (nextStep[0])  !== "undefined" && typeof (nextStep[1]) !== "undefined"
                            && (enemies[i].room == room)) {

                            //Check for diagonals
                            if( nextX == enemies[i].x+1 && nextY == enemies[i].y+1){
                                if( OBSTACLES.includes( PS.data( nextX-1, nextY ) ) ){
                                    nextY = enemies[i].y;
                                }
                                else if ( OBSTACLES.includes( PS.data( nextX, nextY-1 ) ) ){
                                    nextX = enemies[i].x;
                                }
                            }
                            else if( nextX == enemies[i].x+1 && nextY == enemies[i].y-1){
                                if( OBSTACLES.includes( PS.data( nextX-1, nextY ) ) ){
                                    nextY = enemies[i].y;
                                }
                                else if ( OBSTACLES.includes( PS.data( nextX, nextY+1 ) ) ){
                                    nextX = enemies[i].x;
                                }
                            }
                            else if( nextX == enemies[i].x-1 && nextY == enemies[i].y+1){
                                if( OBSTACLES.includes( PS.data( nextX+1, nextY ) ) ){
                                    nextY = enemies[i].y;
                                }
                                else if ( OBSTACLES.includes( PS.data( nextX, nextY-1 ) ) ){
                                    nextX = enemies[i].x;
                                }
                            }
                            else if( nextX == enemies[i].x-1 && nextY == enemies[i].y-1){
                                if(  OBSTACLES.includes( PS.data( nextX+1, nextY ) ) ){
                                    nextY = enemies[i].y;
                                }
                                else if ( OBSTACLES.includes( PS.data( nextX, nextY+1 ) ) ){
                                    nextX = enemies[i].x;
                                }
                            }
                            nextBead = PS.data(nextX, nextY);
                            nextColor = PS.color(nextX, nextY);

                          /*      || nextY == enemies[i].y-1) )
                                || ( nextX == enemies[i].x-1 && ( nextY == enemies[i].y+1 || nextY == enemies[i].y-1) ))*/

                            if ((!ENEMY_TYPES.includes(nextColor) || (nextY === enemies[i].y && nextX === enemies[i].x))
                                && (!OBSTACLES.includes(nextBead) ||
                                    ( LAVA_IGNORE.includes(enemies[i].type) && nextBead == LAVA_COLOR ) )
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
                            } else {
                                while (!chosenNext) {
                                    //PS.debug("Enemy " + i + " stuck ");
                                    choice = PS.random(4);
                                    //Up
                                    if (choice == 1 && (enemies[i].y - 1 > 0) && !chose1) {
                                        nextY = enemies[i].y - 1;
                                        nextX = enemies[i].x;
                                        chose1 = true;
                                    }
                                    //Right
                                    else if (choice == 2 && (enemies[i].x + 1 < (WIDTH - 1)) && !chose2) {
                                        nextY = enemies[i].y;
                                        nextX = enemies[i].x + 1;
                                        chose2 = true;
                                    }
                                    //Down
                                    else if (choice == 3 && (enemies[i].y + 1 < (HEIGHT - 1)) && !chose3) {
                                        nextY = enemies[i].y + 1;
                                        nextX = enemies[i].x;
                                        chose3 = true;
                                    }
                                    //Left
                                    else if (choice == 4 && (enemies[i].x - 1 > 0) && !chose4) {
                                        nextY = enemies[i].y;
                                        nextX = enemies[i].x - 1;
                                        chose4 = true;
                                    }
                                    else if( chose1, chose2, chose3, chose4){
                                        nextY = enemies[i].y;
                                        nextX = enemies[i].x;
                                    }
                                    nextBead = PS.data(nextX, nextY);
                                    nextColor = PS.color(nextX, nextY);

                                    if ((!ENEMY_TYPES.includes(nextColor) || (nextY === enemies[i].y && nextX === enemies[i].x))
                                        && (!OBSTACLES.includes(nextBead) || ( LAVA_IGNORE.includes(enemies[i].type) && nextBead === LAVA_COLOR ) ) &&
                                        !POWERUPS.includes(nextColor) ) {
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
                                chose1 = false;
                                chose2 = false;
                                chose3 = false;
                                chose4 = false;
                            }
                            if (PS.random(100) <= 2) {
                                Game.alienAudio();
                            }
                        }
                        if (((enemies[i].x === projectile.x && enemies[i].y === projectile.y) ||
                            (enemies[i].x === projectile2.x && enemies[i].y === projectile2.y) ||
                            (enemies[i].x === projectile3.x && enemies[i].y === projectile3.y)) && !hitting) {
                            Game.hitEnemy();
                        }
                        if ((enemies[i].x === pX) && (enemies[i].y === pY) && enemies[i].room == room) {
                            this.playerDamage(enemies[i].x, enemies[i].y);
                            break;
                        }
                    }
                    else if(enemies[i].type === SPAWNER_ENEMY){
                        spawner = true;
                        spawnRoom = enemies[i].room;
                        spawnX = enemies[i].x;
                        spawnY = enemies[i].y;
                    }
                    if(enemies[i].type === FINAL_BOSS_1 && (Math.abs(enemies[i].x-pX) < 4 && Math.abs(enemies[i].y-pY) < 4)){
                        enemies[i].invuln = false;
                        PS.borderColor(enemies[i].x, enemies[i].y, E_SHIELD_COLOR);
                    }
                    else if(enemies[i].type === FINAL_BOSS_1 ){
                        enemies[i].invuln = true;
                        PS.borderColor(enemies[i].x, enemies[i].y, FINAL_SHIELD);
                    }
                    if(enemies[i].type === FINAL_BOSS_2 && (Math.abs(enemies[i].x-pX) < 4 && Math.abs(enemies[i].y-pY) < 4)){
                        enemies[i].invuln = true;
                        PS.borderColor(enemies[i].x, enemies[i].y, FINAL_SHIELD);
                    }
                    else if(enemies[i].type === FINAL_BOSS_2 ){
                        enemies[i].invuln = false;
                        PS.borderColor(enemies[i].x, enemies[i].y, E_SHIELD_COLOR);
                    }
                    i += 1;  // increment i here
                }
                else if ( enemies[ i ].destroyed ) {
                    //this.createBlock(0, 0, enemies[i].x, enemies[i].y, 0xb19cd8);
                    if(enemies[i].type === SPAWNER_ENEMY){
                        spawner = false;
                        spawnerCount = 300;
                        PS.color(spawningX, spawningY, PS.data(spawningX, spawningY));
                    }
                    PS.border( enemies[ i ].x, enemies[ i ].y, 0);
                    PS.borderColor( enemies[ i ].x, enemies[ i ].y, PS.COLOR_BLACK);
                    enemies.splice( i, 1 );
                    length -= 1; // *BM* NOTE: i is NOT incremented! It now points to next entry due to splice.
                    break;
                }
            }
        },

        playerDamage(x, y){
            let i = 0;
            while (i < length) {
                if (enemies[i].x === pX && enemies[i].y === pY) {
                    break;
                }
                i += 1;
            }
            if(!takingDamage) {
                if (shieldStrength > 0 && enemies[i].type !== FINAL_BOSS_1 && enemies[i].type !== FINAL_BOSS_2 ) {
                    shieldStrength -= 1;
                    PS.audioPlay("PlayerShield", {path: "GameAudio/", volume: 0.25});
                    this.makeBlood(x, y, 190, 117, 202, 40);
                    this.alienSplatt();
                    let bloodSplat = {
                        x: x,
                        y: y,
                        room: room,
                        level: level,
                        alien: true
                    }
                    blood.push(bloodSplat);
                    PS.border(pX, pY, shieldStrength);
                    PS.color(pX, pY, PLAYER_COLOR);
                    enemies[i].destroyed = true;

                 //   enemies.splice(i,1);
                } else {
                    if(shieldStrength > 0 ){
                        PS.audioPlay("PlayerShield", {path: "GameAudio/", volume: 0.5});
                    }
                    Game.GameOver("Alien");
                    gameover = true;
                }
            }
        },

        reDrawEnemies() {
            length = enemies.length;
            for ( let i = 0; i < length; i += 1 ) {
                if(enemies[i].room == room && !enemies[i].destroyed) {
                    PS.color(enemies[i].x, enemies[i].y, enemies[i].type);
                    PS.border(enemies[i].x, enemies[i].y, enemies[i].shield);
                    PS.borderColor(enemies[i].x, enemies[i].y, E_SHIELD_COLOR);
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
                    invuln: false,
                    shield: 0
                };
                if( enemy.type == SHIELDED_ENEMY ){
                    enemy.shield = 3;
                }
                else if( enemy.type == SPAWNER_ENEMY ){
                    enemy.shield = 6;
                }
                else if( enemy.type == MEGA_ENEMY ){
                    enemy.shield = 9;
                }
                else if( enemy.type == FINAL_BOSS_1 || enemy.type == FINAL_BOSS_2){
                    enemy.shield = 12;
                    enemy.invuln = true;
                }
                enemies.push( enemy );
                if( room == enemy.room ) {
                    PS.color(x, y, enemy.type);
                    PS.border(enemy.x, enemy.y, enemy.shield);
                    PS.borderColor(enemy.x, enemy.y, E_SHIELD_COLOR);
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
                    else if( eastereggs[i].type == REGEN_COLOR && !eastereggs[i].triggered ){
                        //PS.debug("Filled Egg ");
                        this.alienSplatt();
                        this.makeBlood(eastereggs[i].x, eastereggs[i].y, 220, 20, 60, 10);
                        PS.audioPlay ( "Shield_Pickup", { volume: 0.1, path: "GameAudio/" });
                        PS.radius(eastereggs[i].x, eastereggs[i].y, 0);
                        shieldStrength += 1;
                        regen = true;
                        PS.color( pX, pY, PLAYER_COLOR );
                        PS.border(pX, pY, shieldStrength);
                        PS.borderColor(pX, pY, PLAYER_SHIELD_COLOR);
                        PS.bgColor( pX, pY, PS.data( pX, pY ) );
                        PS.radius( pX, pY, 50 );
                        eastereggs[i].triggered = true;
                        eastereggs[i].used = true;
                    }
                    else if( eastereggs[i].type == INVIS_COLOR){
                        invis = true;
                        PS.alpha(pX, pY, 100);
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
                    else if(eastereggs[i].type == REGEN_COLOR){
                        PS.radius(eastereggs[i].x, eastereggs[i].y, 50);
                        PS.color(eastereggs[i].x, eastereggs[i].y, eastereggs[i].type);
                        if(eastereggs[i].triggered){
                            this.makeBlood(blood[i].x, blood[i].y, 220, 20, 60, 10);
                            PS.radius(eastereggs[i].x, eastereggs[i].y, 0);
                            PS.glyph(eastereggs[i].x, eastereggs[i].y, "*");
                            PS.glphyColor(eastereggs[i].x, eastereggs[i].y, PS.COLOR_YELLOW);
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
                PS.radius(eastereggs[i].x, eastereggs[i].y, 0);
                PS.color(eastereggs[i].x, eastereggs[i].y, PS.data(eastereggs[i].x, eastereggs[i].y));
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
            PS.color( startX, startY, PORTAL_COLOR );
            PS.border( startX, startY, 5 );
            PS.radius( startX, startY, 50 );
            PS.borderColor( startX, startY, PORTAL_COLOR );
            PS.bgColor( startX, startY, PS.data( startX, startY ) );
            start = true;
        },

        makeColor( rVal, gVal, bVal, randomValue ) {
            var rValRandom = rVal - PS.random(randomValue);
            var gValRandom = gVal - PS.random(randomValue);
            var bValRandom = bVal - PS.random(randomValue);
            rgb = PS.makeRGB(rValRandom, gValRandom, bValRandom);
            return rgb;
        },

        makeFloor(rVal, gVal, bVal, randomValue, startX, startY, floorWidth, floorHeight ) {
            for ( yMarker = startY; yMarker < startY + floorHeight; yMarker++ ) {
                for ( xMarker = startX; xMarker < startX + floorWidth; xMarker ++ ) {
                    rgb = this.makeColor( rVal, gVal, bVal, randomValue );
                    this.createBlock( 0, 0, xMarker, yMarker, rgb );
                }
            }
        },

        makeBlood( x, y, rVal, gVal, bVal, randomValue ) {
            if (PS.data(x, y) !== LAVA_COLOR && PS.data(x, y) !== DOOR_COLOR) {
                rgb = this.makeColor(rVal, gVal, bVal, randomValue);
                this.createBlock(0, 0, x, y, rgb);
            }
            else if(PS.data( x, y) === LAVA_COLOR){
                this.createBlock(0, 0, x, y, LAVA_COLOR);
            }
        },
        makeBloodF( x, y, rVal, gVal, bVal, randomValue ) {
            rgb = this.makeColor(rVal, gVal, bVal, randomValue);
            this.createBlock(0, 0, x, y, rgb);
        },

        makePortalBorder(randomValue){
            //Portal Color
            var rValRandom = 255 - PS.random(randomValue);
            var gValRandom = 20 - PS.random(randomValue);
            var bValRandom = 141 - PS.random(randomValue);

          /*  //Burgundy
            var rValRandom = 128 - PS.random(randomValue);
            var gValRandom = 0 + PS.random(randomValue);
            var bValRandom = 22 - PS.random(randomValue);*/

            rgb = PS.makeRGB(rValRandom, gValRandom, bValRandom);
            if(room == portalRoom){
                PS.border(portalX, portalY, PS.random(10));
                PS.borderColor(portalX, portalY, rgb);
            }
            //Some Kind of Purple
            rValRandom = 200 - PS.random(randomValue);
            gValRandom = 20 - PS.random(randomValue);
            bValRandom = 160 - PS.random(randomValue);
            rgb = PS.makeRGB(rValRandom, gValRandom, bValRandom);
            if(room == portalRoom){
                PS.glyph(portalX, portalY, "҉");
                PS.glyphColor(portalX, portalY, rgb);
            }



        },

        changeRooms(x, y){
            if(level <= 8 || level === 13){
                if(room == 0){
                    room = 1;
                }
                else if(room == 1){
                    room = 0
                }
                usedDoor = true;
            }
            else if( level == 9){
                if(room == 0){
                    room = 1;
                    usedDoor = false;
                }
                else if(room == 1){
                    if(x == 0){
                        room = 0;
                        usedDoor = true;
                    }
                    else if(x == 14){
                        room = 2;
                        usedDoor = false;
                    }
                }
                else if(room == 2){
                    room = 1;
                    usedDoor = true;
                }
            }
            else if(level == 11){
                //PS.debug("changing rooms")
                if(room == 0){
                    if(x == 0 && y == 7){
                        //PS.debug("Room 1");
                        room = 1;
                        usedDoor = true;
                        usedDoor4 = false;
                        usedDoor2 = false;
                        usedDoor3 = false;
                    }
                    else if(x == 14 && y == 7){
                       // PS.debug("Room 3");
                        room = 3;
                        usedDoor3 = true;
                        usedDoor = false;
                        usedDoor2 = false;
                        usedDoor4 = false;
                    }
                    else if(x == 7 && y == 0){
                        //PS.debug("Room 2");
                        room = 2;
                        usedDoor2 = true;
                        usedDoor = false;
                        usedDoor4 = false;
                        usedDoor3 = false;
                    }
                    else if(x == 7 && y == 14){
                      //  PS.debug("Room 4");
                        room = 4;
                        usedDoor4 = true;
                        usedDoor = false;
                        usedDoor2 = false;
                        usedDoor3 = false;
                    }
                }

                else{
                    room = 0;
                }
            }
         //   PS.debug(room);
            Game.startScreen();
        },

        shootAudio() {
            PS.audioPlay( "Laser_Shoot", { volume: 0.15, path: "GameAudio/" });

        },

        alienAudio(){
            var randomAlien = PS.random(10);
            if ( randomAlien == 1 ) {
                PS.audioPlay ( "Alien1", { volume: 0.25, path: "GameAudio/" });
            }
            else if ( randomAlien == 2 ) {
                PS.audioPlay ( "Alien2", { volume: 0.25, path: "GameAudio/" });
            }
            else if ( randomAlien == 3 ) {
                PS.audioPlay ( "Alien3", { volume: 0.25, path: "GameAudio/" });
            }
            else if ( randomAlien == 4 ) {
                PS.audioPlay ( "Alien4", { volume: 0.25, path: "GameAudio/" });
            }
            else if ( randomAlien == 5 ) {
                PS.audioPlay ( "Alien5", { volume: 0.25, path: "GameAudio/" });
            }
            else if ( randomAlien == 6 ) {
                PS.audioPlay ( "Alien6", { volume: 0.25, path: "GameAudio/" });
            }
            else if ( randomAlien == 7 ) {
                PS.audioPlay ( "Alien7", { volume: 0.25, path: "GameAudio/" });
            }
            else if ( randomAlien == 8 ) {
                PS.audioPlay ( "Alien8", { volume: 0.25, path: "GameAudio/" });
            }
            else if ( randomAlien == 9 ) {
                PS.audioPlay ( "Alien9", { volume: 0.25, path: "GameAudio/" });
            }
            else if ( randomAlien == 10 ) {
                PS.audioPlay ( "Alien10", { volume: 0.25, path: "GameAudio/" });
            }
        },

        alienDeath(){
            var randomAlien = PS.random(5);
            if ( randomAlien == 1 ) {
                PS.audioPlay ( "AlienDeath1", { volume: 0.25, path: "GameAudio/" });
            }
            else if ( randomAlien == 2 ) {
                PS.audioPlay ( "AlienDeath2", { volume: 0.25, path: "GameAudio/" });
            }
            else if ( randomAlien == 3 ) {
                PS.audioPlay ( "AlienDeath3", { volume: 0.25, path: "GameAudio/" });
            }
            else if ( randomAlien == 4 ) {
                PS.audioPlay ( "AlienDeath4", { volume: 0.25, path: "GameAudio/" });
            }
            else if ( randomAlien == 5 ) {
                PS.audioPlay ( "AlienDeath5", { volume: 0.25, path: "GameAudio/" });
            }
        },

        alienVictory() {
            var randomAlien = PS.random(3);
            if (randomAlien == 1) {
                PS.audioPlay("AlienVictory1", {volume: 0.25, path: "GameAudio/", onEnd: this.transform()});
            } else if (randomAlien == 2) {
                PS.audioPlay("AlienVictory2", {volume: 0.25, path: "GameAudio/", onEnd: this.transform()});
            } else if (randomAlien == 3) {
                PS.audioPlay("AlienVictory3", {volume: 0.25, path: "GameAudio/", onEnd: this.transform()});
            }
        },

        transform(){
            PS.audioPlay ( "Transform", { path: "GameAudio/", volume: 0.5 });
        },

        alienSplatt() {
            var randomAlien = PS.random(3);
            if (randomAlien == 1) {
                PS.audioPlay("AlienSplatt", {volume: 0.15, path: "GameAudio/"});
            } else if (randomAlien == 2) {
                PS.audioPlay("AlienSplatt2", {volume: 0.15, path: "GameAudio/"});
            } else if (randomAlien == 3) {
                PS.audioPlay("AlienSplatt3", {volume: 0.15, path: "GameAudio/"});
            }
        },

        lavaSizzle() {
            var randomLava = PS.random(3);
            if (randomLava == 1) {
                PS.audioPlay("Lava1", {volume: 0.25, path: "GameAudio/"});
            } else if (randomLava == 2) {
                PS.audioPlay("Lava2", {volume: 0.25, path: "GameAudio/"});
            } else if (randomLava == 3) {
                PS.audioPlay("Lava3", {volume: 0.25, path: "GameAudio/"});
            }
        },

        makeLevel() {
            finalLevel = false;
            if ( !timer ) {
                timer = PS.timerStart( 1, tick );
            }
           /* if (level > 12){
                PS.gridSize( WIDTH, HEIGHT );
                this.createBlock(WIDTH-1, HEIGHT-1, 0,0, PS.COLOR_GREEN);
                PS.border( PS.ALL, PS.ALL, 0 );
                start = true;
                PS.audioPlay ( "Victory", { path: "GameAudio/", volume: 0.25 });
            }*/
            if( level == 1) {
                PS.gridSize( WIDTH, HEIGHT );
                PS.bgAlpha( PS.ALL, PS.ALL, 255 );
                PS.border( PS.ALL, PS.ALL, 0 );
                startX = 7;
                startY = 11;
                portalX = startX;
                portalY = startY;
                portalRoom = 0;
               // PS.fade(PS.ALL, PS.ALL, 10);
                if(enemies.length == 0 && !portalOpened){
                    this.makeEnemy(7, 3, DEFAULT_ENEMY, 0);
                }
                if(eastereggs.length == 0){
                    this.makeEasterEgg(6, 8, REGEN_COLOR, 1);
                }

                this.makeFloor( 180, 198, 205, 20, 0, 0, WIDTH, HEIGHT );
                if(room === 0) {
                    if (usedDoor) {
                        startX = 7;
                        startY = 14;
                    } else {
                        startX = 7;
                        startY = 11;
                    }


                    //Inner Walls
                    this.createBlock(6, 0, 4, 7, PS.COLOR_BLACK);

                    //Outer Walls
                    this.createBlock(14, 0, 0, 0, PS.COLOR_BLACK);
                    this.createBlock(14, 0, 0, 14, PS.COLOR_BLACK);
                    this.createBlock(0, 14, 0, 0, PS.COLOR_BLACK);
                    this.createBlock(0, 14, 14, 0, PS.COLOR_BLACK);

                    this.createBlock(0, 0, 7, 14, HIDDEN_DOOR_COLOR);
                }
                else if( room === 1 ){
                    startX = 7;
                    startY = 0;
                    this.createBlock(WIDTH-1,HEIGHT-1, 0, 0, PS.COLOR_BLACK);
                    this.makeFloor(169,169,169,20,5,5,3,5);
                    this.makeFloor(169,169,169,20,7,1,1,4);
                    this.createBlock(0, 0, 7, 0, DOOR_COLOR);
                }

            }
            if( level == 2){
                room = 0;
                PS.gridSize( WIDTH, HEIGHT );
                PS.bgAlpha( PS.ALL, PS.ALL, 255 );
                PS.border( PS.ALL, PS.ALL, 0 );
                startX = 7;
                startY = 7;
                portalX = startX;
                portalY = startY;
                portalRoom = 0;
               // PS.fade(PS.ALL, PS.ALL, 10);
                this.makeFloor( 157, 160, 180, 20, 0, 0, WIDTH, HEIGHT );
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
                portalX = startX;
                portalY = startY;
                portalRoom = 0;
               // PS.fade(PS.ALL, PS.ALL, 10);
                this.makeFloor( 157, 160, 180, 20, 0, 0, WIDTH, HEIGHT );
                this.makeFloor( 143, 140, 160, 20, 4, 4, 7, 7 );
                this.makeFloor( 143, 140, 160, 20, 3, 5, 9, 5 );
                this.makeFloor( 143, 140, 160, 20, 5, 3, 5, 9 );
                this.makeFloor( 135, 130, 154, 20, 5, 3, 5, 9 );
                this.makeFloor( 127, 120, 149, 20, 6, 6, 3, 3 );
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
            //has rooms
            if( level == 4){
                PS.gridSize( WIDTH, HEIGHT );
                PS.bgAlpha( PS.ALL, PS.ALL, 255 );
                PS.border( PS.ALL, PS.ALL, 0 );
                // (PS.ALL, PS.ALL, 10);
                this.makeFloor( 185, 185, 185, 20, 0, 0, WIDTH, HEIGHT );
                const xFloorValues = [ 2, 3, 5, 6, 8, 9, 11, 12 ];
                const yFloorValues = [ 2, 3, 5, 6, 8, 9, 11, 12 ];
                var i;
                for ( yMarker = 0; yMarker < HEIGHT; yMarker++ ) {
                    for (xMarker = 0; xMarker < WIDTH; xMarker++) {
                        for (i = 0; i < 14; i++) {
                            if ( xMarker == xFloorValues[i] ) {
                                rgb = this.makeColor(155, 155, 155, 20);
                                this.createBlock(0, 0, xMarker, yMarker, rgb);
                            }
                            if ( yMarker == yFloorValues[i] ) {
                                rgb = this.makeColor(155, 155, 155, 20);
                                this.createBlock(0, 0, xMarker, yMarker, rgb);
                            }
                        }
                    }
                }
                if(enemies.length == 0 && !portalOpened){
                    this.makeEnemy( 11, 2, SHIELDED_ENEMY, 0 );
                    this.makeEnemy( 12, 11, DEFAULT_ENEMY, 0 );
                    this.makeEnemy( 8, 3, SHIELDED_ENEMY, 1 );
                    this.makeEnemy( 12, 8, DEFAULT_ENEMY, 1 );
                    this.makeEnemy( 10, 12, DEFAULT_ENEMY, 1 );
                }
                if(eastereggs.length == 0){
                    this.makeEasterEgg(13, 1, SHIELD_COLOR, 1);
                }
                portalX = 2;
                portalY = 3;
                portalRoom = 1;
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
                    this.createBlock( 0, 1, 10, 1, PS.COLOR_BLACK );
                    this.createBlock( 0, 1, 10, 4, PS.COLOR_BLACK );
                    // this.createBlock( 0, 0, 10, 3, PS.COLOR_GRAY_LIGHT );

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
            //has rooms
            if( level == 5 ) {
                PS.gridSize( WIDTH, HEIGHT );
                PS.bgAlpha( PS.ALL, PS.ALL, 255 );
                PS.border( PS.ALL, PS.ALL, 0 );
             //   PS.fade(PS.ALL, PS.ALL, 10);
                this.makeFloor( 150, 150, 150, 25, 0, 0, WIDTH, HEIGHT );
                for ( yMarker = 2; yMarker < 13; yMarker++ ) {
                    for ( xMarker = 2; xMarker < 13; xMarker ++ ) {
                        if ( xMarker % 2 == 0 && yMarker % 2 == 0 ) {
                            rgb = this.makeColor(80, 80, 80, 15 );
                            this.createBlock(0, 0, xMarker, yMarker, rgb);
                        }
                        if ( xMarker % 2 !== 0 && yMarker % 2 !== 0 ) {
                            rgb = this.makeColor(80, 80, 80, 15 );
                            this.createBlock(0, 0, xMarker, yMarker, rgb);
                        }
                    }
                }
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
                portalX = 7;
                portalY = 7;
                portalRoom = 0;
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
                    PS.border( 7, 4, 1 );
                    PS.borderColor( 7, 4, PS.COLOR_WHITE );
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
                portalX = 7;
                portalY = 13;
                portalRoom = 0;
             //   PS.fade(PS.ALL, PS.ALL, 10);
                this.makeFloor( 100, 100, 100, 20, 0, 0, WIDTH, HEIGHT );
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
            if ( level == 7 ) {
                room = 0;
                PS.gridSize( WIDTH, HEIGHT );
                PS.bgAlpha( PS.ALL, PS.ALL, 255 );
                PS.border( PS.ALL, PS.ALL, 0 );
                startX = 7;
                startY = 12;
                portalX = startX;
                portalY = 7;
                portalRoom = 0;
             //   PS.fade(PS.ALL, PS.ALL, 5);
                this.makeFloor( 216, 176, 98, 20, 0, 0, WIDTH, HEIGHT );
                this.makeFloor ( 216, 161, 98, 20, 5, 2, 4, 5 );
                this.makeFloor ( 216, 161, 98, 20, 2, 7, 4, 5 );
                this.makeFloor ( 216, 161, 98, 20, 9, 5, 4, 5 );
                this.makeFloor ( 216, 161, 98, 20, 4, 3, 5, 4 );
                this.makeFloor ( 216, 161, 98, 20, 1, 8, 5, 4 );
                this.makeFloor ( 216, 161, 98, 20, 8, 6, 5, 4 );
                this.makeFloor ( 216, 146, 98, 20, 5, 3, 4, 3 );
                this.makeFloor ( 216, 146, 98, 20, 2, 8, 4, 3 );
                this.makeFloor ( 216, 146, 98, 20, 9, 6, 4, 3 );
                //Enemies
                this.makeEnemy( 2, 4, DEFAULT_ENEMY, 0 );
                this.makeEnemy( 9, 2, SHIELDED_ENEMY, 0 );
                this.makeEnemy( 12, 5, DEFAULT_ENEMY, 0);

                //Inner Walls
                this.createBlock( 1, 0, 6, 4, LAVA_COLOR );
                this.createBlock( 1, 0, 3, 9, LAVA_COLOR );
                this.createBlock( 1, 0, 10, 7, LAVA_COLOR );

                //Outer Walls
                this.createBlock( 14, 0, 0, 0, PS.COLOR_BLACK );
                this.createBlock( 14, 0, 0, 14, PS.COLOR_BLACK );
                this.createBlock( 0, 14, 0, 0, PS.COLOR_BLACK );
                this.createBlock( 0, 14, 14, 0, PS.COLOR_BLACK );
            }
            //has rooms
            if( level == 8 ) {
                PS.gridSize( WIDTH, HEIGHT );
                PS.bgAlpha( PS.ALL, PS.ALL, 255 );
                PS.border( PS.ALL, PS.ALL, 0 );
                this.makeFloor ( 216, 176, 98, 20, 0, 0, WIDTH, HEIGHT );
                this.makeFloor ( 216, 161, 98, 20, 2, 10, 6, 3 );
                this.makeFloor ( 216, 161, 98, 20, 3, 9, 4, 5 );
                this.makeFloor ( 216, 146, 98, 20, 3, 10, 3, 2 );
                this.makeFloor ( 216, 161, 98, 20, 7, 2, 6, 3 );
                this.makeFloor ( 216, 161, 98, 20, 8, 1, 4, 5 );
                this.makeFloor ( 216, 146, 98, 20, 8, 2, 3, 2 );
                this.makeFloor ( 216, 161, 98, 20, 1, 3, 5, 4 );
                this.makeFloor ( 216, 161, 98, 20, 2, 2, 3, 6 );
                this.makeFloor ( 216, 146, 98, 20, 2, 3, 2, 3 );
                this.makeFloor ( 216, 161, 98, 20, 9, 8, 5, 4 );
                this.makeFloor ( 216, 161, 98, 20, 10, 7, 3, 6 );
                this.makeFloor ( 216, 146, 98, 20, 10, 8, 2, 3 );
                if(enemies.length == 0 && !portalOpened){
                    this.makeEnemy( 12, 5, SHIELDED_ENEMY, 0 );
                    this.makeEnemy( 2, 9, SHIELDED_ENEMY, 0 );
                    this.makeEnemy( 3, 11, DEFAULT_ENEMY, 1 );
                    this.makeEnemy( 7, 11, MEGA_ENEMY, 1 );
                    this.makeEnemy( 11, 11, DEFAULT_ENEMY, 1 );
                }
                portalX = 7;
                portalY = 7;
                portalRoom = 0;
                if(room == 0){
                    if(usedDoor){
                        startX = 7;
                        startY = 14;
                    }
                    else {
                        startX = 7;
                        startY = 7;
                    }

                    //Inner Walls
                    this.createBlock( 1, 0, 9, 3, LAVA_COLOR );
                    this.createBlock( 1, 0, 4, 11, LAVA_COLOR );
                    this.createBlock( 0, 1, 3, 4, LAVA_COLOR );
                    this.createBlock( 0, 1, 11, 9, LAVA_COLOR );

                    //Outer Walls
                    this.createBlock( 14, 0, 0, 0, PS.COLOR_BLACK );
                    this.createBlock( 14, 0, 0, 14, PS.COLOR_BLACK );
                    this.createBlock( 0, 14, 0, 0, PS.COLOR_BLACK );
                    this.createBlock( 0, 14, 14, 0, PS.COLOR_BLACK );

                    this.createBlock( 0, 1, 0, 0, LAVA_COLOR );
                    this.createBlock( 0, 1, 14, 0, LAVA_COLOR );
                    this.createBlock( 0, 1, 0, 13, LAVA_COLOR );
                    this.createBlock( 0, 1, 14, 13, LAVA_COLOR );
                    this.createBlock( 1, 0, 0, 0, LAVA_COLOR );
                    this.createBlock( 1, 0, 13, 0, LAVA_COLOR );
                    this.createBlock( 1, 0, 0, 14, LAVA_COLOR );
                    this.createBlock( 1, 0, 13, 14, LAVA_COLOR );

                    //Door
                    this.createBlock(0, 0, 7, 14, DOOR_COLOR);
                }

                else if(room == 1){
                    startX = 7;
                    startY = 0;

                    //Inner Walls
                    this.createBlock( 2, 2, 6, 6, PS.COLOR_BLACK );

                    //Outer Walls
                    this.createBlock( 14, 0, 0, 0, LAVA_COLOR );
                    this.createBlock( 14, 0, 0, 14, LAVA_COLOR );
                    this.createBlock( 0, 14, 0, 0, LAVA_COLOR );
                    this.createBlock( 0, 14, 14, 0, LAVA_COLOR );

                    //Door
                    this.createBlock(0, 0, 7, 0, DOOR_COLOR);
                }
            }
            //hass rooms
            if( level == 9 ) {
                PS.gridSize( WIDTH, HEIGHT );
                PS.bgAlpha( PS.ALL, PS.ALL, 255 );
                PS.border( PS.ALL, PS.ALL, 0 );
                if(trigun){
                    this.makeFloor( 145, 23, 23, 30, 0, 0, WIDTH, HEIGHT );
                }
                else{
                    this.makeFloor( 204, 140, 72, 20, 0, 0, WIDTH, HEIGHT );
                }

                if(enemies.length == 0 && !portalOpened) {
                    this.makeEnemy( 12, 2, DEFAULT_ENEMY, 0 );
                    this.makeEnemy( 12, 7, SHIELDED_ENEMY, 1 );
                    this.makeEnemy( 8, 3, SHIELDED_ENEMY, 1 );
                    this.makeEnemy( 8, 11, SHIELDED_ENEMY, 1 );
                    this.makeEnemy( 13, 2, DEFAULT_ENEMY, 2 );
                    this.makeEnemy( 13, 4, DEFAULT_ENEMY, 2 );
                    this.makeEnemy( 13, 6, DEFAULT_ENEMY, 2 );
                    this.makeEnemy( 13, 8, DEFAULT_ENEMY, 2 );
                    this.makeEnemy( 13, 10, DEFAULT_ENEMY, 2 );
                    this.makeEnemy( 13, 12, DEFAULT_ENEMY, 2 );
                }
                if(eastereggs.length == 0) {
                    //this.makeEasterEgg(7, 7, TRIGUN_COLOR, 0);
                }
                portalX = 7;
                portalY = 7;
                portalRoom = 2;
                if(room == 0) {
                    if (usedDoor) {
                        startX = 14;
                        startY = 7;
                    } else {
                        startX = 2
                        startY = 12;
                    }

                    //Trigun Altar
                    this.createBlock( 0, 0, 7, 7, ALTAR_COLOR_1 );
                    this.createBlock( 0, 0, 6, 7, ALTAR_COLOR_2 );
                    this.createBlock( 0, 0, 7, 8, ALTAR_COLOR_2 );
                    this.createBlock( 0, 0, 8, 6, ALTAR_COLOR_2 );
                    this.createBlock( 0, 0, 6, 6, ALTAR_COLOR_3 );
                    this.createBlock( 0, 0, 8, 8, ALTAR_COLOR_3 );
                    this.createBlock( 0, 0, 6, 9, ALTAR_COLOR_4 );
                    this.createBlock( 0, 0, 5, 7, ALTAR_COLOR_4 );
                    this.createBlock( 0, 0, 7, 5, ALTAR_COLOR_4 );

                    //Outer Walls
                    this.createBlock( 14, 0, 0, 0, PS.COLOR_BLACK );
                    this.createBlock( 14, 0, 0, 14, PS.COLOR_BLACK );
                    this.createBlock( 0, 14, 0, 0, PS.COLOR_BLACK );
                    this.createBlock( 0, 14, 14, 0, PS.COLOR_BLACK );

                    //Door
                    this.createBlock(0, 0, 14, 7, DOOR_COLOR);
                }
                else if(room == 1) {
                    if (usedDoor) {
                        startX = 14;
                        startY = 7;
                    } else {
                        startX = 0;
                        startY = 7;
                    }

                    //Inner Walls
                    this.createBlock( 1, 1, 4, 4, PS.COLOR_BLACK);
                    this.createBlock( 1, 1, 4, 10, PS.COLOR_BLACK);

                    //Outer Walls
                    this.createBlock(14, 0, 0, 0, PS.COLOR_BLACK);
                    this.createBlock(14, 0, 0, 14, PS.COLOR_BLACK);
                    this.createBlock(0, 14, 0, 0, PS.COLOR_BLACK);
                    this.createBlock(0, 14, 14, 0, PS.COLOR_BLACK);

                    //Door
                    this.createBlock(0, 0, 0, 7, DOOR_COLOR);
                    this.createBlock( 0, 0, 14, 7, DOOR_COLOR );
                }
                else if (room == 2) {
                    startX = 0;
                    startY = 7;

                    //make floor red if trigun powerup is active

                    //Inner Walls
                    this.createBlock( 0, 2, 10, 1, PS.COLOR_BLACK );
                    this.createBlock( 0, 2, 10, 11, PS.COLOR_BLACK );
                    this.createBlock( 0, 2, 4, 6, PS.COLOR_BLACK );

                    //Outer Walls
                    this.createBlock(14, 0, 0, 0, PS.COLOR_BLACK);
                    this.createBlock(14, 0, 0, 14, PS.COLOR_BLACK);
                    this.createBlock(0, 14, 0, 0, PS.COLOR_BLACK);
                    this.createBlock(0, 14, 14, 0, PS.COLOR_BLACK);

                    //Door
                    this.createBlock( 0, 0, 0, 7, DOOR_COLOR );
                }
            }
            if (level == 10 ) {
                room = 0;
                PS.gridSize( WIDTH, HEIGHT );
                PS.bgAlpha( PS.ALL, PS.ALL, 255 );
                PS.border( PS.ALL, PS.ALL, 0 );
                startX = 3;
                startY = 3;
                portalX = startX;
                portalY = startY;
                portalRoom = 0;
               // PS.fade(PS.ALL, PS.ALL, 10);
                this.makeFloor( 200, 105, 68, 20, 0, 0, WIDTH, HEIGHT );
                //Enemies
                this.makeEnemy( 1, 13, LAVA_ENEMY, 0 );
                this.makeEnemy( 13, 1, LAVA_ENEMY, 0 );
                this.makeEnemy( 13, 13, LAVA_ENEMY, 0 );

                //Inner Walls
                this.createBlock( 2, 0, 6, 7, LAVA_COLOR );
                this.createBlock( 0, 2, 7, 6, LAVA_COLOR );
                this.createBlock( 0, 2, 11, 1, LAVA_COLOR );
                this.createBlock( 0, 2, 11, 11, LAVA_COLOR );
                this.createBlock( 0, 2, 3, 11, LAVA_COLOR );
                this.createBlock( 2, 0, 11, 3, LAVA_COLOR );
                this.createBlock( 2, 0, 11, 11, LAVA_COLOR );
                this.createBlock( 2, 0, 1, 11, LAVA_COLOR );

                //Outer Walls
                this.createBlock( 14, 0, 0, 0, PS.COLOR_BLACK );
                this.createBlock( 14, 0, 0, 14, PS.COLOR_BLACK );
                this.createBlock( 0, 14, 0, 0, PS.COLOR_BLACK );
                this.createBlock( 0, 14, 14, 0, PS.COLOR_BLACK );
                this.createBlock( 3, 0, 0, 0, LAVA_COLOR );
                this.createBlock( 0, 3, 0, 0, LAVA_COLOR );
            }
            //Has multiple rooms
            if( level == 11 ) {
                PS.gridSize(WIDTH, HEIGHT);
                PS.bgAlpha(PS.ALL, PS.ALL, 255);
                PS.border(PS.ALL, PS.ALL, 0);
                this.makeFloor(147, 72, 56, 20, 0, 0, WIDTH, HEIGHT);
                if (enemies.length == 0 && !portalOpened) {

                    this.makeEnemy( 3, 3, LAVA_ENEMY, 1 );
                    this.makeEnemy( 3, 11, SHIELDED_ENEMY, 1 );

                    this.makeEnemy( 7, 3, LAVA_ENEMY, 2 );

                    this.makeEnemy( 7, 3, LAVA_ENEMY, 3 );
                    this.makeEnemy( 7, 11, LAVA_ENEMY, 3 );
                    this.makeEnemy( 11, 7, SHIELDED_ENEMY, 3 );
                }
                if (eastereggs.length == 0) {
                    this.makeEasterEgg(6, 8, SHIELD_COLOR, 4);
                }
                portalX = 7;
                portalY = 7;
                portalRoom = 0;
                //PS.debug(room);
                if (room === 0) {
                    if(usedDoor){
                        startX = 0;
                        startY = 7;
                    }
                    else if (usedDoor2){
                        startX = 7;
                        startY = 0;
                    }
                    else if (usedDoor3){
                        startX = 14;
                        startY = 7;
                    }
                    else if (usedDoor4){
                        startX = 7;
                        startY = 14;
                    }
                    else{
                        startX = 7
                        startY = 7;
                    }
                    this.makeFloor(147, 72, 56, 20, 0, 0, WIDTH, HEIGHT);


                    //Outer Walls
                    this.createBlock(14, 0, 0, 0, LAVA_COLOR);
                    this.createBlock(0, 14, 14, 0, LAVA_COLOR);
                    this.createBlock(0, 14, 0, 0, LAVA_COLOR);

                    this.createBlock(14, 0, 0, 1, LAVA_COLOR);
                    this.createBlock(14, 0, 0, 13, LAVA_COLOR);
                    this.createBlock(0, 14, 1, 0, LAVA_COLOR);
                    this.createBlock(0, 14, 13, 0, LAVA_COLOR);

                    this.createBlock(14, 0, 0, 14, PS.COLOR_BLACK);
                    this.createBlock(5, 0, 0, 14, LAVA_COLOR);
                    this.createBlock(5, 0, 9, 14, LAVA_COLOR);

                    //Inner Walls and Lava
                    this.makeFloor(147, 72, 56, 20, 7, 1, 1, 1);
                    this.makeFloor(147, 72, 56, 20, 7, 13, 1, 1);
                    this.makeFloor(147, 72, 56, 20, 1, 7, 1, 1);
                    this.makeFloor(147, 72, 56, 20, 13, 7, 1, 1);
                    this.createBlock(0, 0, 2, 2, LAVA_COLOR);
                    this.createBlock(0, 0, 2, 12, LAVA_COLOR);
                    this.createBlock(0, 0, 12, 2, LAVA_COLOR);
                    this.createBlock(0, 0, 12, 12, LAVA_COLOR);

                    //Door
                    this.createBlock(0, 0, 0, 7, DOOR_COLOR);
                    this.createBlock(0, 0, 14, 7, DOOR_COLOR);
                    this.createBlock(0, 0, 7, 0, DOOR_COLOR);
                    this.createBlock(0, 0, 7, 14, DOOR_COLOR);

                }
                else if (room === 1) {
                    startX = 14;
                    startY = 7;

                    //Inner Walls
                    this.createBlock( 0, 1, 4, 7, LAVA_COLOR);
                    this.createBlock( 0, 0, 8, 10, LAVA_COLOR );
                    this.createBlock( 0, 1, 10, 6, LAVA_COLOR );
                    this.createBlock( 1, 0, 7, 4, LAVA_COLOR );

                    //Outer Walls
                    this.createBlock( 14, 0, 0, 0, LAVA_COLOR );
                    this.createBlock( 14, 0, 0, 14, LAVA_COLOR );
                    this.createBlock( 0, 14, 0, 0, LAVA_COLOR );
                    this.createBlock( 0, 14, 14, 0, LAVA_COLOR );

                    //Door
                    this.createBlock(0, 0, 14, 7, DOOR_COLOR)

                }
                else if (room === 2) {
                    startX = 7;
                    startY = 14;

                    //Inner Walls
                    this.createBlock( 6, 0, 4, 7, LAVA_COLOR );

                    //Outer Walls
                    this.createBlock( 14, 0, 0, 0, LAVA_COLOR );
                    this.createBlock( 14, 0, 0, 14, LAVA_COLOR );
                    this.createBlock( 0, 14, 0, 0, LAVA_COLOR );
                    this.createBlock( 0, 14, 14, 0, LAVA_COLOR );

                    //Door
                    this.createBlock(0, 0, 7, 14, DOOR_COLOR);
                }
                else if (room === 3) {
                    startX = 0;
                    startY = 7;
                    this.makeFloor(147, 72, 56, 20, 0, 0, WIDTH, HEIGHT);
                    this.makeFloor( 133, 62, 36, 20, 4, 4, 7, 7 );
                    this.makeFloor( 133, 62, 36, 20, 3, 5, 9, 5 );
                    this.makeFloor( 133, 62, 36, 20, 5, 3, 5, 9 );
                    this.makeFloor( 125, 52, 30, 20, 5, 3, 5, 9 );
                    this.makeFloor( 119, 42, 25, 20, 6, 6, 3, 3 );

                    //Inner Walls
                    this.createBlock( 3, 0, 1, 1, LAVA_COLOR );
                    this.createBlock( 0, 3, 1, 1, LAVA_COLOR );
                    this.createBlock( 0, 3, 1, 10, LAVA_COLOR );
                    this.createBlock( 3, 0, 1, 13, LAVA_COLOR );
                    this.createBlock( 3, 0, 10, 1, LAVA_COLOR );
                    this.createBlock( 0, 3, 13, 1, LAVA_COLOR );
                    this.createBlock( 0, 3, 13, 10, LAVA_COLOR );
                    this.createBlock( 3, 0, 10, 13, LAVA_COLOR );
                    this.createBlock( 0, 0, 2, 2, LAVA_COLOR );
                    this.createBlock( 0, 0, 12, 2, LAVA_COLOR );
                    this.createBlock( 0, 0, 2, 12, LAVA_COLOR );
                    this.createBlock( 0, 0, 12, 12, LAVA_COLOR );
                    this.createBlock( 4, 0, 5, 5, LAVA_COLOR );
                    this.createBlock( 4, 0, 5, 9, LAVA_COLOR );
                    this.createBlock( 0, 4, 9, 5, LAVA_COLOR );

                    //Outer Walls
                    this.createBlock( 14, 0, 0, 0, LAVA_COLOR );
                    this.createBlock( 14, 0, 0, 14, LAVA_COLOR );
                    this.createBlock( 0, 14, 0, 0, LAVA_COLOR );
                    this.createBlock( 0, 14, 14, 0, LAVA_COLOR );

                    //Door
                    this.createBlock(0, 0, 0, 7, DOOR_COLOR);

                }
                else if (room === 4) {
                    startX = 7;
                    startY = 0;
                    this.createBlock(WIDTH-1,HEIGHT-1, 0, 0, PS.COLOR_BLACK);
                    this.makeFloor(169,169,169,20,5,5,3,5);
                    this.makeFloor(169,169,169,20,7,1,1,4);
                    this.createBlock(0, 0, 7, 0, DOOR_COLOR);


                }
            }
            if( level == 12 ) {
                room = 0;
                PS.gridSize( WIDTH, HEIGHT );
                PS.bgAlpha( PS.ALL, PS.ALL, 255 );
                PS.border( PS.ALL, PS.ALL, 0 );
                startX = 1;
                startY = 1;
                portalX = 13;
                portalY = 9;
                portalRoom = 0;
              //  PS.fade(PS.ALL, PS.ALL, 10);
                this.makeFloor( 200, 105, 68, 20, 0, 0, WIDTH, HEIGHT );
                //Enemies
                this.makeEnemy( 13, 13, LAVA_ENEMY, 0 );
                this.makeEnemy( 5, 9, DEFAULT_ENEMY, 0 );
                this.makeEnemy( 9, 11, DEFAULT_ENEMY, 0 );

                //Inner Walls
                this.createBlock ( 0, 5, 2, 1, LAVA_COLOR );
                this.createBlock ( 0, 2, 2, 8, LAVA_COLOR );
                this.createBlock ( 0, 0, 1, 10, LAVA_COLOR );
                this.createBlock ( 2, 0, 2, 8, LAVA_COLOR );
                this.createBlock ( 0, 5, 4, 2, LAVA_COLOR );
                this.createBlock ( 4, 0, 4, 2, LAVA_COLOR );
                this.createBlock ( 7, 0, 6, 4, LAVA_COLOR );
                this.createBlock ( 0, 1, 12, 1, LAVA_COLOR );
                this.createBlock ( 0, 1, 10, 2, LAVA_COLOR );
                this.createBlock ( 0, 4, 6, 4, LAVA_COLOR );
                this.createBlock ( 4, 0, 8, 6, LAVA_COLOR );
                this.createBlock ( 0, 6, 10, 6, LAVA_COLOR );
                this.createBlock ( 2, 0, 6, 8, LAVA_COLOR );
                this.createBlock ( 0, 4, 8, 8, LAVA_COLOR );
                this.createBlock ( 0, 0, 9, 12, LAVA_COLOR );
                this.createBlock ( 0, 4, 12, 8, LAVA_COLOR );
                this.createBlock ( 0, 0, 13, 8, LAVA_COLOR );
                this.createBlock ( 3, 0, 4, 10, LAVA_COLOR );
                this.createBlock ( 0, 2, 4, 10, LAVA_COLOR );
                this.createBlock ( 2, 0, 2, 12, LAVA_COLOR );
                this.createBlock ( 0, 1, 6, 12, LAVA_COLOR );

                //Outer Walls
                this.createBlock( 14, 0, 0, 0, LAVA_COLOR );
                this.createBlock( 14, 0, 0, 14, LAVA_COLOR );
                this.createBlock( 0, 14, 0, 0, LAVA_COLOR );
                this.createBlock( 0, 14, 14, 0, LAVA_COLOR );

            }
            if ( level == 13 ) {
                PS.gridSize( WIDTH, HEIGHT );
                PS.bgAlpha( PS.ALL, PS.ALL, 255 );
                PS.border( PS.ALL, PS.ALL, 0 );
                this.makeFloor( 105, 69, 28, 20, 0, 0, WIDTH, HEIGHT );
                if(enemies.length == 0 && !portalOpened){
                    this.makeEnemy( 11, 3, MEGA_ENEMY, 0 );
                    this.makeEnemy( 12, 9, SHIELDED_ENEMY, 0 );
                    this.makeEnemy( 7, 1, LAVA_ENEMY, 0 );
                    this.makeEnemy( 10, 12, LAVA_ENEMY, 1 );
                    this.makeEnemy( 12, 9, LAVA_ENEMY, 1 );
                    this.makeEnemy( 12, 5, LAVA_ENEMY, 1 );
                    this.makeEnemy( 10, 2, LAVA_ENEMY, 1 );
                    this.makeEnemy( 7, 1, LAVA_ENEMY, 1 );
                }
                portalX = 7;
                portalY = 7;
                portalRoom = 1;
                if(room == 0){
                    if(usedDoor){
                        startX = 14;
                        startY = 7;
                    }
                    else {
                        startX = 2;
                        startY = 7;
                    }

                    //Inner Walls
                    this.createBlock( 1, 1, 4, 3, PS.COLOR_BLACK );
                    this.createBlock( 1, 1, 9, 4, PS.COLOR_BLACK );
                    this.createBlock( 1, 1, 10, 5, PS.COLOR_BLACK );
                    this.createBlock( 1, 1, 8, 10, PS.COLOR_BLACK );
                    this.createBlock( 0, 1, 6, 7, PS.COLOR_BLACK );
                    this.createBlock( 0, 0, 3, 9, PS.COLOR_BLACK );
                    this.createBlock( 0, 0, 4, 10, PS.COLOR_BLACK );
                    this.createBlock( 1, 0, 1, 1, PS.COLOR_BLACK );
                    this.createBlock( 2, 0, 11, 1, PS.COLOR_BLACK );
                    this.createBlock( 0, 0, 13, 2, PS.COLOR_BLACK );
                    this.createBlock( 1, 0, 12, 13, PS.COLOR_BLACK );
                    this.createBlock( 0, 0, 13, 12, PS.COLOR_BLACK );
                    this.createBlock( 0, 0, 1, 13, PS.COLOR_BLACK );
                    this.createBlock( 0, 0, 3, 4, LAVA_COLOR );
                    this.createBlock( 0, 0, 5, 3, LAVA_COLOR );
                    this.createBlock( 0, 0, 5, 8, LAVA_COLOR );
                    this.createBlock( 0, 0, 3, 10, LAVA_COLOR );
                    this.createBlock( 0, 0, 4, 11, LAVA_COLOR );
                    this.createBlock( 0, 0, 7, 11, LAVA_COLOR );
                    this.createBlock( 0, 0, 8, 10, LAVA_COLOR );
                    this.createBlock( 0, 0, 9, 12, LAVA_COLOR );
                    this.createBlock( 1, 0, 5, 5, LAVA_COLOR );
                    this.createBlock( 0, 0, 9, 4, LAVA_COLOR );
                    this.createBlock( 0, 0, 10, 6, LAVA_COLOR );
                    this.createBlock( 0, 0, 11, 5, LAVA_COLOR );

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
                    this.createBlock( 0, 0, 3, 1, PS.COLOR_BLACK );
                    this.createBlock( 0, 0, 5, 3, PS.COLOR_BLACK );
                    this.createBlock( 0, 0, 7, 6, LAVA_COLOR );
                    this.createBlock( 0, 0, 8, 9, PS.COLOR_BLACK );
                    this.createBlock( 0, 0, 4, 8, PS.COLOR_BLACK );
                    this.createBlock( 0, 0, 12, 3, PS.COLOR_BLACK );
                    this.createBlock( 0, 0, 11, 1, PS.COLOR_BLACK );
                    this.createBlock( 0, 0, 13, 12, PS.COLOR_BLACK );
                    this.createBlock( 0, 0, 5, 11, PS.COLOR_BLACK );
                    this.createBlock( 0, 0, 1, 9, LAVA_COLOR );
                    this.createBlock( 0, 0, 1, 3, LAVA_COLOR );
                    this.createBlock( 0, 0, 3, 5, LAVA_COLOR );
                    this.createBlock( 0, 0, 2, 12, LAVA_COLOR );
                    this.createBlock( 0, 0, 8, 2, LAVA_COLOR );
                    this.createBlock( 0, 0, 10, 4, LAVA_COLOR );
                    this.createBlock( 0, 0, 12, 7, LAVA_COLOR );
                    this.createBlock( 0, 0, 7, 13, LAVA_COLOR );
                    this.createBlock( 0, 0, 10, 10, LAVA_COLOR );
                    this.createBlock( 0, 0, 9, 7, PS.COLOR_BLACK );

                    //Outer Walls
                    this.createBlock( 14, 0, 0, 0, PS.COLOR_BLACK );
                    this.createBlock( 14, 0, 0, 14, PS.COLOR_BLACK );
                    this.createBlock( 0, 14, 0, 0, PS.COLOR_BLACK );
                    this.createBlock( 0, 14, 14, 0, PS.COLOR_BLACK );

                    //Door
                    this.createBlock(0, 0, 0, 7, DOOR_COLOR);
                }
            }
            if ( level == 14 ){
                room = 0;
                PS.gridSize( WIDTH, HEIGHT );
                PS.bgAlpha( PS.ALL, PS.ALL, 255 );
                PS.border( PS.ALL, PS.ALL, 0 );
                startX = 7;
                startY = 12;
                portalX = 7;
                portalY = 7;
                portalRoom = 0;

                this.makeEnemy(7,7, SPAWNER_ENEMY, 0);
                this.makeEnemy(5,7, LAVA_ENEMY, 0);
                this.makeEnemy(9,7, LAVA_ENEMY, 0);

                this.makeFloor( 89, 38, 11, 20, 0, 0, WIDTH, HEIGHT );

                //Inner Walls
                this.createBlock( 4, 0, 5, 4, PS.COLOR_BLACK );
                this.createBlock( 4, 0, 5, 10, PS.COLOR_BLACK );
                this.createBlock( 0, 4, 4, 5, PS.COLOR_BLACK );
                this.createBlock( 0, 4, 10, 5, PS.COLOR_BLACK );

                this.createBlock( 0, 0, 5, 9, LAVA_COLOR );
                this.createBlock( 0, 0, 9, 9, LAVA_COLOR );
                this.createBlock( 0, 0, 5, 5, LAVA_COLOR );
                this.createBlock( 0, 0, 9, 5, LAVA_COLOR );

                this.createBlock( 0, 0, 4, 10, LAVA_COLOR );
                this.createBlock( 0, 0, 10, 10, LAVA_COLOR );
                this.createBlock( 0, 0, 4, 4, LAVA_COLOR );
                this.createBlock( 0, 0, 10, 4, LAVA_COLOR );

                this.createBlock( 0, 0, 3, 11, LAVA_COLOR );
                this.createBlock( 0, 0, 11, 11, LAVA_COLOR );
                this.createBlock( 0, 0, 3, 3, LAVA_COLOR );
                this.createBlock( 0, 0, 11, 3, LAVA_COLOR );

                this.makeFloor( 89, 38, 11, 20, 6, 10, 1, 1 );
                this.makeFloor( 89, 38, 11, 20, 8, 10, 1, 1 );
                this.makeFloor( 89, 38, 11, 20, 6, 4, 1, 1 );
                this.makeFloor( 89, 38, 11, 20, 8, 4, 1, 1 );

                this.makeFloor( 89, 38, 11, 20, 4, 8, 1, 1 );
                this.makeFloor( 89, 38, 11, 20, 10, 8, 1, 1 );
                this.makeFloor( 89, 38, 11, 20, 4, 6, 1, 1 );
                this.makeFloor( 89, 38, 11, 20, 10, 6, 1, 1 );


                //Outer Walls
                this.createBlock( 14, 0, 0, 0, PS.COLOR_BLACK );
                this.createBlock( 14, 0, 0, 14, PS.COLOR_BLACK );
                this.createBlock( 0, 14, 0, 0, PS.COLOR_BLACK );
                this.createBlock( 0, 14, 14, 0, PS.COLOR_BLACK );

            }
            if ( level == 15 ) {
                finalLevel = true;
                room = 0;
                PS.gridSize( WIDTH, HEIGHT );
                PS.bgAlpha( PS.ALL, PS.ALL, 255 );
                PS.border( PS.ALL, PS.ALL, 0 );
                startX = 7;
                startY = 12;
                this.makeEnemy(7,3, FINAL_BOSS_1, 0);
                this.makeEnemy(5,5, SHIELDED_ENEMY, 0);
                this.makeEnemy(9,5, SHIELDED_ENEMY, 0);

                this.makeFloor( 115, 26, 26, 20, 0, 0, WIDTH, HEIGHT );

                //Inner Walls
                this.createBlock( 2, 0, 6, 11, PS.COLOR_BLACK );
                this.createBlock( 0, 2, 3, 6, PS.COLOR_BLACK );
                this.createBlock( 0, 2, 11, 6, PS.COLOR_BLACK );

                //Outer Walls
                this.createBlock( 14, 0, 0, 0, PS.COLOR_BLACK );
                this.createBlock( 14, 0, 0, 14, PS.COLOR_BLACK );
                this.createBlock( 0, 14, 0, 0, PS.COLOR_BLACK );
                this.createBlock( 0, 14, 14, 0, PS.COLOR_BLACK );

            }
            this.drawBlood();
            if(level <= 6){
                PS.gridColor(0xb4c4cc);
            }
            else if (level >= 7 && level < 10){
                PS.gridColor(0xd89f62);
            }
            else{
                PS.gridColor(0x934338);
            }

        }


    };
}() );

PS.init = function ( system, options ) {
    PS.statusText("The Dark Side of The Mouse");

    const musicLoader = function ( result ) {
        music = result.channel; // save ID
    };
    const spaceLoader = function ( result ) {
            space = result.channel; // save ID
            //PS.debug("Ambient Channel: " + ambient);
            PS.audioPlayChannel( space, {loop: true, volume: 0.20});
           // PS.debug("Space Channel: " + space);
    };
    const planetLoader = function ( result ) {
        planet = result.channel;
        PS.audioPlayChannel ( planet, { volume: 0, loop: true});
    };

    level = 1;

    trigun = false;

    regen = false;

    shieldStrength = 0;
    Game.startScreen();

    PS.audioLoad ( "Laser_Shoot", { path: "GameAudio/" });
    PS.audioLoad ( "Alarm", { path: "GameAudio/" });
    PS.audioLoad ( "Alien1", { path: "GameAudio/" });
    PS.audioLoad ( "Alien2", { path: "GameAudio/" });
    PS.audioLoad ( "Alien3", { path: "GameAudio/" });
    PS.audioLoad ( "Alien4", { path: "GameAudio/" });
    PS.audioLoad ( "Alien5", { path: "GameAudio/" });
    PS.audioLoad ( "Alien6", { path: "GameAudio/" });
    PS.audioLoad ( "Alien7", { path: "GameAudio/" });
    PS.audioLoad ( "Alien8", { path: "GameAudio/" });
    PS.audioLoad ( "Alien9", { path: "GameAudio/" });
    PS.audioLoad ( "Alien10", { path: "GameAudio/" });

    PS.audioLoad ( "AlienDeath1", { path: "GameAudio/" });
    PS.audioLoad ( "AlienDeath2", { path: "GameAudio/" });
    PS.audioLoad ( "AlienDeath3", { path: "GameAudio/" });
    PS.audioLoad ( "AlienDeath4", { path: "GameAudio/" });
    PS.audioLoad ( "AlienDeath5", { path: "GameAudio/" });

    PS.audioLoad ( "AlienVictory1", { path: "GameAudio/" });
    PS.audioLoad ( "AlienVictory2", { path: "GameAudio/" });
    PS.audioLoad ( "AlienVictory3", { path: "GameAudio/" });

    PS.audioLoad ( "AlienSplatt", { path: "GameAudio/" });
    PS.audioLoad ( "AlienSplatt2", { path: "GameAudio/" });
    PS.audioLoad ( "AlienSplatt3", { path: "GameAudio/" });

    PS.audioLoad ( "PlayerShield", { path: "GameAudio/" });
    PS.audioLoad ( "EnemyShield", { path: "GameAudio/" });
    PS.audioLoad ( "LavaDeath", { path: "GameAudio/" });
    PS.audioLoad ( "Bounds", { path: "GameAudio/" });
    PS.audioLoad ( "Start", { path: "GameAudio/" });
    PS.audioLoad ( "StepPortal", { path: "GameAudio/" });
    PS.audioLoad ( "Victory", { path: "GameAudio/" });
    PS.audioLoad ( "Transform", { path: "GameAudio/" });

    PS.audioLoad ( "Lava1", { path: "GameAudio/" });
    PS.audioLoad ( "Lava2", { path: "GameAudio/" });
    PS.audioLoad ( "Lava3", { path: "GameAudio/" });

    PS.audioLoad ( "BossChange", { path: "GameAudio/" });
    PS.audioLoad ( "BossDeath", { path: "GameAudio/" });
    PS.audioLoad ( "Invuln", { path: "GameAudio/" });

    PS.audioLoad ( "Enemies_Defeated", { path: "GameAudio/" });
    PS.audioLoad ( "GameOver", { path: "GameAudio/" });
    PS.audioLoad ( "Invisibility", { path: "GameAudio/" });
    PS.audioLoad ( "Trigun_Pickup", { path: "GameAudio/" });
    PS.audioLoad ( "Shield_Pickup", { path: "GameAudio/" });

    PS.audioLoad ( "Space_Ambient", { path: "GameAudio/", onLoad: spaceLoader});
    PS.audioLoad ( "Planet_Ambient", { path: "GameAudio/", onLoad: planetLoader});

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
    if ( !firing && !isOutOfBounds && !gameover && !start && !runComplete) {
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
    if ( !isOutOfBounds && !gameover && !start && !runComplete &&
        !OBSTACLES.includes( nextBead ) && nextBead != REGEN_COLOR) {
        PS.color( pX, pY, PLAYER_COLOR );
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
        if(invis) {
            PS.alpha(pX, pY, 100);
        }
        if( ENEMY_TYPES.includes(nextBeadColor) && !isOutOfBounds && !gameover && !start ){
            Game.playerDamage(pX, pY);
        }
        PS.glyph( pastX, pastY, "" );
        if( POWERUPS.includes(nextBeadColor) ){
            Game.triggerEgg(pX, pY);
        }
        if( nextBeadColor == PORTAL_COLOR ){
            portalOpened = false;
            usedDoor = false;
            level += 1;
            room = 0;
            usedDoor = false;
            PS.audioPlay ( "StepPortal", { path: "GameAudio/", volume: 0.25});
            if(level === 7){
                PS.audioFade ( space, PS.CURRENT, 0, 30);
                PS.audioFade ( planet, PS.CURRENT, 0.25, 30);
            }

            Game.deleteAllEggs();
            Game.startScreen();
        }
        if( nextBead === (DOOR_COLOR) || nextBead === HIDDEN_DOOR_COLOR){
         //   PS.debug("Entered Door");
            Game.changeRooms(pX, pY);
        }
    }

    else if ( nextBead == LAVA_COLOR && !isOutOfBounds && !gameover && !start && !runComplete){
        PS.alpha(pastX, pastY, 255);
        PS.color( pastX, pastY, PS.data( pastX, pastY ) );
        PS.radius( pastX, pastY, 0 );
        PS.border( pastX, pastY, 0 );
        PS.glyph( pastX, pastY, "" );
        Game.GameOver("Lava");
    }
    else if ( !isOutOfBounds && !gameover && !start && !runComplete  && OBSTACLES.includes( nextBead ) ) {
        isOutOfBounds = true;
        exitX = pX;
        exitY = pY;
        PS.glyph(exitX, exitY, "!");
        PS.glyphColor(exitX, exitY, PS.COLOR_YELLOW);
        PS.border(pastX, pastY, 5);
        PS.borderColor(pastX, pastY, PS.COLOR_YELLOW);
        returnX = pastX;
        returnY = pastY;
        PS.audioPlay ( "Bounds", { path: "GameAudio/", volume: 0.25 });
    }
    else if ( isOutOfBounds && !gameover && !start && !runComplete && ( returnX === pX ) && ( returnY === pY ) ) {
        isOutOfBounds = false;
        PS.fade( returnX, returnY, 0 );
        PS.color( returnX, returnY, PLAYER_COLOR );
        PS.border(returnX, returnY, 0);
        PS.borderColor(returnX, returnY, PS.COLOR_BLACK);
        if(shieldStrength > 0){
            PS.border(returnX, returnY, shieldStrength);
            PS.borderColor(returnX, returnY, SHIELD_COLOR);
        }
        PS.glyph(exitX, exitY, "");
        PS.glyphColor(exitX, exitY, PS.COLOR_BLACK);
    }
    else if ( start && ( pX === startX ) && ( pY === startY ) && !runComplete) {
        PS.fade(PS.ALL, PS.ALL, 0);
        gameover = false;
        start = false;
        if(level == 1 && firstStart){
            firstStart = false;
           // PS.audioPlay ( "Alarm", { volume: 0.5, path: "GameAudio/" });
        }
        if(finalLevel){
            PS.audioPlay ( "BossChange", { path: "GameAudio/", volume: 0.5 });
        }
        PS.audioPlay ( "Start", { path: "GameAudio/", volume: 0.25 });
        PS.border(pX, pY, shieldStrength);
        PS.borderColor(pX, pY, SHIELD_COLOR);
        PS.color( pX, pY, PLAYER_COLOR );
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

