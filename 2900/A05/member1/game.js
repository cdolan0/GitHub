/*
game.js for Perlenspiel 3.3.x
Last revision: 2022-03-15 (BM)

/* jshint browser : true, devel : true, esversion : 6, freeze : true */
/* globals PS : true */

"use strict"; // Do NOT remove this directive!

var G = ( function () {

	// set variables for the width and height of the map
	// set variable for max amount of coins

	var WIDTH = 15;
	var HEIGHT = 15;
	var TRASH_MAX = 10;

	// set variable for map, setting all beads as blank except for (14, 14)

	var map = [
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2
	];

	//function for finding avaliable floor spaces to place coins on randomly

	var find_floor = function ( item, color ) {
		var xpos, ypos, loc, data;

		do {
			xpos = PS.random( WIDTH ) - 1;
			ypos = PS.random( HEIGHT ) - 1;
			loc = ( ypos * WIDTH ) + xpos;
			data = map[ loc ]; // get map data
		} while ( data !== 0 ); // try again if the space chosen is not empty

		map[ loc ] = item; // place item
		PS.color( xpos, ypos, color ); // set color
		return { x : xpos, y : ypos }; // return x/y
	};

	//function that randomly places coins on the map

	var draw_map = function () {
		var i;

		//make the reset button on (14, 14)

		PS.color( 14, 14, 0xf03f3f );
		PS.glyph( 14, 14, "R" );

		for (i = 0; i < TRASH_MAX; i += 1) {
			find_floor(1, 0x3fe559 );
		}
	};

	var exports = {

		init : function () {

			//set up initial map

			PS.gridSize( WIDTH, HEIGHT ); //establishes grid size
			PS.color( PS.ALL, PS.ALL, 0xa1fdf5 ); //establishes grid color
			PS.border( PS.ALL, PS.ALL, 0 ); //removes borders
			PS.gridColor( 0xeadb45 ); //establishes background color
			PS.statusColor( 0xffffff ); //establishes status color
			PS.statusText( "Get the trash out of the ocean!" ); //establishes status text

			draw_map();

			// Preload sounds
			PS.audioLoad( "fx_coin3" );
			PS.audioLoad( "fx_boop" );
		}
	};

	return exports;
} () );

PS.init = G.init;

PS.touch = function( x, y ) {

	//re-establish variables and functions from the initial map so it can be reset

	var WIDTH = 15;
	var HEIGHT = 15;
	var TRASH_MAX = 10;

	var map = [
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2
	];

	var find_floor = function ( item, color ) {
		var xpos, ypos, loc, data;

		do {
			xpos = PS.random( WIDTH ) - 1;
			ypos = PS.random( HEIGHT ) - 1;
			loc = ( ypos * WIDTH ) + xpos;
			data = map[ loc ]; // get map data
		} while ( data !== 0 ); // try again

		map[ loc ] = item; // place item
		PS.color( xpos, ypos, color ); // set color
		return { x : xpos, y : ypos }; // return x/y
	};

	var reset_map = function () {
		var i;

		// Randomly place trash bags on map

		PS.color( PS.ALL, PS.ALL, 0xa1fdf5 );
		PS.color( 14, 14, 0xf03f3f );
		PS.glyph( 14, 14, "R" );

		for (i = 0; i < TRASH_MAX; i += 1) {
			find_floor(1, 0x3fe559 );
		}
	};

	// If the reset button is clicked, reset the map and play the appropriate sound
	// If any other bead is clicked, change the color to blue if it isn't already and play the appropriate sound

	if ( x == 14 && y == 14 ) {
		PS.audioPlay ( "fx_boop" );
		reset_map();
	}
	
	if (PS.color(x, y) == 0xa1fdf5) {
		PS.color( x, y, 0xa1fdf5 );
		PS.audioPlay ( "fx_drip2" );
	}

	if (PS.color(x, y) == 0x3fe559) {
		PS.color( x, y, 0xa1fdf5 );
		PS.audioPlay ( "fx_coin3" );
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

// Conor Dolan
// Zesty Bat Games
// Mod 1: Changed the grid to 15x15
// Mod 2: Changed status text color
// Mod 3: Changed status text
// Mod 4: Removed borders
// Mod 5: Changed grid color
// Mod 6: Changed background color
// Mod 7: Makes it so beads are green instead of black
// Mod 8: Changed audio sound on click to "fx_coin3"
// Mod 9: Added function to place 10 trash bags randomly
// Mod 10: Set bead (14, 14) to be red
// Mod 11: Added glyph "R" to bead (14, 14) to represent a reset button
// Mod 12: Created if/else statement that plays "fx_boop" if reset button is clicked
// Mod 13: Made it so reset button does not change color on click
// Mod 14: Made it reset button adds 10 trash bags randomly on click
// Mod 15: Made it so reset button clears existing trash bags before adding more
// Mod 16: Added if statement to play "fx_drip2" when the water is clicked
