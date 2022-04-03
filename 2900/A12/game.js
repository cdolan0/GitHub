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

(function (){

    // 1 = left, 2 = up, -1 = right, -2 = down
    var direction;

    Game = {
        createBlock( w, h, x, y, color){
            for(var i = x; i <= (x+w); i += 1){
                for(var j = y; j <= (y+h); j += 1){
                    PS.color( i, j, color );
                    PS.data( i, j, color );
                }
            }
        },
        check(  x, y, data ){
            //Left
            if((pX - x) == 1){
                direction = 1
            }
            //Right
            else if((pX - x) == -1){
                direction = -1;
            }
            //Up
            else if((pY - y) == 1){
                direction = 2;
            }
            //Down
            else{
                direction = -2;
            }

            if( data != "blue"){
                this.movePlayer( x, y );
                this.moveMirror();
            }
        },
        movePlayer( x, y ){
            this.clearArrows();
            PS.color( x, y, PS.COLOR_RED);
            PS.radius( x, y, 50);
            pX = x;
            pY = y;
            //Right
            if(direction == 1){
                PS.color( x + 1, y, PS.COLOR_WHITE);
                PS.radius( x + 1, y, 0);
            }
            //Left
            if(direction == -1){
                PS.color( x - 1, y, PS.COLOR_WHITE);
                PS.radius( x - 1, y, 0);
            }
            //Up
            if(direction == 2){
                PS.color( x, y + 1, PS.COLOR_WHITE);
                PS.radius( x, y + 1, 0);
            }
            //Down
            if(direction == -2){
                PS.color( x, y - 1, PS.COLOR_WHITE);
                PS.radius( x, y - 1, 0);
            }
            this.updateArrows();
        },

        clearArrows(){
            if((pX - 1) != 0){
                PS.glyph(pX - 1, pY, "");
            }
            if((pX + 1) < WIDTH){
                PS.glyph(pX + 1, pY, "");
            }
            if((pY - 1) != 0){
                PS.glyph(pX, pY - 1, "");
            }
            if((pY + 1) < HEIGHT) {
                PS.glyph(pX, pY + 1, "");
            }
        },

        updateArrows(){
            if((pX - 1) != 0){
                PS.glyph(pX - 1, pY, "<");
            }
            if((pX + 1) < WIDTH){
                PS.glyph(pX + 1, pY, ">");
            }
            if((pY - 1) != 0){
                PS.glyph(pX, pY - 1, "^");
            }
            if((pY + 1) < HEIGHT) {
                PS.glyph(pX, pY + 1, "v");
            }
        },

        moveMirror(){

        },

        makeLevel(){
            if(level == 1){
                PS.gridSize( WIDTH, HEIGHT );
                PS.statusColor( PS.COLOR_PURPLE );
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
            if(level == 2){
                PS.gridSize( WIDTH, HEIGHT );
                PS.statusColor( PS.COLOR_PURPLE );
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
                this.createBlock( 5, 0, 8, 0, PS.COLOR_BLUE )
                this.createBlock( 0, 7, 14, 7, PS.COLOR_BLUE );
                this.createBlock( 1, 0, 5, 7, PS.COLOR_BLUE );
                this.createBlock( 0, 2, 14, 4, PS.COLOR_BLUE );
                this.createBlock( 7, 0, 7, 7, PS.COLOR_GRAY_DARK );
                this.createBlock( 0, 0, 13, 14, PS.COLOR_GRAY_LIGHT );
            }
            if(level == 3){
                PS.gridSize( WIDTH, HEIGHT );
                PS.statusColor( PS.COLOR_PURPLE );
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
                this.createBlock( 14, 0, 0,0, PS.COLOR_BLACK );
                this.createBlock( 0, 5, 0, 1, PS.COLOR_BLACK );
                this.createBlock( 0, 5, 14, 1, PS.COLOR_BLACK );
                this.createBlock( 0, 8, 7, 1, PS.COLOR_BLACK );
                this.createBlock( 0, 6, 0, 8, PS.COLOR_RED );
                this.createBlock( 5, 0, 1, 14, PS.COLOR_RED );
                this.createBlock( 4, 0, 2, 4, PS.COLOR_RED );
                this.createBlock( 0, 1, 13, 1, PS.COLOR_BLUE );
                this.createBlock( 0, 6, 14, 8, PS.COLOR_BLUE );
                this.createBlock( 5, 0, 8, 14, PS.COLOR_BLUE );
                this.createBlock( 0, 4, 7, 10, PS.COLOR_GRAY_DARK );
                this.createBlock( 0, 0, 0, 7, PS.COLOR_GRAY_LIGHT );
                this.createBlock( 0, 0, 14, 7, PS.COLOR_GRAY_LIGHT );
                this.createBlock( 0, 0, 3, 1, PS.COLOR_ORANGE );
            }
        }

    }


} () )

PS.init = function( system, options ) {
    level = 1;
    PS.border(PS.ALL, PS.ALL, 0);
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
	if( ( Math.abs(x-pX) == 1 && y == pY ) || ( Math.abs(y-pY) == 1 && x == pX ) ){
        Game.check( x, y, data );
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
	// Uncomment the following code line to inspect x/y parameters:

	// PS.debug( "PS.enter() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse cursor/touch enters a bead.
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
    /*if( key >= 37 && key <= 40 ) {
        Game.check(key);
    }*/
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

PS.input = function( sensors, options ) {
	// Uncomment the following code lines to inspect first parameter:

//	 var device = sensors.wheel; // check for scroll wheel
//
//	 if ( device ) {
//	   PS.debug( "PS.input(): " + device + "\n" );
//	 }

	// Add code here for when an input event is detected.
};

