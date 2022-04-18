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

const OBSTACLES = [PS.COLOR_BLACK];

const ENEMY_TYPES = ["eBasic, eFast, eRange, eShield"];

var pX = 0;
var pY = 0;//player x and y

var isOutOfBounds = false;

var level = 0;

var direction;

var firing = false;

var returnX, returnY;

var projectile = {
    projDir: "right",
    x: 0,
    y: 0,
    fired: false,
    destroyed: false,
};

(function () {
    var target;
    var pastProjX;
    var pastProjY;
    var firingCount = 1;
    var timer = null;

    var tick = function () {
        if(firing){
            if(firingCount == 0){
                pastProjX = projectile.x;
                pastProjY = projectile.y;
                if((projectile.projDir == "right") && (projectile.x < WIDTH-1)){
                    projectile.x = projectile.x + 1;
                }
                else if((projectile.projDir == "left") && (projectile.x != 0)){
                    projectile.x = projectile.x - 1;
                }
                else if((projectile.projDir == "up") && (projectile.y != 0)){
                    projectile.y = projectile.y - 1;
                }
                else if((projectile.projDir == "down") && (projectile.y < HEIGHT-1)){
                    projectile.y = projectile.y + 1;
                }
                PS.glyph(pastProjX, pastProjY, "");
                PS.glyph(projectile.x, projectile.y, "*");
                target = PS.data(projectile.x, projectile.y);
                if(OBSTACLES.includes(target)){
                    projectile.destroyed = true;
                    projectile.fired = false;
                    firing = false;
                }
                else if(ENEMY_TYPES.includes(target)){
                    projectile.destroyed = true;
                    projectile.fired = false;
                    firing = false;
                }
                if(projectile.destroyed){
                    PS.glyph(projectile.x, projectile.y, "*");
                }
                firingCount = 1;
            }
            firingCount -= 1;
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

        makeLevel(){
            if(timer == null){
               timer = PS.timerStart(6, tick);
            }
            pX = 3;
            pY = 3;
            PS.gridSize(WIDTH, HEIGHT);
            PS.border(PS.ALL, PS.ALL, 0);
            this.createBlock(WIDTH-1, HEIGHT-1, 0, 0, PS.COLOR_WHITE);
            this.createBlock(5,5,5,5, PS.COLOR_BLACK);
            this.createBlock(14, 0, 0, 0, PS.COLOR_BLACK);
            this.createBlock(14, 0, 0, 14, PS.COLOR_BLACK);
            this.createBlock(0, 14, 0, 0, PS.COLOR_BLACK);
            this.createBlock(0, 14, 14, 0, PS.COLOR_BLACK);
        }
    }
} () );

PS.init = function( system, options ) {
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
    if(!firing){
        projectile.x = x;
        projectile.y = y;
        projectile.projDir = direction;
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
	var nextBead = PS.data(x,y);
    var pastX = pX;
    var pastY = pY;
    pX = x;
    pY = y;
    if ((!OBSTACLES.includes(nextBead)) && (!ENEMY_TYPES.includes(nextBead)) && !isOutOfBounds){
        PS.color(pX, pY, PS.COLOR_BLUE);
        PS.radius(pX, pY, 50);
        PS.color(pastX, pastY, PS.data(pastX, pastY));
        PS.radius(pastX, pastY, 0);
        if(pastX - pX < 0){
            direction = "right";
            PS.glyph(pX, pY, ">");
        }
        else if(pastX - pX > 0){
            direction = "left";
            PS.glyph(pX, pY, "<");
        }
        else if(pastY - pY < 0){
            direction = "down";
            PS.glyph(pX, pY, "v");
        }
        else if(pastY - pY > 0){
            direction = "up";
            PS.glyph(pX, pY, "^");
        }
        PS.glyph(pastX, pastY, "");
    }
    else if(OBSTACLES.includes(nextBead) && !isOutOfBounds){
        isOutOfBounds = true;
        PS.fade(PS.ALL, PS.ALL, 15);
        PS.color(PS.ALL, PS.ALL, PS.COLOR_BLACK);
        PS.color(pastX, pastY, PS.COLOR_GREEN);
        returnX = pastX;
        returnY = pastY;
    }
    else if(returnX == pX && returnY == pY && isOutOfBounds){
        PS.fade(PS.ALL, PS.ALL, 0);
        isOutOfBounds = false;
        for(var i = 0; i < WIDTH; i+= 1){
            for(var j = 0; j < HEIGHT; j+= 1){
                PS.color(i, j, PS.data(i, j));
            }
        }
        PS.color(returnX, returnY, PS.COLOR_BLUE);
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

