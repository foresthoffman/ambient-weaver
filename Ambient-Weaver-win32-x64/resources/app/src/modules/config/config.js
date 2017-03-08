var utils = require( 'utils' );
var Track = require( 'track' );

/**
 * Creates an object structure that is intended to hold a list of tracks for a playlist and general
 * options.
 *
 * @see Track
 *
 * @param float  volume Optional. The master volume.
 * @param array  tracks Optional. The array of Track objects.
 */
function Config( volume, tracks ) {

	// defaults
	this.volume = 1.0;
	this.tracks = [];

	if ( 'undefined' !== typeof volume ) {
		this.set_volume( volume );
	}

	if ( 'undefined' !== typeof tracks ) {
		for ( var i = 0; i < tracks.length; i++ ) {
			if ( 'undefined' !== tracks[ i ].title && 'undefined' !== tracks[ i ].title ) {
				var src_dir = '';
				if ( tracks[ i ].src ) {
					src_dir = tracks[ i ].src.slice( 0, -( tracks[ i ].title.length + 1 ) );
				}
				this.add_track( tracks[ i ].title, src_dir, tracks[ i ].options );
			}
		}
	}
}

/**
 * Sets the config's master volume.
 *
 * @param float volume The volume.
 */
Config.prototype.set_volume = function( volume ) {
	if ( 'undefined' === typeof volume || null === volume || volume < 0 || volume > 1 ) {
		console.error( 'Config: set_volume() expects volume to be a float in range [0,1].' );
		return;
	}

	this.volume = volume;
};

/**
 * Adds a Track object to the config.
 *
 * @param string title   The title.
 * @param string src_dir Optional. The source directory path.
 * @param object options Optional. Track options.
 */
Config.prototype.add_track = function( title, src_dir, options ) {
	if ( 'undefined' === typeof title || null === title || '' === title ) {
		console.error( 'Config: add_track() expects title to be a non-empty string.' );
		return;
	}

	var the_track = this.get_track( title );
	if ( ! the_track ) {

		// fixes a mocha+node testing issue
		if ( 'undefined' === typeof src_dir && 'undefined' !== typeof window ) {
			src_dir = window.controller.tracks_dir;
		}

		var track = new Track( title, src_dir, options );
		if ( null !== track ) {
			this.tracks.push( track );
		}
	}
};

/**
 * Removes a Track object from the config.
 *
 * @param string title The title.
 */
Config.prototype.remove_track = function( title ) {
	if ( 'undefined' === typeof title || null === title || '' === title ) {
		console.error( 'Config: remove_track() expects title to be a non-empty string.' );
		return;
	}

	var the_track = this.get_track( title );
	if ( ! the_track ) {
		console.error( 'Config: remove_track() attempted to remove non-existent track.' );
		return;
	}

	for ( var i = 0; i < this.tracks.length; i++ ) {
		if ( title === this.tracks[ i ].title ) {
			delete this.tracks[ i ];
			this.tracks = utils.arr_vals( this.tracks );
		}
	}
};

/**
 * Edits a Track object in the config. Calls 'add_track' if the track doesn't exist.
 *
 * @param string title   The title of the track.
 * @param string src_dir The source directory path.
 * @param object options Optional. The options for the track.
 */
Config.prototype.edit_track = function( title, src_dir, options ) {
	if ( 'undefined' === typeof title || null === title || '' === title ) {
		console.error( 'Config: edit_track() expects title to be a non-empty string.' );
		return;
	}

	var the_track = this.get_track( title );
	if ( ! the_track ) {

		// creates the non-existent track
		this.add_track( title, src_dir, options );
	} else {
		the_track.set_title( title );
		the_track.set_options( options );
	}
};

/**
 * Gets a track from the config.
 *
 * @param  string title The title of the track.
 * @return object|null The track, if it exists. Null otherwise.
 */
Config.prototype.get_track = function( title ) {
	if ( 'undefined' === typeof title || null === title || '' === title ) {
		console.error( 'Config: get_track() expects title to be a non-empty string.' );
		return null;
	}

	for ( var i = 0; i < this.tracks.length; i++ ) {
		if ( title === this.tracks[ i ].title ) {
			return this.tracks[ i ];
		}
	}

	return null;
};

module.exports = Config;
