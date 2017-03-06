var utils  = require( 'utils' );
var Config = require( 'config' );
var Track  = require( 'track' );
var fs     = require( 'fs' );

/**
 * Creates an object structure to encapsulate config objects.
 *
 * @see Config
 *
 * @param string|object args The arguments for the constructor. If a string is provided, it is
 *                           assumed to be the title. If an object is provided, it will be parsed
 *                           for the respective Playlist properties.
 */
function Playlist( args ) {
	var title, config;

	if ( 'string' === typeof args && '' !== args ) {
		title = args;
	} else if ( 'object' === typeof args && null !== args ) {
		if ( 'undefined' !== typeof args.title ) {
			title = args.title;
		}
		if ( 'undefined' !== typeof args.config ) {
			config = args.config;
		}
	}

	// defaults
	this.title = '';
	this.old_slug = '';
	this.slug = '';
	this.config = new Config();

	this.set_title( title );

	if ( 'undefined' !== typeof config ) {
		this.set_config( config );
	}
}

/**
 * Sets a playlist's title.
 *
 * @param string title The title.
 */
Playlist.prototype.set_title = function( title ) {
	if ( 'undefined' === typeof title || null === title || '' === title ) {
		console.error( 'Playlist: set_title() expects title to be a non-empty string.' );
		return;
	}

	if ( title !== this.title ) {
		this.title = title;
		this.old_slug = this.slug;
		this.slug = utils.slug( title );
	}
};

/**
 * Sets the playlists's config array.
 *
 * @param object config A config object.
 */
Playlist.prototype.set_config = function( config ) {
	if ( 'undefined' === typeof config || ! ( config instanceof Object ) ) {
		console.error( 'Playlist: set_config() expects config to be a non-empty object.' );
		return;
	}

	this.config = new Config( config.volume, config.tracks );
};

/**
 * Writes to the playlist's JSON data file.
 *
 * @param function callback Optional. The function to call upon success or failure. Errors will be
 *                          passed upon failure.
 */
Playlist.prototype.save = function( callback ) {
	var err = null;
	var self = this;
	var self_str = JSON.stringify( this );
	var old_file = '';
	if ( this.old_slug ) {
		old_file = utils.data_dir + '/' + this.old_slug + '.playlist.json';
	}
	var new_file = utils.data_dir + '/' + this.slug + '.playlist.json';

	if ( old_file ) {

		// checks for an already existing file under the previous title slug
		fs.open( old_file, 'r+', function( o_err ) {
			if ( ! o_err ) {

				// renames the already existing file
				fs.rename( old_file, new_file, function( rn_err ) {
					if ( rn_err ) {
						err = rn_err;
						if ( 'undefined' !== typeof callback && callback instanceof Function ) {
							callback( err );
						}
						return;
					}

					self.old_slug = '';
					self_str = JSON.stringify( self );

					// checks to see if the new file's content needs to be updated
					fs.readFile( new_file, 'utf8', function( r_err, data ) {
						if ( r_err ) {
							err = r_err;
							if ( 'undefined' !== typeof callback && callback instanceof Function ) {
								callback( err );
							}
							return;
						}

						// compares the current Playlist and the stored one to see if they are different;
						// if so, replaces the stored data with the current Playlist
						var json = JSON.parse( data );
						if ( ! utils.eq( json, self ) ) {
							fs.writeFile( new_file, self_str, function( w_err ) {
								if ( w_err ) {
									err = w_err;
								}

								if ( 'undefined' !== typeof callback && callback instanceof Function ) {
									callback( err );
								}
							});
						} else {
							if ( 'undefined' !== typeof callback && callback instanceof Function ) {
								callback( err );
							}
						}
					});
				});
			}
		});
	} else {

		// checks for the current file under the current title slug
		fs.open( new_file, 'r+', function( n_err ) {
			if ( n_err ) {

				// creates a fresh file, if none were found
				fs.writeFile( new_file, self_str, function( w_err ) {
					if ( w_err ) {
						err = w_err;
					}

					if ( 'undefined' !== typeof callback && callback instanceof Function ) {
						callback( err );
					}
				});
			} else {

				// updates the current file, if need be
				fs.readFile( new_file, 'utf8', function( r_err, data ) {
					if ( r_err ) {
						err = r_err;
						if ( 'undefined' !== typeof callback && callback instanceof Function ) {
							callback( err );
						}
						return;
					}

					// compares the current Playlist and the stored one to see if they are different;
					// if so, replaces the stored data with the current Playlist
					var json = JSON.parse( data );
					if ( ! utils.eq( json, self ) ) {
						fs.writeFile( new_file, self_str, function( w_err ) {
							if ( w_err ) {
								err = w_err;
							}

							if ( 'undefined' !== typeof callback && callback instanceof Function ) {
								callback( err );
							}
						});
					} else {
						if ( 'undefined' !== typeof callback && callback instanceof Function ) {
							callback( err );
						}
					}
				});
			}
		});
	}
};

/**
 * Removes the playlist's JSON data file.
 *
 * @param function callback Optional. The function to call upon success or failure. Errors will be
 *                          passed upon failure.
 */
Playlist.prototype.remove = function( callback ) {
	var err = null;
	var file = utils.data_dir + '/' + this.slug + '.playlist.json';

	fs.open( file, 'r', function( o_err ) {
		if ( o_err ) {
			if ( null !== callback && callback instanceof Function ) {
				callback( o_err );
			} else {
				console.error( o_err );
			}
			return;
		}

		// successfully opened file
		fs.unlink( file, function( ul_err ) {
			if ( ul_err ) {
				if ( null !== callback && callback instanceof Function ) {
					callback( ul_err );
				} else {
					console.error( ul_err );
				}
				return;
			}

			// successfully deleted JSON file
			if ( null !== callback && callback instanceof Function ) {
				callback( null );
			}
		});
	});
};

/**
 * Reads from the playlist's JSON data file.
 *
 * @param function callback Optional. The function to call upon success or failure. Errors will be
 *                          passed upon failure.
 */
Playlist.prototype.read = function( callback ) {
	var err = null;
	var json_str = '{}';
	var file = utils.data_dir + '/' + this.slug + '.playlist.json';

	fs.open( file, 'r', function( o_err ) {
		if ( o_err ) {
			err = o_err;
			if ( 'undefined' !== typeof callback && callback instanceof Function ) {
				callback( err, json_str );
			}
		} else {
			fs.readFile( file, 'utf8', function( r_err, data ) {
				if ( r_err ) {
					err = r_err;
					return;
				}

				json_str = data;
				if ( 'undefined' !== typeof callback && callback instanceof Function ) {
					callback( err, json_str );
				}
			});
		}
	});
};

/**
 * Checks the validity of an array of Playlist objects. All the elements should contain instances of
 * the Playlist class.
 *
 * @param  array   playlist_array The array of Playlist objects.
 * @return boolean True if the Playlist array is valid, false otherwise.
 */
Playlist.is_valid_playlist_array = function( playlist_array ) {
	if ( 'undefined' === typeof playlist_array || ! ( playlist_array instanceof Array ) ) {
		return false;
	}

	for ( var i = 0; i < playlist_array.length; i++ ) {
		if ( ! ( playlist_array[ i ] instanceof Playlist ) ) {
			return false;
		}
	}

	return true;
};

module.exports = Playlist;
