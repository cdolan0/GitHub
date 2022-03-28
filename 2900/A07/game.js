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
const WIDTH = 21;
const HEIGHT = 23;

//If harpsichord is unlocked
var UNLOCKED = false;

(function () {
	//Color Index
	var color;

	//Note Index
	var note = 14;

	//Selected instrument
	var instrument = "piano";

	//If Horizontal Mirror is On
	var horizMirror = false;

	//If Vertical Mirror is On
	var vertMirror = false;

	Game = {
		click : function ( x, y, data ) {
			this.drag = true;
			//If on bottom row
			if ( y == 21 ){
				this.selectNoteColor(x, y);
				this.drag = false;
			}
			else if ( UNLOCKED && y >= 21){
				this.selectNoteColor(x, y);
				this.drag = false;
			}
			//If horizontal mirroring is on and not vertical mirroring
			else if (horizMirror && !vertMirror) {
				//If in top half
				if (y <= 9) {
					//Plays Note
					this.playNote();
					//Draw
					this.trueColor = this.getColor();
					PS.color(x, y, this.getColor());
					PS.color(x, this.getInverse(y), this.getColor());
				}
			}
			//If horizontal mirroring is not on and vertical mirroring is
			else if (!horizMirror && vertMirror) {
				//If in left half
				if ( x <= 9 ) {
					//Plays Note
					this.playNote();
					//Draw
					this.trueColor = this.getColor();
					PS.color(x, y, this.getColor());
					PS.color(this.getInverse(x), y, this.COLORS[color]);

				}
			}
			//If both are on
			else if (horizMirror && vertMirror) {
				//If in left half and top half
				if (x <= 9 && y <= 9) {
					//Plays Note
					this.playNote();
					//Draw
					this.trueColor = this.getColor();
					PS.color(x, y, this.getColor());
					PS.debug
					PS.color(this.getInverse(x), this.getInverse(y), this.getColor());
					PS.color( x, this.getInverse(y), this.getColor);
					PS.color(this.getInverse(x), y, this.getColor);
				}
			}
			//If both off
			else {
				//Plays Note
				this.playNote();
				//Draw
				this.trueColor = this.getColor();
				PS.color(x, y, this.getColor());
			}

		},

		selectNoteColor : function( x, y ){
			color = x;
			//Selected Horizontal Mirror
			if( y == 21 ){
				instrument = "piano";
			}
			else if( UNLOCKED && y == 22 ){
				instrument = "harpsichord";
			}
			if( x == 18 ){
				if(horizMirror == true){
					horizMirror = false;
					//Remove Axis
					for( var i = 0; i < 10; i+= 1 ){
						PS.border(i, 10, 0);
					}
					for( var i = 11; i < 21; i+= 1 ){
						PS.border(i, 10, 0);
					}
					//Remove X's without getting rid of other mirror's X's
					if(vertMirror){
						for( var i = 0; i < 11; i+= 1 ){
							for( var j = 11; j < 21; j+= 1 ){
								PS.glyph( i, j, "" );
							}
						}
					}
					else{
						for( var i = 11; i < 21; i+= 1 ){
							PS.glyph( PS.ALL, i, "" );
						}
						//Get rid of middle square
						PS.border(10, 10, 0);
					}
					PS.fade( PS.ALL, PS.ALL , 60); //Add fader back in
				}
				//Add X's and Axis
				else{
					PS.fade( PS.ALL, PS.ALL , 0); //Turn Fader Off
					horizMirror = true;
					PS.border(PS.ALL, 10, 1);
					for( var i = 11; i < 21; i+= 1 ){
						PS.glyph( PS.ALL, i, "X" );
						PS.glyphColor( PS.ALL, i, PS.COLOR_RED)
					}
				}
			}
			//Selected Vertical Mirror
			else if( x == 19 ){
				if(vertMirror == true){
					vertMirror = false;
					//Remove Axis
					for( var i = 0; i < 10; i+= 1 ){
						PS.border(10, i, 0);
					}
					for( var i = 11; i < 21; i+= 1 ){
						PS.border(10, i, 0);
					}
					//Remove X's
					if(horizMirror){
						for( var i = 11; i < 21; i+= 1 ){
							for( var j = 0; j < 11; j+= 1 ){
								PS.glyph( i, j, "" );
							}
						}
					}
					else{
						for( var i = 11; i < 21; i+= 1 ){
							for( var j = 0; j < 21; j+= 1 ){
								PS.glyph( i, j, "" );
							}
						}
						PS.border(10, 10, 0);
					}
					PS.fade( PS.ALL, PS.ALL , 60); //Add fader back in
				}
				else{
					PS.fade( PS.ALL, PS.ALL , 0); //Turn Fader Off
					vertMirror = true;
					//Add Axis
					for( var i = 0; i < 21; i+= 1 ){
						PS.border(10, i, 1);
					}
					//Add X's
					for( var i = 11; i < 21; i+= 1 ){
						for( var j = 0; j < 21; j+= 1 ){
							PS.glyph( i, j, "X" );
							PS.glyphColor( i, j, PS.COLOR_RED)
						}
					}
				}
			}
			//Selected Remove
			else if( x == 20 ){
				for( var i = 0; i < 21; i+= 1 ){
					PS.color(PS.ALL, i, PS.COLOR_WHITE);
					this.drag = false;
				}
				this.trueColor = PS.COLOR_WHITE;
			}
			else if ( x < 18){
				note = x;
				this.playNote()
			}
		},

		//Plays Note
		playNote : function(){
			if( instrument == "piano"){
				PS.audioPlay(PS.piano((note*3)));
			}
			else if ( instrument == "harpsichord" ){
				PS.audioPlay(PS.harpsichord((note*3)));
			}
		},

		//Returns Color Code of Current Color and Instrument
		getColor : function(){
			if( instrument == "piano" ){
				return this.COLORS_PIANO[color];
			}
			else if ( instrument == "harpsichord"){
				return this.COLORS_HARP[color];
			}
		},

		// Returns a Number Flipped over An Axis
		getInverse : function(num){
			return (Math.abs(num - 10 ) + 10 );
		},

		unlock : function(){
			var i;
			var color = PS.COLOR_WHITE;
			var harp_x = WIDTH - 1;
			var harp_y = HEIGHT - 1;
			for ( i = 0; i < harp_x; i += 1 ) {
				color = Game.COLORS_HARP[i];
				PS.color(i, harp_y, color); // set visible color
				PS.data(i, harp_y, color); // also store color as bead data
			}
			UNLOCKED = true;
		},

		COLORS_PIANO: [
			0xe32b2b, 0xe3562b, 0xe36f2b,  0xe3b52b, 0xafe32b, 0x3ee32b,
			0x2be3c7, 0x2bbbe3, 0x2b50e3, 0x722be3, 0xbe2be3, 0xe32b78,
			0xfa8282, 0xb87c37, 0xffffff, 0xadadad, 0x4a4a4a, 0x000000
		],
		
		COLORS_HARP: [
			0xff4a4a, 0xff744a, 0xff984a, 0xffd54a, 0xe1ff4a, 0x77ff4a,
			0x4affc6, 0x4ac3ff, 0x4a53ff, 0x894aff,	0xb44aff, 0xff4a7a,
			0xffabab, 0xb06d46, 0x3b1600, 0xdedede, 0x969696, 0x2e2e2e
		],

		trueColor: PS.COLOR_WHITE,
		FILL_KEY: 102,
		drag: false,

	}

} () )


PS.init = function( system, options ) {
	PS.audioLoad( "fx_ding" );
	PS.gridSize( WIDTH, HEIGHT );
	PS.statusColor( PS.COLOR_WHITE );
	PS.statusText( "Draw with Music!" );

	// Add any other initialization code you need here.

	PS.border( PS.ALL, PS.ALL, 0 );
	PS.gridColor( PS.COLOR_BLACK );

	// set up reset button
	PS.glyph( 20, 21, "X" );
	PS.glyphColor( 19, 20, PS.COLOR_BLACK );

	// set up horizontal symmetry button
	PS.glyph( 18, 21, "▀" );

	// set up vertical symmetry button
	PS.glyph( 19, 21, "▐" );

	var i;
	var color = PS.COLOR_WHITE;
	var piano_x = WIDTH - 2;
	var piano_y = HEIGHT - 2;
	var harp_x = WIDTH - 1;
	var harp_y = HEIGHT - 1;
	for ( i = 0; i < piano_x; i += 1 ) {
		color = Game.COLORS_PIANO[i];
		PS.color(i, piano_y, color); // set visible color
		PS.data(i, piano_y, color); // also store color as bead data
	}

	PS.color(PS.ALL, harp_y, PS.COLOR_BLACK); // set visible color
	PS.data(PS.ALL, harp_y, PS.COLOR_BLACK); // also store color as bead data
	PS.fade( PS.ALL, 22 , 60); //Fade colors in
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
	Game.click( x, y, data);
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
	Game.drag = false;
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
	if( y >= 21 ){
		//Vertical Mirror
		if( x == 18){
			PS.statusText("Mirror Along X Axis");
		}
		//Horizontal Mirror
		if (x == 19){
			PS.statusText("Mirror Along Y Axis");
		}
		if( x == 20){
			PS.statusText("Remove");
		}else{
			PS.statusText("Select a color");
		}
	}
	else {
		PS.statusText( "Click to paint a pixel, press F to fill the canvas." );
		Game.trueColor = PS.color( x, y );
		PS.color( x, y, Game.getColor() );
		if ( Game.drag ) {
			//Game.trueColor = Game.getColor();
			Game.click( x, y );
		}
		else {
			Game.drag = false;
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
	if( y < 21 ) {
		PS.color(x, y, Game.trueColor);
	}
};

/*
PS.exitGrid ( options )
Called when the mouse cursor/touch exits the grid perimeter.
This function doesn't have to do anything. Any value returned is ignored.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.exitGrid = function( options ) {
	PS.statusText("Draw With Music!");
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

	var i;
	var lasty = HEIGHT - 2;

	if( key == Game.FILL_KEY ) {
		for (i = 0; i < lasty; i++) {
			PS.color( PS.ALL, i, Game.getColor() );
			Game.trueColor = Game.getColor();
			//Only play notes if unlocked before
			if(UNLOCKED) {
				Game.playNote();
			}
		}
		if(!UNLOCKED){
			Game.unlock();
			PS.audioPlay( "fx_ding" );
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

