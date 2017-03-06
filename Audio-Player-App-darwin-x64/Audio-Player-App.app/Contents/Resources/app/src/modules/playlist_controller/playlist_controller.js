var utils        = require( 'utils' );
var Playlist_Map = require( 'playlist_map' );
var Playlist     = require( 'playlist' );
var Config       = require( 'config' );
var view         = require( 'view' );
var fs           = require( 'fs' );
var path         = require( 'path' );

/**
 * Creates a singleton that provides functions for manipulating playlist data. This includes
 * tracks, configs, playlists, and playlist maps.
 */
function Playlist_Controller() {

	/**
	 * The raw array that ultimately ends up in map.json. Contains Playlist_Map
	 * instances, not Playlists.
	 */
	this.maps = [];

	// initializes the Playlist object array
	this.playlists = [];

	// initializes the list of track titles in the tracks directory
	this.track_files = [];

	// initializes the path to the tracks directory, which is used to populate the track list
	this.tracks_dir = path.resolve( __dirname, '../../../default/' );

	// tracks directory watcher
	this.track_watcher = {};
}

/**
 * Sets the current track directory.
 *
 * @param string dir The path to the track directory.
 * @return boolean True if 'tracks_dir' property was successfully updated, false otherwise.
 */
Playlist_Controller.prototype.set_tracks_dir = function( dir ) {
	if ( 'undefined' === typeof dir || 'string' !== typeof dir || dir === this.tracks_dir ) {
		return false;
	}

	var self = this;
	this.tracks_dir = dir;
	if ( 'undefined' !== typeof this.track_watcher.close ) {
		this.track_watcher.close();
	}

	this.init_tracks( function() {
		view.update_file_list( self.track_files, self.tracks_dir );
	});

	return true;
};

/**
 * Adds a playlist.
 *
 * @param string   title    The title.
 * @param arrays   config  Optional. A Config object.
 * @param function callback Optional. The function to pass to the 'Playlist.save' function.
 */
Playlist_Controller.prototype.add_playlist = function( title, config, callback ) {
	if ( 'undefined' === typeof title || null === title || '' === title ) {
		console.error( 'Playlist_Controller: add_playlist() expects title to be a non-empty ' +
			'string.' );
		return;
	}

	var self = this;
	var the_playlist = this.get_playlist( title );
	if ( ! the_playlist ) {
		var args = { title: title };

		if ( 'undefined' !== typeof config && null !== config ) {
			args.config = config;
		}

		var playlist = new Playlist( args );
		if ( null !== playlist ) {

			// appends the playlist to the playlist array
			this.playlists.push( playlist );
			playlist.save( function( err ) {

				// creates and adds a playlist map
				self.add_map( title );
				self.save_maps();
				if ( 'undefined' !== typeof callback && callback instanceof Function ) {
					callback( err );
				}
			});
		}
	} else if ( 'undefined' !== typeof callback && callback instanceof Function ) {
		callback( null );
	}
};

/**
 * Removes a playlist.
 *
 * @param string   title    The title.
 * @param function callback Optional. A call back to pass along to the 'save_maps' function.
 */
Playlist_Controller.prototype.remove_playlist = function( title, callback ) {
	if ( 'undefined' === typeof title || null === title || '' === title ) {
		console.error( 'Playlist_Controller: remove_playlist() expects title to be a non-empty ' +
			'string.' );
		return;
	}

	var self = this;

	var the_playlist = this.get_playlist( title );
	if ( ! the_playlist ) {
		console.error( 'Playlist_Controller: remove_playlist() attempted to remove non-existent ' +
			'playlist.' );
		return;
	}

	var remove_callback = function() {
		self.save_maps( callback );
	};

	this.remove_map( title );

	for ( var i = 0; i < this.playlists.length; i++ ) {
		if ( utils.slug( title ) === this.playlists[ i ].slug ) {
			this.playlists[ i ].remove( remove_callback );
			delete this.playlists[ i ];
			this.playlists = utils.arr_vals( this.playlists );
		}
	}
};

/**
 * Edits an existing playlist in the playlists array. Calls 'add_playlist' if the playlist doesn't
 * exist.
 *
 * @param string   title    The title.
 * @param object   new_data Optional. New title and/or new Config object.
 * @param function callback Optional. The function to pass to 'add_playlist'.
 */
Playlist_Controller.prototype.edit_playlist = function( title, new_data, callback ) {
	if ( 'undefined' === typeof title || null === title || '' === title ) {
		console.error( 'Playlist_Controller: edit_playlist() expects title to be a non-empty ' +
			'string.' );
		return;
	}

	var the_playlist = this.get_playlist( title );
	if ( ! the_playlist ) {

		if ( 'undefined' === typeof new_data || 'undefined' === new_data.config ) {
			new_data = null;
		}

		// creates non-existent playlist
		this.add_playlist( title, new_data, callback );

	} else if ( 'undefined' !== typeof new_data ) {

		var config_changed = false, title_changed = false;

		// updates the existing playlist's config
		if ( 'undefined' !== typeof new_data.config ) {
			the_playlist.set_config( new_data.config );
			config_changed = true;
		}

		// updates existing playlist's title, if it isn't already taken
		if ( 'undefined' !== typeof new_data.title && '' !== new_data.title ) {
			if ( ! this.get_playlist( new_data.title ) ) {
				the_playlist.set_title( new_data.title );
				this.edit_map( title, new_data.title );
				title_changed = true;
			} else if ( 'undefined' !== typeof callback && callback instanceof Function ) {
				callback( new Error( 'Playlist ' + new_data.title + ' already exists.' ) );
			}
		}

		// saves the playlist to it's data file, if there was new data
		if ( config_changed || title_changed ) {
			the_playlist.save( callback );
		}
	}
};

/**
 * Gets a playlist by title.
 *
 * @param string title The title of the Playlist that the map corresponds to.
 * @return Playlist|null The playlist, null otherwise.
 */
Playlist_Controller.prototype.get_playlist = function( title ) {
	if ( 'undefined' === typeof title || null === title || '' === title ) {
		console.error( 'Playlist_Controller: get_playlist() expects title to be a non-empty ' +
			'string.' );
		return null;
	}

	for ( var i = 0; i < this.playlists.length; i++ ) {
		if ( utils.slug( title ) === this.playlists[ i ].slug ) {
			return this.playlists[ i ];
		}
	}

	return null;
};

/**
 * Sets up playlists array property.
 */
Playlist_Controller.prototype.init_playlists = function( callback ) {
	var self = this;

	// calls add_playlist() to create a non-existent playlist, or simply adds the playlist to the
	// playlists array using the existing data
	var temp = function( err, title, json, temp_callback ) {
		if ( err ) {
			self.add_playlist( title, null, temp_callback );
		} else {

			/**
			 * add_playlist() updates the map and individual playlist JSON file. Doing so for
			 * already existing data would be redundant, so the playlist object is created here and
			 * appended to the 'playlists' array.
			 */
			var playlist = new Playlist( { title: json.title, config: json.config } );
			self.playlists.push( playlist );
			if ( 'undefined' !== typeof temp_callback && temp_callback instanceof Function ) {
				temp_callback( null );
			}
		}
	};

	var temp_final = function( err, title, json ) {
		if ( 'undefined' !== typeof callback && callback instanceof Function ) {
			temp( err, title, json, callback );
		} else {
			temp( err, title, json );
		}
	};

	if ( 0 === this.maps.length ) {
		if ( 'undefined' !== typeof callback && callback instanceof Function ) {
			callback( new Error( "Playlist_Controller: 'maps' array was empty." ) );
		}
		return;
	}

	for ( var i = 0; i < this.maps.length; i++ ) {
		var read_callback = temp;
		if ( i + 1 >= this.maps.length ) {
			read_callback = temp_final;
		}
		this.read_playlist( { title: this.maps[ i ].title, callback: read_callback } );
	}
};

/**
 * Reads a playlist's JSON data file using the playlist slug.
 *
 * @param object args An object containing the playlist title and a callback. The callback will be
 *                    passed any errors, the playlist title, and any JSON data.
 */
Playlist_Controller.prototype.read_playlist = function( args ) {
	var err = null, json = null;
	if ( 'undefined' === typeof args ) {
		err = new TypeError( 'Playlist_Controller: read_playlist() expects args to be an object.' );
		console.error( err );
		return;
	}

	if ( 'undefined' === typeof args.title || '' === args.title ||
			'undefined' === typeof args.callback || ! ( args.callback instanceof Function ) ) {
		err = new TypeError( 'Playlist_Controller: read_playlist() expects args to contain a ' +
			'title and a callback.' );
		console.error( err );
		return;
	}

	var slug = utils.slug( args.title );
	var file = utils.data_dir + '/' + slug + '.playlist.json';

	fs.open( file, 'r', function( o_err ) {
		if ( o_err ) {
			args.callback( o_err, args.title, json );
			return;
		}

		// opening the file succeeded
		fs.readFile( file, 'utf8', function( r_err, data ) {
			if ( r_err ) {
				args.callback( r_err, args.title, json );
			}

			json = JSON.parse( data );

			// reading the file succeeded
			args.callback( err, args.title, json );
		});
	});
};

/**
 * Adds a map.
 *
 * @param string|array title The title of the Playlist that the map corresponds to.
 */
Playlist_Controller.prototype.add_map = function( title ) {
	if ( 'undefined' === typeof title || null === title || '' === title ) {
		console.error( 'Playlist_Controller: add_map() expects title to be a non-empty string.' );
		return;
	}

	var the_map = null, map = null;
	if ( title instanceof Array ) {
		for ( var i = 0; i < title.length; i++ ) {
			the_map = this.get_map( title[ i ] );
			if ( ! the_map ) {
				map = new Playlist_Map( title[ i ] );
				if ( null !== map ) {
					this.maps.push( map );
				}
			}
		}
	} else {
		the_map = this.get_map( title );
		if ( ! the_map ) {
			map = new Playlist_Map( title );
			if ( null !== map ) {
				this.maps.push( map );
			}
		}
	}
};

/**
 * Removes a map.
 *
 * @param string title The title of the Playlist that the map corresponds to.
 */
Playlist_Controller.prototype.remove_map = function( title ) {
	if ( 'undefined' === typeof title || null === title || '' === title ) {
		console.error( 'Playlist_Controller: remove_map() expects title to be a non-empty string.' );
		return;
	}

	var the_map = this.get_map( title );
	if ( ! the_map ) {
		console.error( 'Playlist_Controller: remove_map() attempted to remove non-existent map.' );
		return;
	}

	for ( var i = 0; i < this.maps.length; i++ ) {
		if ( utils.slug( title ) === this.maps[ i ].slug ) {
			delete this.maps[ i ];
			this.maps = utils.arr_vals( this.maps );
		}
	}
};

/**
 * Edits a map. Calls 'add_map' when the map doesn't exist.
 *
 * @param string title     The title of the Playlist that the map corresponds to.
 * @param string new_title The new title.
 */
Playlist_Controller.prototype.edit_map = function( title, new_title ) {
	if ( 'undefined' === typeof title || null === title || '' === title ) {
		console.error( 'Playlist_Controller: edit_map() expects title to be a non-empty string.' );
		return;
	}

	var the_map = this.get_map( title );
	if ( ! the_map ) {

		// creates the non-existent map
		if ( 'undefined' !== typeof new_title ) {
			title = new_title;
		}
		this.add_map( title );
	} else {
		var index = this.maps.indexOf( the_map );
		if ( null !== the_map.set_title( new_title ) ) {
			this.save_maps();
		}
	}
};

/**
 * Gets a map by playlist.
 *
 * @param string title The title of the Playlist that the map corresponds to.
 */
Playlist_Controller.prototype.get_map = function( title ) {
	if ( 'undefined' === typeof title || null === title || '' === title ) {
		console.error( 'Playlist_Controller: get_map() expects title to be a valid string.' );
		return;
	}

	if ( 'undefined' !== typeof this.maps ) {
		for ( var i = 0; i < this.maps.length; i++ ) {
			if ( null !== this.maps[ i ] && utils.slug( title ) === this.maps[ i ].slug ) {
				return this.maps[ i ];
			}
		}
	}

	return null;
};

/**
 * Sets up the maps array and map file watcher.
 */
Playlist_Controller.prototype.init_maps = function( callback ) {
	var self = this;
	self.read_maps( function( err, data ) {
		if ( ! err ) {
			if ( 'undefined' !== typeof data ) {
				var json = JSON.parse( data );
				var title_arr = self.get_titles( json.maps );
				self.add_map( title_arr );
				self.set_tracks_dir( json.tracks_dir );
			}
		}
		if ( 'undefined' !== typeof callback && callback instanceof Function ) {
			callback( err );
		}
	});
};

/**
 * Writes to the playlist map JSON data file.
 *
 * @param function callback Optional. The function to call upon success or failure. Errors will be
 *                          passed upon failure.
 */
Playlist_Controller.prototype.save_maps = function( callback ) {
	var err = null;
	var self = this;
	var self_str = JSON.stringify( { maps: self.maps, tracks_dir: self.tracks_dir } );
	var dir = utils.data_dir;
	var file = dir + '/map.json';

	fs.open( file, 'r+', function( o_err ) {
		if ( o_err ) {
			fs.mkdir( dir, function( m_err ) {
				fs.writeFile( file, self_str, function( w_err ) {
					if ( w_err ) {
						err = w_err;
					}

					if ( 'undefined' !== typeof callback && callback instanceof Function ) {
						callback( err );
					}
				});
			});
		} else {
			fs.readFile( file, 'utf8', function( r_err, data ) {
				if ( r_err ) {
					err = r_err;
					if ( 'undefined' !== typeof callback && callback instanceof Function ) {
						callback( err );
					}
					return;
				}

				// compares the current playlist maps and the stored ones to see if they are
				// different; if so, replaces the stored data with the current maps
				var json = null;
				try {
					json = JSON.parse( data );
				} catch ( e ) {
					if ( 'undefined' !== typeof callback && callback instanceof Function ) {
						callback( e );
					}
					return;
				}

				if ( ! utils.eq( json, self_str ) ) {
					fs.writeFile( file, self_str, function( w_err ) {
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
};

/**
 * Reads from the playlist map JSON data file.
 *
 * @param function callback Optional. The function to call upon success or failure. Errors will be
 *                          passed upon failure.
 */
Playlist_Controller.prototype.read_maps = function( callback ) {
	var err = null;
	var json_str = '{}';
	var dir = utils.data_dir;
	var file = dir + '/map.json';

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
 * Sets up track file list view and directory watcher.
 *
 * @param function callback Optional. The function to call when done. Passes any errors and an array
 *                          of objects containing track names and file types.
 */
Playlist_Controller.prototype.init_tracks = function( callback ) {
	var self = this;
	this.read_tracks( { callback: function( error, tracks ) {
		if ( ! error ) {
			this.track_watcher = fs.watch( self.tracks_dir, function( event_type ) {
				if ( 'error' === event_type || 'undefined' === typeof event_type ) {
					return;
				}

				this.read_tracks();
			});
		}

		if ( 'undefined' !== typeof callback && callback instanceof Function ) {
			callback( error, tracks );
		}
	}});
};

/**
 * Reads the directory that contains the available tracks.
 *
 * @param object args Optional. Contains a path and callback function to call upon success. The
 *                    callback is passed any errors, and the data when it is successfully read. Data
 *                    is passed as a raw JSON string.
 */
Playlist_Controller.prototype.read_tracks = function( args ) {
	var self = this;
	var path, callback;
	if ( 'undefined' !== typeof args.path ) {
		path = args.path;
	}
	if ( 'undefined' !== typeof args.callback ) {
		callback = args.callback;
	}

	var dir = this.tracks_dir;
	if ( 'undefined' !== typeof path ) {
		dir = path;
	}

	// read the provided directory and get a list of files, to display on screen
	fs.readdir( dir, function( error, files ) {
		if ( error ) {
			if ( 'undefined' !== typeof callback && callback instanceof Function ) {
				callback( error, files );
			}
			return;
		}

		for ( var i = 0; i < files.length; i++ ) {
			if ( ! utils.valid_file_type( files[ i ] ) ) {

				// remove the unwatchable file from the file list
				delete files[ i ];

				// the file list's size won't automatically update, it has to be forced
				files = utils.arr_vals( files );
			}
		}

		if ( ! utils.eq( self.track_files, files ) ) {
			self.track_files = [];
			for ( var x = 0; x < files.length; x++ ) {
				var file_type = '';
				if ( utils.valid_file_type( files[ x ] ) ) {
					file_type = utils.valid_file_type( files[ x ] )[1];
				}
				self.track_files.push( { name: files[ x ], type: file_type } );
			}

			if ( 'undefined' !== typeof callback && callback instanceof Function ) {
				callback( error, self.track_files );
			}

			view.update_file_list( self.track_files, dir );
		}
	});
};

/**
 * Gets all the stored playlist titles using the playlist maps.
 *
 * @param  arra maps The array of playlist maps.
 * @return array The array of playlist titles. May return an empty array, if none are found.
 */
Playlist_Controller.prototype.get_titles = function( maps ) {
	var title_arr = [];

	if ( 'undefined' === typeof maps ) {
		maps = this.maps;
	}

	for ( var i = 0; i < maps.length; i++ ) {
		title_arr.push( maps[ i ].title );
	}

	return title_arr.sort();
};

module.exports = Playlist_Controller;
