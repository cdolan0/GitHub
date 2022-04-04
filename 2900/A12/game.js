/*
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

const OBSTACLES = [PS.COLOR_BLACK, PS.COLOR_GRAY_DARK];

(function (){

    // 1 = left, 2 = up, -1 = right, -2 = down
    var direction;

    gameover = false;

    inverted = false;

    mX = 10;
    mY = 10;

    var timer = null; //set up timer
    var count = 3; // countdown value

    // Timer function

    var tick = function () {

        //Check if gameover
        if ( gameover == true ) {
            count -= 1;
            //After 3 seconds return to level select
            if (count <= 0){
                timer = null;
                gameover = false
                count = 3;
                level = 0;
                Game.makeLevel();
            }
        }
    };


    Game = {
        createBlock( w, h, x, y, color){
            for(var i = x; i <= (x+w); i += 1){
                for(var j = y; j <= (y+h); j += 1){
                    PS.color( i, j, color );
                    PS.data( i, j, color );
                }
            }
        },
        check(key){
            var data;
            //Left
            if(key == 1005){
                direction = 1;
                data = PS.data(pX-1, pY);
            }
            //Up
            else if(key == 1006){
                direction = 2;
                data = PS.data(pX, pY-1);
            }
            //Right
            else if(key == 1007){
                direction = -1;
                data = PS.data(pX+1, pY);
            }
            //Down
            else if(key == 1008){
                direction = -2;
                data = PS.data(pX, pY+1);
            }

            if( data != PS.COLOR_BLUE && !OBSTACLES.includes(data)){
                this.movePlayer();
                this.moveMirror();
            }
            PS.color(pX, pY, PS.COLOR_RED);
            PS.radius(pX, pY, 50);
            if( data == PS.COLOR_GREEN ){
                this.unlock();
            }
            if( data == PS.COLOR_ORANGE ){
                PS.data(pX, pY, PS.COLOR_WHITE);
                if(inverted){
                    inverted = false;
                }
                else{
                    inverted = true;
                }
            }
            if( data == PS.COLOR_RED){
                PS.radius( pX, pY, 0);
                this.GameOver();
            }
            //If merged
            if(mX == pX && mY == pY){
                PS.color(mX, mY, PS.COLOR_VIOLET);
                PS.statusText("LEVEL COMPLETE");
                PS.statusColor(PS.COLOR_BLACK);
                level++
                this.makeLevel();
            }
        },
        movePlayer(){
            this.clearArrows();
            //Left
            if(direction == 1 && (pX) != 0){
                pX = pX-1;
                PS.color( pX+1, pY, PS.COLOR_WHITE);
                PS.radius( pX+1, pY, 0);
            }
            //Right
            else if(direction == -1 && (pX + 1) < WIDTH){
                pX = pX+1;
                PS.color( pX - 1, pY, PS.COLOR_WHITE);
                PS.radius( pX, pY, 0);
            }
            //Up
            else if(direction == 2 && (pY) != 0){
                pY = pY - 1;
                PS.color( pX, pY + 1, PS.COLOR_WHITE);
                PS.radius( pX, pY + 1, 0);
            }
            //Down
            else if(direction == -2 && (pY + 1) < HEIGHT){
                pY = pY + 1;
                PS.color( pX, pY - 1, PS.COLOR_WHITE);
                PS.radius( pX, pY - 1, 0);
            }
            PS.color( pX, pY, PS.COLOR_RED);
            PS.radius( pX, pY, 50);
            this.updateArrows();
        },

        clearArrows(){
            if((pX) != 0){
                PS.glyph(pX - 1, pY, "");
            }
            if((pX + 1) < WIDTH){
                PS.glyph(pX + 1, pY, "");
            }
            if((pY) != 0){
                PS.glyph(pX, pY - 1, "");
            }
            if((pY + 1) < HEIGHT) {
                PS.glyph(pX, pY + 1, "");
            }
        },

        updateArrows(){
            if((pX) != 0){
                PS.glyph(pX - 1, pY, "<");
            }
            if((pX + 1) < WIDTH){
                PS.glyph(pX + 1, pY, ">");
            }
            if((pY) != 0){
                PS.glyph(pX, pY - 1, "^");
            }
            if((pY + 1) < HEIGHT) {
                PS.glyph(pX, pY + 1, "v");
            }
        },

        highlightArrow(key){
            //Left
            if(key == 1005 && (pX) != 0){
               PS.glyphColor(pX-1, pY, PS.COLOR_GREEN);
            }
            //Up
            else if(key == 1006 && (pY) != 0){
                PS.glyphColor(pX, pY-1, PS.COLOR_GREEN);
            }
            //Right
            else if(key == 1007 && (pX + 1) < WIDTH){
                PS.glyphColor(pX+1, pY, PS.COLOR_GREEN);
            }
            //Down
            else if(key == 1008 && (pY + 1) < HEIGHT){
                PS.glyphColor(pX, pY+1, PS.COLOR_GREEN);
            }
        },

        unHLArrow(key){
            //Left
            if(key == 1005 && (pX) != 0){
                PS.glyphColor(pX-1, pY, PS.COLOR_BLACK);
            }
            //Up
            else if(key == 1006 && (pY) != 0){
                PS.glyphColor(pX, pY-1, PS.COLOR_BLACK);
            }
            //Right
            else if(key == 1007 && (pX + 1) < WIDTH){
                PS.glyphColor(pX+1, pY, PS.COLOR_BLACK);
            }
            //Down
            else if(key == 1008 && (pY + 1) < HEIGHT){
                PS.glyphColor(pX, pY+1, PS.COLOR_BLACK);
            }
        },

        moveMirror(){
            //Mirror direction
            var mDir = direction;
            var nextBead;
            if(inverted){
                mDir= direction * -1;
            }
            //Left
            if(mDir == 1 && (mX) != 0) {
                nextBead = PS.data(mX - 1, mY);
                if(nextBead != PS.COLOR_RED && !OBSTACLES.includes(nextBead)){
                    mX = mX - 1;
                    PS.color(mX, mY, PS.COLOR_BLUE);
                    PS.radius(mX, mY, 50);

                    PS.color(mX + 1, mY, PS.COLOR_WHITE);
                    PS.radius(mX + 1, mY, 0);
                }
            }
            //Right
            else if(mDir == -1 && (mX + 1) < WIDTH) {
                nextBead = PS.data(mX + 1, mY);
                if(nextBead != PS.COLOR_RED && !OBSTACLES.includes(nextBead)){
                    mX = mX + 1;
                    PS.color(mX, mY, PS.COLOR_BLUE);
                    PS.radius(mX, mY, 50);

                    PS.color(mX - 1, mY, PS.COLOR_WHITE);
                    PS.radius(mX - 1, mY, 0);
                }
            }
            //Up
            else if(mDir == 2 && (mY) != 0) {
                nextBead = PS.data(mX, mY - 1);
                if(nextBead != PS.COLOR_RED && !OBSTACLES.includes(nextBead)){
                    mY = mY - 1;
                    PS.color(mX, mY, PS.COLOR_BLUE);
                    PS.radius(mX, mY, 50);

                    PS.color(mX, mY + 1, PS.COLOR_WHITE);
                    PS.radius(mX, mY + 1, 0);
                }
            }
            //Up
            else if ((mY + 1) < HEIGHT){
                nextBead = PS.data(mX, mY + 1);
                if(nextBead != PS.COLOR_RED && !OBSTACLES.includes(nextBead)){
                    mY = mY + 1;
                    PS.color(mX, mY, PS.COLOR_BLUE);
                    PS.radius(mX, mY, 50);

                    PS.color(mX, mY - 1, PS.COLOR_WHITE);
                    PS.radius(mX, mY - 1, 0);
                }
            }

            if( nextBead == PS.COLOR_GREEN ){
                this.unlock();
            }

            //If In Blue
            if(nextBead == PS.COLOR_BLUE){
                PS.radius(mX, mY, 0);
                this.GameOver();
            }

            if( nextBead == PS.COLOR_ORANGE ){
                PS.data(mX, mY, PS.COLOR_WHITE);
                if(inverted){
                    inverted = false;
                }
                else{
                    inverted = true;
                }
            }
        },

        unlock(){
            PS.data(pX, pY, PS.COLOR_WHITE);
            for(var i = 0; i < WIDTH; i += 1){
                for(var j = 0; j < HEIGHT; j += 1){
                    if(PS.data( i,  j ) == PS.COLOR_GRAY_DARK){
                        PS.color( i, j, PS.COLOR_WHITE );
                        PS.data( i, j, PS.COLOR_WHITE);
                    }
                }
            }
        },

        GameOver(){
            PS.statusText("Game Over");
            PS.statusColor(PS.COLOR_BLACK);
            this.clearArrows();
            gameover = true;
        },

        makeLevel(){
            if ( timer == null ){
                timer = PS.timerStart (60, tick);
            }
            else{
                timer = null;
                timer = PS.timerStart (60, tick);
            }
            if( level == 0 ){
                PS.gridSize( 10, 1 );
                PS.data(PS.ALL, PS.ALL, PS.COLOR_WHITE);
                PS.statusColor( PS.COLOR_BLACK );
                PS.border(PS.ALL, PS.ALL, 0);
                PS.statusText( "LEVEL SELECT" );
                PS.glyph( 1, 0, "1");
                PS.glyph( 3, 0, "2");
                PS.glyph( 5, 0, "3");
                PS.glyph( 7, 0, "4");

                PS.border( 1, 0, 1);
                PS.border( 3, 0, 1);
                PS.border( 5, 0, 1);
                PS.border( 7, 0, 1);
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
                this.createBlock( 5, 0, 8, 7, PS.COLOR_GRAY_DARK );
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
                this.createBlock( 0, 2, 6, 11, PS.COLOR_GRAY_DARK );
                this.createBlock( 0, 0, 13, 1, PS.COLOR_GREEN );
                this.createBlock( 0, 0, 6, 9, PS.COLOR_WHITE );
            }
            if( level == 4 ){
                PS.gridSize( WIDTH, HEIGHT );
                PS.data(PS.ALL, PS.ALL, PS.COLOR_WHITE);
                PS.statusColor( PS.COLOR_VIOLET );
                PS.border(PS.ALL, PS.ALL, 0);
                PS.statusText( "Level 4" );
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
                this.createBlock( 0, 3, 7, 10, PS.COLOR_GRAY_DARK );
                this.createBlock( 0, 0, 0, 7, PS.COLOR_GREEN );
                this.createBlock( 0, 0, 14, 7, PS.COLOR_BLUE );
                this.createBlock( 0, 0, 3, 1, PS.COLOR_ORANGE );
            }

        }

    }


} () )

PS.init = function( system, options ) {
    level = 0;
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
        if( x == 1 ){
            level = 1;
            Game.makeLevel();
        }
        else if( x == 3 ){
            level = 2;
            Game.makeLevel();
        }
        else if( x == 5 ){
            level = 3;
            Game.makeLevel();
        }
        else if( x == 7 ){
            level = 4;
            Game.makeLevel();
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
        if( x == 1 || x == 3 || x == 5 || x == 7){
            PS.color( x, y, PS.COLOR_VIOLET );
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
        if( x == 1 || x == 3 || x == 5 || x == 7){
            PS.color( x, y, PS.COLOR_WHITE );
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
        if (!gameover && key >= 1005 && key <= 1008) {
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

