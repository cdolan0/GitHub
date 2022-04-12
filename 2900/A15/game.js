/*

Sound effects were found from the following on Freesound.org
MentosLat, SomeGuy22, jeckkech, JapanYoshiTheGamer, lulyc, FartBiscuit1700, Breviceps, AwesomeFantastic, and
thisusernameis

game.js for Perlenspiel 3.3.x
Last revision: 2022-03-15 (BM)

Perlenspiel is a scheme by Professor Moriarty (bmoriarty@wpi.edu).
This version of Perlenspiel (3.3.x) is hosted at <https://ps3.perlenspiel.net>
Perlenspiel is Copyright © 2009-22 Brian Moriarty.
This file is part of the standard Perlenspiel 3.3.x devkit distribution.

Perlenspiel is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Perlenspiel is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You may have received a copy of the GNU Lesser General Public License
along with the Perlenspiel devkit. If not, see <http://www.gnu.org/licenses/>.
*/

/*
This JavaScript file is a template for creating new Perlenspiel 3.3.x games.
Any unused event-handling function templates can be safely deleted.
Refer to the tutorials and documentation at <https://ps3.perlenspiel.net> for details.
*/

/*
The following comment lines are for JSHint <https://jshint.com>, a tool for monitoring code quality.
You may find them useful if your development environment is configured to support JSHint.
If you don't use JSHint (or are using it with a configuration file), you can safely delete these two lines.
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
var Game;
const WIDTH = 15;
const HEIGHT = 15;

// if controls are inverted
var inverted;

//Level number
var level;

//Player (x,y) and mirror (x,y);
var pX, pY, mX, mY;

//Game Over Boolean
var gameover;

var passLevel;

var complete1, complete2, complete3, complete4, complete5, complete6, complete7, complete8 = false;

var swapped = false;

var hasBeenUnlocked = false;

var finalHasBeenUnlocked = false;

const OBSTACLES = [PS.COLOR_BLACK, PS.COLOR_GRAY_LIGHT];

const KEY_SOUNDS = ["beep0", "beep1", "beep2", "beep3", "beep4", "beep5", "beep6",];

const MUSIC = ["GuitarBeat", "FunkyBeat", "EnergeticBeat", "ChillBeat"];

var musicChannels = [];

var currentSong;

(function (){

    // 1 = left, 2 = up, -1 = right, -2 = down
    var direction;

    gameover = false;

    passLevel = false;

    inverted = false;

    var missed = false;

    var nextLevelUnlock = false;

    var finalLevelUnlock = false;


    mX = 10;
    mY = 10;

    var timer = null; //set up timer
    var count = 3; // countdown value

    var wallMoveCount = WIDTH - 1;

    // Timer function

    var tick = function () {
        //Check if gameover
        if ( gameover ) {
            count -= 1;
            //After 3 seconds return to level select
            if (count <= 0){
                inverted = false;
                timer = null;
                gameover = false
                count = 3;
                level = 0;
                Game.makeLevel();
            }
        }
        if ( passLevel ){
            count -= 1;
            //After 4 seconds return to level select
            if (count == -1){
                inverted = false;
                timer = null;
                passLevel = false;
                count = 3;
                level += 1;
                Game.makeLevel();
            }
        }
        if (nextLevelUnlock && !hasBeenUnlocked){
            count -=1;
            PS.statusText("NEW LEVELS UNLOCKED!");
            if (count <= -2){
                inverted = false;
                timer = null;
                hasBeenUnlocked = true;
                count = 3;
                PS.audioPlay( "correct", {volume: 0.25, path: "PuzzleAudio/"} );
                PS.border( 3, 1, 1);
                PS.border( 5, 1, 1);
                PS.glyph( 3, 1, "6");
                PS.glyph( 5, 1, "7");
            }
        }

        if (finalLevelUnlock && !finalHasBeenUnlocked){
            count -=1;
            PS.statusText("NEW LEVEL UNLOCKED!");
            if (count <= -2){
                inverted = false;
                timer = null;
                finalHasBeenUnlocked = true;
                count = 3;
                PS.audioPlay( "correct", {volume: 0.25, path: "PuzzleAudio/"} );
                PS.border( 4, 2, 1);
                PS.glyph( 4, 2, "8");
            }
        }

        /*if(level == 8){
            if (count == -4){
                PS.audioPlay( "fx_zurp", {volume: 0.5});
                wallMoveCount -= 1;
                PS.color(wallMoveCount, PS.ALL, PS.COLOR_BLUE);
                PS.data(wallMoveCount, PS.ALL, PS.COLOR_BLUE);
                if(PS.data(mX, mY) == PS.COLOR_BLUE){
                    PS.radius(mX, mY, 0);
                    Game.GameOver();
                }
                count = 3;
            }
            else {
                count -= 1;
            }
        }*/
        if (missed){
            count -= 1;
            PS.statusText( "Missed It By That Much!" );
            if (count == -1){
                missed = false;
                PS.statusText( "Level " + level );
                timer = null;
                count = 3;
            }
        }
    };


    Game = {
        createBlock( w, h, x, y, color){
            for(var i = x; i <= (x+w); i += 1){
                for(var j = y; j <= (y+h); j += 1){
                    PS.color( i, j, color );
                    PS.data( i, j, color );
                    if(color == PS.COLOR_ORANGE){
                        PS.radius( i, j, 40);
                    }
                    if(color == PS.COLOR_VIOLET){
                        PS.radius( i, j, 20);
                    }
                }
            }
        },
        check(key){
            var keyNoise = KEY_SOUNDS[Math.floor(Math.random() * 7)];
            var data;
            var goodToMove;
            //If controlling mirror
            if(swapped){
                //Left
                if(key == 1005){
                    direction = 1;
                    goodToMove =  mX != 0;
                    if(goodToMove){
                        data = PS.data(mX-1, mY);
                    }
                }
                //Up
                else if(key == 1006){
                    direction = 2;
                    goodToMove =  mY != 0;
                    if(goodToMove){
                        data = PS.data(mX, mY-1);
                    }
                }
                //Right
                else if(key == 1007){
                    direction = -1;
                    goodToMove = (mX + 1) < WIDTH;
                    if(goodToMove){
                        data = PS.data(mX+1, mY);
                    }
                }
                //Down
                else if(key == 1008){
                    direction = -2;
                    goodToMove = (mY + 1) < HEIGHT;
                    if(goodToMove){
                        data = PS.data(mX, mY+1);
                    }
                }
            }
            //If controlling player
            else{
                //Left
                if(key == 1005){
                    direction = 1;
                    goodToMove =  pX != 0;
                    if(goodToMove){
                        data = PS.data(pX-1, pY);
                    }
                }
                //Up
                else if(key == 1006){
                    direction = 2;
                    goodToMove =  pY != 0;
                    if(goodToMove){
                        data = PS.data(pX, pY-1);
                    }
                }
                //Right
                else if(key == 1007){
                    direction = -1;
                    goodToMove = (pX + 1) < WIDTH;
                    if(goodToMove){
                        data = PS.data(pX+1, pY);
                    }
                }
                //Down
                else if(key == 1008){
                    direction = -2;
                    goodToMove = (pY + 1) < HEIGHT;
                    if(goodToMove){
                        data = PS.data(pX, pY+1);
                    }
                }
            }

            if(!OBSTACLES.includes(data) && goodToMove){
                PS.audioPlay( keyNoise, { volume: .25, path: "PuzzleAudio/"} );
                if (!swapped && data != PS.COLOR_BLUE){
                    this.movePlayer();
                    this.moveMirror();
                    if( data == PS.COLOR_ORANGE || PS.data(mX, mY) == PS.COLOR_ORANGE ){
                        PS.audioPlay( "inverse", {volume: 0.25, path: "PuzzleAudio/"} );
                        if ( PS.data(mX, mY) == PS.COLOR_ORANGE ){
                            PS.data(mX, mY, PS.COLOR_WHITE)
                        }
                        else{
                            PS.data(pX, pY, PS.COLOR_WHITE);
                        }
                        if(inverted){
                            inverted = false;
                        }
                        else{
                            inverted = true;
                        }
                    }
                }
                else if (swapped && data != PS.COLOR_RED){
                    this.moveMirror();
                    this.movePlayer();
                    if( data == PS.COLOR_ORANGE || PS.data(pX, pY) == PS.COLOR_ORANGE ){
                        PS.audioPlay( "inverse", {volume: 0.25, path: "PuzzleAudio/"} );
                        if ( PS.data(pX, pY) == PS.COLOR_ORANGE ){
                            PS.data(pX, pY, PS.COLOR_WHITE)
                        }
                        else{
                            PS.data(mX, mY, PS.COLOR_WHITE);
                        }
                        if(inverted){
                            inverted = false;
                        }
                        else{
                            inverted = true;
                        }
                    }
                }
                else{
                    PS.audioPlay( "error", { volume: .25, path: "PuzzleAudio/" } );
                }
            }
            else{
                PS.audioPlay( "error", { volume: .25, path: "PuzzleAudio/" } );
            }
            if(PS.data(pX, pY) != PS.COLOR_RED && PS.data(mX, mY) != PS.COLOR_BLUE){
                PS.color(pX, pY, PS.COLOR_RED);
                PS.color(mX, mY, PS.COLOR_BLUE);
                PS.radius(pX, pY, 50);
                PS.radius(mX, mY, 50);
            }
            if( data == PS.COLOR_GREEN ){
                PS.audioPlay( "bounce", { volume: .10, path: "PuzzleAudio/" } );
                this.unlock();
            }

            //If merged
            if(mX == pX && mY == pY){
                PS.audioPlay( "collision", { volume: .25, path: "PuzzleAudio/" } );
                PS.color(mX, mY, PS.COLOR_VIOLET);
                PS.statusText("LEVEL COMPLETE");
                PS.statusColor(PS.COLOR_BLACK);
                if(level == 1){
                    complete1 = true;
                }
                else if(level == 2){
                    complete2 = true;
                }
                else if(level == 3){
                    complete3 = true;
                }
                else if(level == 4){
                    complete4 = true;
                }
                else if(level == 5){
                    complete5 = true;
                }
                else if(level == 6){
                    complete6 = true;
                }
                else if(level == 7){
                    complete7 = true;
                }
                else if(level == 8){
                    complete8 = true;
                }
                passLevel = true;
                Game.clearArrows();
            }
        },
        movePlayer(){
            this.clearArrows();
            var pDir = direction;
            var nextBead;
            if(inverted && swapped){
                pDir= direction * -1;
            }
            //Left
            if(pDir == 1 && (pX) != 0) {
                nextBead = PS.data(pX - 1, pY);
                if(nextBead != PS.COLOR_BLUE && !OBSTACLES.includes(nextBead)){
                    pX = pX - 1;
                    PS.radius(pX + 1, pY, 0);
                    PS.color(pX + 1, pY, PS.COLOR_WHITE);
                }
            }
            //Right
            else if(pDir == -1 && (pX + 1) < WIDTH) {
                nextBead = PS.data(pX + 1, pY);
                if(nextBead != PS.COLOR_BLUE && !OBSTACLES.includes(nextBead)){
                    pX = pX + 1;
                    PS.radius(pX - 1, pY, 0);
                    PS.color(pX - 1, pY, PS.COLOR_WHITE);
                }
            }
            //Up
            else if(pDir == 2 && (pY) != 0) {
                nextBead = PS.data(pX, pY - 1);
                if(nextBead != PS.COLOR_BLUE && !OBSTACLES.includes(nextBead)){
                    pY = pY - 1;
                    PS.radius(pX, pY + 1, 0);
                    PS.color(pX, pY + 1, PS.COLOR_WHITE);
                }
            }
            //Down
            else if (pDir == -2 && (mY + 1) < HEIGHT){
                nextBead = PS.data(pX, pY + 1);
                if(nextBead != PS.COLOR_BLUE && !OBSTACLES.includes(nextBead)){
                    pY = pY + 1;
                    PS.radius(pX, pY - 1, 0);
                    PS.color(pX, pY - 1, PS.COLOR_WHITE);
                }
            }
            PS.color(pX, pY, PS.COLOR_RED);
            PS.radius(pX, pY, 50);

            //if in green
            if( nextBead == PS.COLOR_GREEN ){
                PS.audioPlay( "bounce", { volume: .10, path: "PuzzleAudio/"} );
                this.unlock();
            }

            //If In Red
            if(nextBead == PS.COLOR_RED){
                PS.radius(pX, pY, 0);
                this.GameOver();
            }
            
            if( nextBead == PS.COLOR_VIOLET ){
                PS.audioPlay("swap", {volume: 0.25, path: "PuzzleAudio/"});
                PS.data(pX, pY, PS.COLOR_WHITE);
                if(swapped){
                    this.clearArrows();
                    swapped = false;
                    this.updateArrows();
                }
                else{
                    this.clearArrows();
                    swapped = true;
                    this.updateArrows();
                }
            }

            this.updateArrows();
        },

        clearArrows(){
            //Target x and y
            var tX, tY;
            if(swapped){
                tX = mX;
                tY = mY;
            }
            else{
                tX = pX;
                tY = pY;
            }
            if((tX) != 0){
                PS.glyph(tX - 1, tY, "");
            }
            if((tX + 1) < WIDTH){
                PS.glyph(tX + 1, tY, "");
            }
            if((tY) != 0){
                PS.glyph(tX, tY - 1, "");
            }
            if((tY + 1) < HEIGHT) {
                PS.glyph(tX, tY + 1, "");
            }
        },

        updateArrows(){
            var tX, tY;
            if(swapped){
                tX = mX;
                tY = mY;
            }
            else{
                tX = pX;
                tY = pY;
            }
            if((tX) != 0){
                PS.glyph(tX - 1, tY, "<");
            }
            if((tX + 1) < WIDTH){
                PS.glyph(tX + 1, tY, ">");
            }
            if((tY) != 0){
                PS.glyph(tX, tY - 1, "^");
            }
            if((tY + 1) < HEIGHT) {
                PS.glyph(tX, tY + 1, "v");
            }
        },

        highlightArrow(key){
            var tX, tY;
            if(swapped){
                tX = mX;
                tY = mY;
            }
            else{
                tX = pX;
                tY = pY;
            }
            //Left
            if(key == 1005 && (tX) != 0){
               PS.glyphColor(tX-1, tY, PS.COLOR_GREEN);
            }
            //Up
            else if(key == 1006 && (tY) != 0){
                PS.glyphColor(tX, tY-1, PS.COLOR_GREEN);
            }
            //Right
            else if(key == 1007 && (tX + 1) < WIDTH){
                PS.glyphColor(tX+1, tY, PS.COLOR_GREEN);
            }
            //Down
            else if(key == 1008 && (tY + 1) < HEIGHT){
                PS.glyphColor(tX, tY+1, PS.COLOR_GREEN);
            }
        },

        unHLArrow(key){
            var tX, tY;
            if(swapped){
                tX = mX;
                tY = mY;
            }
            else{
                tX = pX;
                tY = pY;
            }
            //Left
            if(key == 1005 && (tX) != 0){
                PS.glyphColor(tX-1, tY, PS.COLOR_BLACK);
            }
            //Up
            else if(key == 1006 && (tY) != 0){
                PS.glyphColor(tX, tY-1, PS.COLOR_BLACK);
            }
            //Right
            else if(key == 1007 && (tX + 1) < WIDTH){
                PS.glyphColor(tX+1, tY, PS.COLOR_BLACK);
            }
            //Down
            else if(key == 1008 && (tY + 1) < HEIGHT){
                PS.glyphColor(tX, tY+1, PS.COLOR_BLACK);
            }
        },

        moveMirror(){
            this.clearArrows();
            //Mirror direction
            var mDir = direction;
            var nextBead;
            if(inverted && !swapped){
                mDir= direction * -1;
            }
            //Left
            if(mDir == 1 && (mX) != 0) {
                nextBead = PS.data(mX - 1, mY);
                if(nextBead != PS.COLOR_RED && !OBSTACLES.includes(nextBead)){
                    mX = mX - 1;
                    PS.color(mX + 1, mY, PS.COLOR_WHITE);
                    PS.radius(mX + 1, mY, 0);
                }
            }
            //Right
            else if(mDir == -1 && (mX + 1) < WIDTH) {
                nextBead = PS.data(mX + 1, mY);
                if(nextBead != PS.COLOR_RED && !OBSTACLES.includes(nextBead)){
                    mX = mX + 1;
                    PS.color(mX - 1, mY, PS.COLOR_WHITE);
                    PS.radius(mX - 1, mY, 0);
                }
            }
            //Up
            else if(mDir == 2 && (mY) != 0) {
                nextBead = PS.data(mX, mY - 1);
                if(nextBead != PS.COLOR_RED && !OBSTACLES.includes(nextBead)){
                    mY = mY - 1;
                    PS.color(mX, mY + 1, PS.COLOR_WHITE);
                    PS.radius(mX, mY + 1, 0);
                }
            }
            //Down
            else if (mDir == -2 && (mY + 1) < HEIGHT){
                nextBead = PS.data(mX, mY + 1);
                if(nextBead != PS.COLOR_RED && !OBSTACLES.includes(nextBead)){
                    mY = mY + 1;
                    PS.color(mX, mY - 1, PS.COLOR_WHITE);
                    PS.radius(mX, mY - 1, 0);
                }
            }

            PS.color(mX, mY, PS.COLOR_BLUE);
            PS.radius(mX, mY, 50);

            //If in green
            if( nextBead == PS.COLOR_GREEN ){
                PS.audioPlay( "bounce", { volume: .10, path: "PuzzleAudio/" } );
                this.unlock();
            }

            //If In Blue
            if(nextBead == PS.COLOR_BLUE){
                PS.radius(mX, mY, 0);
                this.GameOver();
            }
            if( nextBead == PS.COLOR_VIOLET ){
                PS.audioPlay("swap", {volume: 0.25, path: "PuzzleAudio/"});
                PS.data(mX, mY, PS.COLOR_WHITE);
                if(swapped){
                    this.clearArrows();
                    swapped = false;
                    this.updateArrows();
                }
                else{
                    this.clearArrows();
                    swapped = true;
                    this.updateArrows();
                }
            }

            this.updateArrows();
        },

        unlock(){
            PS.data(pX, pY, PS.COLOR_WHITE);
            for(var i = 0; i < WIDTH; i += 1){
                for(var j = 0; j < HEIGHT; j += 1){
                    if(PS.data( i,  j ) == PS.COLOR_GRAY_LIGHT){
                        PS.color( i, j, PS.COLOR_WHITE );
                        PS.data( i, j, PS.COLOR_WHITE);
                    }
                }
            }
        },

        GameOver(){
            swapped = false;
            PS.audioPlay( "death", { volume: .5, path: "PuzzleAudio/"} );
            PS.statusText("Game Over");
            PS.statusColor(PS.COLOR_BLACK);
            this.clearArrows();
            gameover = true;
        },

        makeLevel(){
          //  PS.audioStop(currentSong);
            swapped = false;
            if ( level > 8 || (level > 5 && !hasBeenUnlocked) || (level > 7 && !finalHasBeenUnlocked)){
               level = 0;
            }
            if(complete1 && complete2 && complete3 && !hasBeenUnlocked){
                nextLevelUnlock = true;
                level = 0;
            }
            if(complete1 && complete2 && complete3 && complete4 && complete5 && !finalHasBeenUnlocked){
                finalLevelUnlock = true;
                level = 0;
            }
            if ( timer == null ){
                timer = PS.timerStart (60, tick);
            }
            if(level == 0){
                currentSong = musicChannels[0];
            }
            else if (1 <= level && 3>= level){
                currentSong = musicChannels[1];
            }
            else if(level == 4 || level == 5){
                currentSong = musicChannels[2];
            }
            else if(level >= 6){
                currentSong = musicChannels[3];
            }
            if( level == 0 ){
                PS.gridSize( 9, 3 );
                PS.data(PS.ALL, PS.ALL, PS.COLOR_WHITE);
                PS.statusColor( PS.COLOR_BLACK );
                PS.border(PS.ALL, PS.ALL, 0);
                PS.statusText( "LEVEL SELECT" );
                PS.glyph( 0, 0, "1");
                PS.glyph( 2, 0, "2");
                PS.glyph( 4, 0, "3");
                PS.glyph( 6, 0, "4");
                PS.glyph( 8, 0, "5");
                PS.fade( PS.ALL, PS.ALL, 15);
                if(complete1){
                    PS.color( 0, 0, PS.COLOR_GREEN);
                }
                if(complete2){
                    PS.color(2, 0, PS.COLOR_GREEN);
                }
                if(complete3){
                    PS.color(4, 0, PS.COLOR_GREEN);
                }
                if(complete4){
                    PS.color(6, 0, PS.COLOR_GREEN);
                }
                if(complete5){
                    PS.color(8, 0, PS.COLOR_GREEN);
                }
                if(hasBeenUnlocked){
                    PS.glyph( 3, 1, "6");
                    PS.glyph( 5, 1, "7");
                    if(complete6){
                        PS.color(3, 1, PS.COLOR_GREEN);
                    }
                    if(complete7){
                        PS.color(5, 1, PS.COLOR_GREEN);
                    }
                    PS.border( 3, 1, 1);
                    PS.border( 5, 1, 1);
                }
                if(finalHasBeenUnlocked){
                    PS.border( 4, 2, 1);
                    PS.glyph( 4, 2, "8");
                    if(complete8){
                        PS.color(4, 2, PS.COLOR_GREEN);
                    }
                }

                if(complete1 && complete2 && complete3 && complete4 && complete5 & complete6 && complete7 &&
                    complete8){
                    PS.statusText("ALL LEVELS COMPLETE!")
                }

                PS.border( 0, 0, 1);
                PS.border( 2, 0, 1);
                PS.border( 4, 0, 1);
                PS.border( 6, 0, 1);
                PS.border( 8, 0, 1);
            }
            if( level == 1 ){
                PS.gridSize( WIDTH, HEIGHT );
                PS.data(PS.ALL, PS.ALL, PS.COLOR_WHITE);
                PS.statusColor( PS.COLOR_VIOLET );
                PS.border(PS.ALL, PS.ALL, 0);
                PS.statusText( "Level 1" );
                pX = 5;
                pY = 7;
                mX = 9;
                mY = 7;
                PS.color(pX, pY, PS.COLOR_RED);
                PS.color(mX, mY, PS.COLOR_BLUE);
                PS.radius(pX, pY, 50);
                PS.radius(mX, mY, 50);
                this.updateArrows();
                this.createBlock( 14, 0, 0, 0, PS.COLOR_BLACK );
                this.createBlock( 14, 0, 0, 14, PS.COLOR_BLACK );
                this.createBlock( 0, 12, 14, 1, PS.COLOR_RED );
                this.createBlock( 0, 12, 0, 1, PS.COLOR_BLUE );
            }
            if( level == 2 ){
                PS.gridSize( WIDTH, HEIGHT );
                PS.data(PS.ALL, PS.ALL, PS.COLOR_WHITE);
                PS.statusColor( PS.COLOR_VIOLET );
                PS.border(PS.ALL, PS.ALL, 0);
                PS.statusText( "Level 2" );
                pX = 3;
                pY = 3;
                mX = 11;
                mY = 3;
                PS.color(pX, pY, PS.COLOR_RED);
                PS.color(mX, mY, PS.COLOR_BLUE);
                PS.radius(pX, pY, 50);
                PS.radius(mX, mY, 50);
                this.updateArrows();
                this.createBlock( 0, 6, 7, 0, PS.COLOR_BLACK );
                this.createBlock( 0, 3, 14, 0, PS.COLOR_BLACK );
                this.createBlock( 6, 0, 0, 0, PS.COLOR_RED );
                this.createBlock( 11, 0, 1, 14, PS.COLOR_RED );
                this.createBlock( 0, 13, 0, 1, PS.COLOR_RED );
                this.createBlock( 5, 0, 8, 0, PS.COLOR_BLACK )
                this.createBlock( 0, 7, 14, 7, PS.COLOR_BLUE );
                this.createBlock( 2, 0, 5, 7, PS.COLOR_BLUE );
                this.createBlock( 0, 3, 14, 4, PS.COLOR_BLUE );
                this.createBlock( 5, 0, 8, 7, PS.COLOR_GRAY_LIGHT );
                this.createBlock( 0, 0, 13, 14, PS.COLOR_GREEN );
            }
            if( level == 3 ) {
                PS.gridSize( WIDTH, HEIGHT );
                PS.data( PS.ALL, PS.ALL, PS.COLOR_WHITE );
                PS.statusColor( PS.COLOR_VIOLET );
                inverted = false;
                PS.border(PS.ALL, PS.ALL, 0);
                PS.statusText( "Level 3" );
                pX = 3;
                pY = 7;
                mX = 11;
                mY = 7;
                PS.color(pX, pY, PS.COLOR_RED);
                PS.color(mX, mY, PS.COLOR_BLUE);
                PS.radius(pX, pY, 50);
                PS.radius(mX, mY, 50);
                this.updateArrows();
                this.createBlock( 14, 0, 0, 0, PS.COLOR_BLACK );
                this.createBlock( 14, 0, 0, 14, PS.COLOR_BLACK );
                this.createBlock( 0, 14, 0, 0, PS.COLOR_BLACK );
                this.createBlock( 0, 14, 14, 0, PS.COLOR_BLACK );
                this.createBlock( 0, 2, 2, 2, PS.COLOR_BLACK );
                this.createBlock( 7, 0, 2, 2, PS.COLOR_BLACK );
                this.createBlock( 2, 0, 4, 4, PS.COLOR_BLACK );
                this.createBlock( 0, 2, 4, 4, PS.COLOR_BLACK );
                this.createBlock( 0, 2, 2, 12, PS.COLOR_BLACK );
                this.createBlock( 0, 2, 4, 10, PS.COLOR_BLACK );
                this.createBlock( 0, 1, 2, 8, PS.COLOR_BLACK );
                this.createBlock( 0, 7, 6, 6, PS.COLOR_BLACK );
                this.createBlock( 1, 0, 4, 8, PS.COLOR_BLACK );
                this.createBlock( 2, 0, 6, 6, PS.COLOR_BLACK );
                this.createBlock( 0, 1, 8, 4, PS.COLOR_BLACK );
                this.createBlock( 1, 0, 8, 8, PS.COLOR_BLACK );
                this.createBlock( 4, 0, 6, 10, PS.COLOR_BLACK );
                this.createBlock( 0, 6, 12, 6, PS.COLOR_BLACK );
                this.createBlock( 0, 2, 8, 12, PS.COLOR_BLACK );
                this.createBlock( 0, 2, 10, 10, PS.COLOR_BLACK );
                this.createBlock( 1, 0, 10, 12, PS.COLOR_BLACK );
                this.createBlock( 2, 0, 2, 10, PS.COLOR_BLACK );
                this.createBlock( 2, 0, 1, 6, PS.COLOR_BLACK );
                this.createBlock( 0, 8, 10, 0, PS.COLOR_BLACK );
                this.createBlock( 1, 0, 12, 2, PS.COLOR_BLACK );
                this.createBlock( 1, 0, 11, 4, PS.COLOR_BLACK );
                this.createBlock( 0, 0, 6, 3, PS.COLOR_RED );
                this.createBlock( 0, 0, 8, 9, PS.COLOR_RED );
                this.createBlock( 0, 0, 12, 9, PS.COLOR_BLUE );
                this.createBlock( 0, 2, 6, 11, PS.COLOR_GRAY_LIGHT );
                this.createBlock( 0, 0, 13, 1, PS.COLOR_GREEN );
                this.createBlock( 0, 0, 6, 9, PS.COLOR_WHITE );
            }
            if( level == 4 ) {
                PS.gridSize( WIDTH, HEIGHT );
                PS.data(PS.ALL, PS.ALL, PS.COLOR_WHITE);
                PS.statusColor( PS.COLOR_VIOLET );
                PS.border(PS.ALL, PS.ALL, 0);
                PS.statusText( "Level 4" );
                pX = 6;
                pY = 7;
                mX = 8;
                mY = 7;
                PS.color(pX, pY, PS.COLOR_RED);
                PS.color(mX, mY, PS.COLOR_BLUE);
                PS.radius(pX, pY, 50);
                PS.radius(mX, mY, 50);
                this.updateArrows();
                this.createBlock( 14, 0, 0,0, PS.COLOR_BLACK );
                this.createBlock( 0, 11, 0, 1, PS.COLOR_RED );
                this.createBlock( 0, 0, 0, 13, PS.COLOR_BLUE );
                this.createBlock( 0, 12, 14, 1, PS.COLOR_BLUE );
                this.createBlock( 4, 0, 9, 1, PS.COLOR_BLUE );
                this.createBlock( 14, 0, 0,14, PS.COLOR_BLACK );
                this.createBlock( 0, 10, 1, 2, PS.COLOR_GRAY_LIGHT );
                this.createBlock( 0, 0, 7, 1, PS.COLOR_GRAY_LIGHT );
                this.createBlock( 0, 0, 7, 13, PS.COLOR_GRAY_LIGHT );
                this.createBlock( 3, 10, 2, 2, PS.COLOR_BLACK );
                this.createBlock( 4, 10, 9, 2, PS.COLOR_BLACK );
                this.createBlock( 0, 10, 7, 2, PS.COLOR_BLACK );
                this.createBlock( 0, 0, 1, 1, PS.COLOR_GREEN );
                this.createBlock( 0, 0, 1, 13, PS.COLOR_ORANGE );
            }
            if( level == 5 ){
                PS.gridSize( WIDTH, HEIGHT );
                PS.data(PS.ALL, PS.ALL, PS.COLOR_WHITE);
                PS.statusColor( PS.COLOR_VIOLET );
                PS.border(PS.ALL, PS.ALL, 0);
                PS.statusText( "Level 5" );
                pX = 3;
                pY = 7;
                mX = 11;
                mY = 7;
                PS.color(pX, pY, PS.COLOR_RED);
                PS.color(mX, mY, PS.COLOR_BLUE);
                PS.radius(pX, pY, 50);
                PS.radius(mX, mY, 50);
                this.updateArrows();
                this.createBlock( 14, 0, 0,0, PS.COLOR_BLACK );
                this.createBlock( 0, 5, 0, 1, PS.COLOR_BLACK );
                this.createBlock( 0, 5, 14, 1, PS.COLOR_BLACK );
                this.createBlock( 0, 8, 7, 1, PS.COLOR_BLACK );
                this.createBlock( 0, 6, 0, 8, PS.COLOR_RED );
                this.createBlock( 6, 0, 1, 14, PS.COLOR_RED );
                this.createBlock( 4, 0, 2, 4, PS.COLOR_RED );
                this.createBlock( 0, 1, 13, 1, PS.COLOR_BLUE );
                this.createBlock( 0, 6, 14, 8, PS.COLOR_BLUE );
                this.createBlock( 5, 0, 8, 14, PS.COLOR_BLUE );
                this.createBlock( 0, 3, 7, 10, PS.COLOR_GRAY_LIGHT );
                this.createBlock( 0, 0, 0, 7, PS.COLOR_GREEN );
                this.createBlock( 0, 0, 14, 7, PS.COLOR_BLUE );
                this.createBlock( 0, 0, 3, 1, PS.COLOR_ORANGE );
            }
            if( level == 6 ){
                PS.gridSize( WIDTH, HEIGHT );
                PS.data(PS.ALL, PS.ALL, PS.COLOR_WHITE);
                PS.statusColor( PS.COLOR_VIOLET );
                PS.border(PS.ALL, PS.ALL, 0);
                PS.statusText( "Level 6" );
                pX = 2;
                pY = 7;
                mX = 12;
                mY = 7;
                PS.color(pX, pY, PS.COLOR_RED);
                PS.color(mX, mY, PS.COLOR_BLUE);
                PS.radius(pX, pY, 50);
                PS.radius(mX, mY, 50);
                this.updateArrows();
                this.createBlock( 14, 0, 0, 0, PS.COLOR_BLACK );
                this.createBlock( 14, 0, 0, 14, PS.COLOR_BLACK );
                this.createBlock( 0, 12, 0, 1, PS.COLOR_RED );
                this.createBlock( 3, 0, 1, 8, PS.COLOR_RED );
                this.createBlock( 0, 0, 0, 7, PS.COLOR_BLACK );
                this.createBlock( 0, 0, 0, 1, PS.COLOR_BLACK );
                this.createBlock( 0, 12, 14, 1, PS.COLOR_BLUE );
                this.createBlock( 0, 6, 4, 1, PS.COLOR_GRAY_LIGHT );
                this.createBlock( 0, 0, 13, 13, PS.COLOR_GREEN);
                this.createBlock( 0, 0, 7, 7, PS.COLOR_ORANGE );
                this.createBlock( 0, 0, 1, 1, PS.COLOR_VIOLET );
            }
            if( level == 7 ) {
                PS.gridSize(WIDTH, HEIGHT);
                PS.data(PS.ALL, PS.ALL, PS.COLOR_WHITE);
                PS.statusColor(PS.COLOR_VIOLET);
                PS.border(PS.ALL, PS.ALL, 0);
                PS.statusText("Level 7");
                pX = 6;
                pY = 13;
                mX = 8;
                mY = 13;
                PS.color(pX, pY, PS.COLOR_RED);
                PS.color(mX, mY, PS.COLOR_BLUE);
                PS.radius(pX, pY, 50);
                PS.radius(mX, mY, 50);
                this.updateArrows();
                this.createBlock( 14, 0, 0, 0, PS.COLOR_BLACK );
                this.createBlock( 14, 0, 0, 14, PS.COLOR_BLACK );
                this.createBlock( 0, 14, 0, 0, PS.COLOR_BLACK );
                this.createBlock( 0, 14, 14, 0, PS.COLOR_BLACK );
                this.createBlock( 0, 2, 2, 1, PS.COLOR_BLACK );
                this.createBlock( 0, 1, 8, 1, PS.COLOR_BLACK );
                this.createBlock( 2, 0, 4, 2, PS.COLOR_BLACK );
                this.createBlock( 2, 0, 2, 4, PS.COLOR_BLACK );
                this.createBlock( 4, 0, 6, 4, PS.COLOR_BLACK );
                this.createBlock( 0, 0, 4, 3, PS.COLOR_BLACK );
                this.createBlock( 0, 0, 6, 3, PS.COLOR_BLACK );
                this.createBlock( 0, 0, 5, 11, PS.COLOR_BLACK );
                this.createBlock( 4, 0, 4, 6, PS.COLOR_BLACK );
                this.createBlock( 0, 1, 7, 11, PS.COLOR_BLACK );
                this.createBlock( 0, 2, 9, 10, PS.COLOR_BLACK );
                this.createBlock( 0, 5, 10, 2, PS.COLOR_BLACK );
                this.createBlock( 0, 4, 12, 2, PS.COLOR_BLACK );
                this.createBlock( 0, 0, 13, 6, PS.COLOR_BLACK );
                this.createBlock( 1, 0, 1, 6, PS.COLOR_BLACK );
                this.createBlock( 2, 0, 2, 8, PS.COLOR_BLACK );
                this.createBlock( 0, 4, 6, 6, PS.COLOR_BLACK );
                this.createBlock( 0, 2, 8, 6, PS.COLOR_BLACK );
                this.createBlock( 4, 0, 8, 8, PS.COLOR_BLACK );
                this.createBlock( 0, 0, 2, 7, PS.COLOR_BLACK );
                this.createBlock( 2, 0, 5, 11, PS.COLOR_BLACK );
                this.createBlock( 0, 1, 12, 9, PS.COLOR_BLACK );
                this.createBlock( 2, 0, 11, 12, PS.COLOR_BLACK );
                this.createBlock( 0, 0, 4, 11, PS.COLOR_BLACK );
                this.createBlock( 1, 0, 3, 9, PS.COLOR_BLACK );
                this.createBlock( 0, 0, 1, 2, PS.COLOR_BLACK );
                this.createBlock( 0, 2, 2, 11, PS.COLOR_BLACK );
                this.createBlock( 0, 0, 5, 13, PS.COLOR_RED );
                this.createBlock( 0, 0, 8, 7, PS.COLOR_RED );
                this.createBlock( 1, 0, 8, 8, PS.COLOR_RED );
                this.createBlock( 0, 0, 9, 13, PS.COLOR_BLUE );
                this.createBlock( 0, 0, 6, 7, PS.COLOR_BLUE );
                this.createBlock( 0, 0, 2, 5, PS.COLOR_GRAY_LIGHT );
                this.createBlock( 0, 0, 7, 13, PS.COLOR_GRAY_LIGHT );
                this.createBlock( 0, 0, 3, 3, PS.COLOR_GREEN );
                this.createBlock( 0, 0, 1, 5, PS.COLOR_ORANGE );
                this.createBlock( 0, 0, 9, 7, PS.COLOR_VIOLET );
                this.createBlock( 0, 0, 2, 1, PS.COLOR_WHITE );
            }
            if( level == 8 ) {
                wallMoveCount = WIDTH - 1;
                PS.gridSize(WIDTH, HEIGHT);
                PS.data(PS.ALL, PS.ALL, PS.COLOR_WHITE);
                PS.statusColor(PS.COLOR_VIOLET);
                PS.border(PS.ALL, PS.ALL, 0);
                PS.statusText("Level 8");
                pX = 3;
                pY = 7;
                mX = 13;
                mY = 7;
                PS.color(pX, pY, PS.COLOR_RED);
                PS.color(mX, mY, PS.COLOR_BLUE);
                PS.radius(pX, pY, 50);
                PS.radius(mX, mY, 50);
                this.updateArrows();
                this.createBlock( 14, 0, 0, 0, PS.COLOR_BLACK );
                this.createBlock( 14, 0, 0, 14, PS.COLOR_BLACK );
                this.createBlock( 0, 14, 0, 0, PS.COLOR_BLACK );
                this.createBlock( 0, 0, 12, 2, PS.COLOR_BLACK );
                this.createBlock( 0, 8, 12, 4, PS.COLOR_BLACK );
                this.createBlock( 0, 3, 10, 1, PS.COLOR_BLACK );
                this.createBlock( 0, 1, 8, 4, PS.COLOR_BLACK );
                this.createBlock( 0, 1, 8, 1, PS.COLOR_BLACK );
                this.createBlock( 0, 7, 6, 1, PS.COLOR_BLACK );
                this.createBlock( 1, 0, 7, 8, PS.COLOR_BLACK );
                this.createBlock( 3, 0, 8, 6, PS.COLOR_BLACK );
                this.createBlock( 0, 0, 13, 8, PS.COLOR_BLACK );
                this.createBlock( 0, 5, 10, 7, PS.COLOR_BLACK );
                this.createBlock( 0, 0, 10, 13, PS.COLOR_BLUE)
                this.createBlock( 0, 14, 14, 0, PS.COLOR_BLUE );
                this.createBlock( 0, 0, 1, 6, PS.COLOR_RED );
                this.createBlock( 0, 0, 9, 6, PS.COLOR_GREEN );
                this.createBlock( 0, 0, 2, 1, PS.COLOR_RED );
                this.createBlock( 0, 0, 2, 2, PS.COLOR_BLACK );
                this.createBlock( 0, 2, 2, 6, PS.COLOR_BLACK );
                this.createBlock( 0, 0, 2, 4, PS.COLOR_BLACK );
                this.createBlock( 0, 11, 4, 1, PS.COLOR_BLACK );
                this.createBlock( 3, 0, 6, 10, PS.COLOR_BLACK );
                this.createBlock( 0, 3, 8, 10, PS.COLOR_BLACK );
                this.createBlock( 1, 0, 5, 12, PS.COLOR_BLACK );
                this.createBlock( 1, 0, 2, 10, PS.COLOR_BLACK );
                this.createBlock( 1, 0, 1, 12, PS.COLOR_BLACK );
                this.createBlock( 0, 0, 0, 13, PS.COLOR_RED );
                this.createBlock( 0, 0, 3, 1, PS.COLOR_VIOLET );
                this.createBlock( 0, 0, 9, 13, PS.COLOR_VIOLET );
                this.createBlock( 0, 0, 9, 12, PS.COLOR_BLACK );
                this.createBlock( 0, 0, 8, 11, PS.COLOR_WHITE );
                this.createBlock( 0, 0, 5, 4, PS.COLOR_ORANGE );
                this.createBlock( 0, 0, 8, 5, PS.COLOR_WHITE );
                this.createBlock( 0, 0, 8, 13, PS.COLOR_WHITE );
                this.createBlock( 0, 0, 13, 8, PS.COLOR_WHITE );
                this.createBlock( 0, 0, 6, 9, PS.COLOR_GRAY_LIGHT );
            }
            if( level > 0 ){
                this.updateArrows();
            }
            timer = null;
         /*   PS.audioPlayChannel(currentSong, {voliume: 0.25, loop: true, path: "PuzzleAudio/"});
            PS.debug(currentSong);
            PS.debug("");*/
        }

    }


} () )

PS.init = function( system, options ) {

    PS.audioLoad( "correct", {path: "PuzzleAudio/"} );
    PS.audioLoad( "inverse", {path: "PuzzleAudio/"} );
    PS.audioLoad( "swap", {path: "PuzzleAudio/"} );
    PS.audioLoad( "error", {path: "PuzzleAudio/"} );
    PS.audioLoad( "fx_click" );
    PS.audioLoad( "bounce", {path: "PuzzleAudio/"} );
    PS.audioLoad( "death", {path: "PuzzleAudio/"} );
    PS.audioLoad( "collision", {path: "PuzzleAudio/"} );
    PS.audioLoad( "beep0", {path: "PuzzleAudio/"});
    PS.audioLoad( "beep1", {path: "PuzzleAudio/"});
    PS.audioLoad( "beep2", {path: "PuzzleAudio/"});
    PS.audioLoad( "beep3", {path: "PuzzleAudio/"});
    PS.audioLoad( "beep4", {path: "PuzzleAudio/"});
    PS.audioLoad( "beep5", {path: "PuzzleAudio/"});
    PS.audioLoad( "beep6", {path: "PuzzleAudio/"});
    PS.audioLoad( "ChillBeat", {path: "PuzzleAudio/"});

    PS.audioPlay( "ChillBeat", {path: "PuzzleAudio/", volume: 0.10, loop: true});

    currentSong = musicChannels[0];

    level = 8;
    Game.makeLevel();

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

PS.touch = function( x, y, data, options ) {
    if( level == 0 ){
        if( x == 0 && y == 0 ){
            PS.audioPlay( "fx_click", { volume: .25} );
            level = 1;
            Game.makeLevel();
        }
        else if( x == 2 && y == 0 ){
            PS.audioPlay( "fx_click", { volume: .25} );
            level = 2;
            Game.makeLevel();
        }
        else if( x == 4 && y == 0 ){
            PS.audioPlay( "fx_click", { volume: .25} );
            level = 3;
            Game.makeLevel();
        }
        else if( x == 6 && y == 0 ){
            PS.audioPlay( "fx_click", { volume: .25} );
            level = 4;
            Game.makeLevel();
        }
        else if( x == 8 && y == 0 ){
            PS.audioPlay( "fx_click", { volume: .25} );
            level = 5;
            Game.makeLevel();
        }
        else if(hasBeenUnlocked && (x == 3 || x == 5 && y == 1)){
            if( x == 3 && y == 1){
                PS.audioPlay( "fx_click", { volume: .25} );
                level = 6;
                Game.makeLevel();
            }
            if( x == 5 && y == 1){
                PS.audioPlay( "fx_click", { volume: .25} );
                level = 7;
                Game.makeLevel();
            }
        }
        else if(finalHasBeenUnlocked){
            if( x == 4 && y == 2){
                PS.audioPlay( "fx_click", { volume: .25} );
                level = 8;
                Game.makeLevel();
            }
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

PS.release = function( x, y, data, options ) {
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

PS.enter = function( x, y, data, options ) {
    if( level == 0 ){
        if( x == 0 && y == 0){
            PS.color( x, y, PS.COLOR_VIOLET );
            PS.statusText("LEVEL 1");
        }
        else if( x == 2 && y == 0 ){
            PS.color( x, y, PS.COLOR_VIOLET );
            PS.statusText("LEVEL 2");
        }
        else if( x == 4 && y == 0 ){
            PS.color( x, y, PS.COLOR_VIOLET );
            PS.statusText("LEVEL 3");
        }
        else if( x == 6 && y == 0 ){
            PS.color( x, y, PS.COLOR_VIOLET );
            PS.statusText("LEVEL 4");
        }
        else if( x == 8 && y == 0 ){
            PS.color( x, y, PS.COLOR_VIOLET );
            PS.statusText("LEVEL 5");
        }
        else if(hasBeenUnlocked && (x == 3 || x == 5 && y == 1)){
            if( x == 3 && y == 1){
                PS.color( x, y, PS.COLOR_VIOLET );
                PS.statusText("LEVEL 6");
            }
            if( x == 5 && y == 1){
                PS.color( x, y, PS.COLOR_VIOLET );
                PS.statusText("LEVEL 7");
            }
        }
        else if(finalHasBeenUnlocked && x == 4 && y == 2){
            PS.color( x, y, PS.COLOR_VIOLET );
            PS.statusText("LEVEL 8");
        }
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

PS.exit = function( x, y, data, options ) {
    if( level == 0 ){
        if( x == 0 || x == 2 || x == 4 || x == 6 || x == 8 && y == 0){
            if(x == 0 && complete1){
                PS.color( 0, 0, PS.COLOR_GREEN);
            }
            else if(x == 2 && complete2){
                PS.color(2, 0, PS.COLOR_GREEN);
            }
            else if(x == 4 && complete3){
                PS.color(4, 0, PS.COLOR_GREEN);
            }
            else if(x == 6 && complete4){
                PS.color(6, 0, PS.COLOR_GREEN);
            }
            else if(x == 8 && complete5){
                PS.color(8, 0, PS.COLOR_GREEN);
            }
            else{
                PS.color( x, y, PS.COLOR_WHITE );
            }
        }
        else if(hasBeenUnlocked && (x == 3 || x == 5 && y == 1)){
            if( x == 3 && y == 1 && complete6){
                PS.color( x, y, PS.COLOR_GREEN );
            }
            else if( x == 5 && y == 1 && complete7){
                PS.color( x, y, PS.COLOR_GREEN );
            }
            else{
                PS.color( x, y, PS.COLOR_WHITE );
            }
        }
        if(finalHasBeenUnlocked && x == 4 && y == 2) {
            if (complete8) {
                PS.color(x, y, PS.COLOR_GREEN);
            }
            else{
                PS.color( x, y, PS.COLOR_WHITE );
            }
        }
        else{
            //PS.debug(finalHasBeenUnlocked + " x: " + x + " y: " + y);
        }
        PS.statusText("LEVEL SELECT");
        if(complete1 && complete2 && complete3 && complete4 && complete5 & complete6 && complete7 && complete8){
            PS.statusText("ALL LEVELS COMPLETE!")
        }
    }
};

/*
PS.exitGrid ( options )
Called when the mouse cursor/touch exits the grid perimeter.
This function doesn't have to do anything. Any value returned is ignored.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.exitGrid = function( options ) {
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

PS.keyDown = function( key, shift, ctrl, options ) {
    if( level != 0) {
        if ( !gameover && !passLevel && key >= 1005 && key <= 1008 ) {
            Game.check(key);
            Game.highlightArrow(key);
        }
    }
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

PS.keyUp = function( key, shift, ctrl, options ) {
    if( level != 0) {
        if (!gameover && key >= 1005 && key <= 1008) {
            Game.unHLArrow(key);
        }
    }
};

/*
PS.input ( sensors, options )
Called when a supported input device event (other than those above) is detected.
This function doesn't have to do anything. Any value returned is ignored.
[sensors : Object] = A JavaScript object with properties indicating sensor status; see API documentation for details.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
NOTE: Currently, only mouse wheel events are reported, and only when the mouse cursor is positioned directly over the grid.
*/

PS.input = function( sensors, options ) {
	// Uncomment the following code lines to inspect first parameter:

//	 var device = sensors.wheel; // check for scroll wheel
//
//	 if ( device ) {
//	   PS.debug( "PS.input(): " + device + "\n" );
//	 }

	// Add code here for when an input event is detected.
};

