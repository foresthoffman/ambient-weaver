/**
 * Creates an object structure that holds individual track information.
 *
 * @param string title   The title of the track.
 * @param string src_dir The source directory path.
 * @param object options Optional. The options for the track.
 */
function Track( title, src_dir, options ) {

	// defaults
	this.title = '';
	this.file_type = '';
	this.src = '';
	this.options = {
		"volume"     : 1.0,
		"loop"       : true,
		"delay"      : 20,
		"duration"   : 0,
		"start_point": 0,
		"end_point"  : 0,
	};

	this.set_title( title );
	this.set_options( options );
	this.set_src( src_dir );
}

/**
 * Sets the track title.
 *
 * @param string title The title.
 */
Track.prototype.set_title = function( title ) {
	if ( 'undefined' === typeof title || null === title || '' === title ) {
		console.error( 'Track: set_title() expects title to be a non-empty string.' );
		return;
	}

	this.title = title;

	var type_regex = /\.([^.]+)$/;
	this.file_type = type_regex.exec( this.title ) ? type_regex.exec( this.title )[1] : '';
};

/**
 * Helps in the process of setting track options.
 *
 * @param object options Optional. The options for the track.
 */
Track.prototype.set_options = function( options ) {
	if ( 'undefined' !== typeof options && null !== options ) {
		if ( 'undefined' !== typeof options.volume ) {
			this.set_volume( options.volume );
		}
		if ( 'undefined' !== typeof options.loop ) {
			this.set_loop( options.loop );
		}
		if ( 'undefined' !== typeof options.delay ) {
			this.set_delay( options.delay );
		}
		if ( 'undefined' !== typeof options.duration ) {
			this.set_duration( options.duration );
		}
		if ( 'undefined' !== typeof options.start_point ) {
			this.set_start_point( options.start_point );
		}
		if ( 'undefined' !== typeof options.end_point ) {
			this.set_end_point( options.end_point );
		} else if( 'undefined' !== typeof options.duration ) {
			this.set_end_point( options.duration );
		}
	}
};

/**
 * Sets the volume property.
 *
 * @param float volume The volume.
 */
Track.prototype.set_volume = function( volume ) {
	if ( 'undefined' === typeof volume || null === volume || volume < 0 || volume > 1 ) {
		console.error( 'Track: set_volume() expects volume to be a float in range [0,1].' );
		return;
	}

	this.options.volume = volume;
};

/**
 * Sets the loop property.
 *
 * @param boolean loop Whether or not the track will loop.
 */
Track.prototype.set_loop = function( loop ) {
	if ( 'undefined' === typeof loop || null === loop || ( true !== loop && false !== loop ) ) {
		console.error( 'Track: set_loop() expects loop to be a boolean.' );
		return;
	}

	this.options.loop = loop;
};

/**
 * Sets the delay property.
 *
 * @param float delay The amount of time before the track will start.
 */
Track.prototype.set_delay = function( delay ) {
	if ( 'undefined' === typeof delay || null === delay || delay < 0 ) {
		console.error( 'Track: set_delay() expects delay to be a positive float.' );
		return;
	}

	this.options.delay = delay;
};

/**
 * Sets the duration property.
 *
 * @param float duration The length of the track, this should be set according to the
 *                       HTMLMediaElement.duration property.
 */
Track.prototype.set_duration = function( duration ) {
	if ( 'undefined' === typeof duration || null === duration || duration < 0 ) {
		console.error( 'Track: set_duration() expects duration to be a positive float.' );
		return;
	}

	this.options.duration = duration;
};

/**
 * Sets the start_point property.
 *
 * @param float start_point The amount of time from the beginning of the track, after which the
 *                          track should start.
 */
Track.prototype.set_start_point = function( start_point ) {
	if ( 'undefined' === typeof start_point || null === start_point || start_point < 0 ) {
		console.error( 'Track: set_start_point() expects end_point to be a positive float.' );
		return;
	}

	this.options.start_point = start_point;
};

/**
 * Sets the end_point property.
 *
 * @param float end_point The amount of time from the end of the track, before which the
 *                        track should stop.
 */
Track.prototype.set_end_point = function( end_point ) {
	if ( 'undefined' === typeof end_point || null === end_point || end_point < 0 ) {
		console.error( 'Track: set_end_point() expects end_point to be a positive float.' );
		return;
	}

	this.options.end_point = end_point;
};

/**
 * Sets the track's source path which will be used to populate the corresponding audio player's
 * 'src' property.
 *
 * @param string src_dir The source directory of the track.
 */
Track.prototype.set_src = function( src_dir ) {
	if ( 'undefined' === typeof src_dir || '' === src_dir ) {
		return;
	}

	this.src = src_dir + '/' + this.title;
};

/**
 * Checks the validity of an array of Track objects. All the elements should contain instances of
 * the Track class.
 *
 * @param  array   track_array The array of Track objects.
 * @return boolean True if the track array is valid, false otherwise.
 */
Track.is_valid_track_array = function( track_array ) {
	if ( 'undefined' === typeof track_array || ! ( track_array instanceof Array ) ) {
		return false;
	}

	for ( var i = 0; i < track_array.length; i++ ) {
		if ( ! ( track_array[ i ] instanceof Track ) ) {
			return false;
		}
	}

	return true;
};

module.exports = Track;
