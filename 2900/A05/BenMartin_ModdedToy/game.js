/*
game.js for Perlenspiel 3.3.x
Last revision: 2022-03-15 (BM)

/* jshint browser : true, devel : true, esversion : 6, freeze : true */
/* globals PS : true */

//Ben Martin
//MODS
/*
	1 Timer and Tick Events

	2 Random Square Will Turn Blue

	3 Upon Clicking Said Random Square A New Random Square Will Turn Blue and the Previous Square Will Turn Green

	4 Timer Updates In the Current Blue Bead

	5 Clicking on the Blue Bead Will Award you 10 * (the Current Count) Points

	6 Clicking Incorrectly on a Non-Blue Bead will Deduct 10 * (10-the Current Count) Points, Making the Game More
	Punishing as Time Goes On

	7 Changed Status to Update with Score

	8 When Time Runs Out The Current Blue Bead Will Turn Red with a "Cancel" Symbol on it, the game is now over and
	no more points can be earned or subtracted.

	9 Changed Background and Status Color

 */

var Game;
const X_MAX = 12; //Maximum Rows
const Y_MAX = 12; //Maximum Columns

(function () {
	// Private variables
	var score = 0; // game score

	var target_x = Math.floor(Math.random()* X_MAX); //Target Bead's X
	var target_y = Math.floor(Math.random()* Y_MAX); //Target Bead's Y

	var timer = null; // timer id, null if none
	var count = 0; // countdown value

	var gameOver = false;

	// Timer function

	var tick = function () {
		count -= 1;
		//Check for 0
		if ( count < 1 ) {
			PS.timerStop( timer );
			timer = null;
			PS.audioPlay( "fx_ding" );
			PS.glyph( target_x, target_y, "⃠");
			PS.glyphColor( target_x, target_y, PS.COLOR_BLACK );
			PS.color( target_x, target_y, PS.COLOR_RED );
			gameOver = true;
		}
		else {
			// Set glyph to numeral
			PS.glyph( target_x, target_y, count.toString() );
			PS.audioPlay( "fx_click" );
		}
	};


	Game = {

		target : function () {
			PS.glyph( target_x, target_y, count.toString());
			PS.glyphColor( target_x, target_y, PS.COLOR_RED );
			PS.color( target_x, target_y, PS.COLOR_BLUE);
		},

		// Start the timer if not already running

		start : function () {
			if ( !timer ) { // null if not running
				count = 10; // reset count
				timer = PS.timerStart( 100, tick );
				PS.audioPlay( "fx_ding" );
				this.target();
			}
		},

		score : function ( x, y ) {

			//Debug Code
			//PS.debug("Clicked: (" + x + ", " + y + ")");
			//PS.debug("Target: (" + target_x + ", " + target_y + ")");


			//If they clicked the right bead and game is still going
			if( ( gameOver == false ) && ( x == target_x ) && ( y == target_y )){
				var new_trgt_x = Math.floor(Math.random()* X_MAX); //Target Bead's X
				var new_trgt_y = Math.floor(Math.random()* Y_MAX); //Target Bead's Y

				PS.color( target_x, target_y, PS.COLOR_GREEN);

				//Update Score
				score += ( count * 10 );
				PS.statusText( "Score: " + score );
				//Reset Current Target Bead

				PS.glyph( target_x, target_y, );
				PS.glyphColor( target_x, target_y, PS.COLOR_WHITE );

				//Choose New Target
				target_x = new_trgt_x;
				target_y = new_trgt_y;

				this.target();
			}
			//Got it wrong
			else if (gameOver == false){
				//Subtract Score
				score -= ( ( 10 - count ) * 10 );
				PS.statusText( "Score: " + score );
			}
			else {

			}
		}
	}
}() )

"use strict"; // Do NOT remove this directive!

PS.init = function( system, options ) {
	// Establish grid dimensions

	PS.gridSize( X_MAX, Y_MAX );

	// Set background color to Black

	PS.gridColor( PS.COLOR_BLACK );

	// Change status line color and text

	PS.statusText( "Click The Blue Beads" );

	PS.statusColor( PS.COLOR_WHITE );

	// Preload click sound

	PS.audioLoad( "fx_click" );

	Game.start();
};

PS.touch = function( x, y, data, options ) {
	// Send Coordinates of Bead Touched to Game Object
	Game.score( x, y);

	// Play click sound.

	PS.audioPlay( "fx_click" );
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

