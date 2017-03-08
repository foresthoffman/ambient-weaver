var component = require( 'component' );

function View() {}

/**
 * Updates the list of files on screen.
 *
 * @param array  dir_files An array of available files.
 * @param string path      The path to the sound file directory.
 */
View.prototype.update_file_list = function( dir_files, path ) {

	// cleans up the list
	var list_container = document.getElementById( 'ctrl-list-container' );
	list_container.empty();

	var list = component.create_track_list( dir_files, path );

	list_container.appendChild( list );

	// fixes last dropdown in list falling off of screen
	var dropdowns = list_container.querySelectorAll( '.dropdown' );
	if ( dropdowns.length > 0 ) {
		var last_dropdown = dropdowns[ dropdowns.length - 1 ];
		last_dropdown.classList.remove( 'dropdown' );
		last_dropdown.classList.add( 'dropup' );
	}
};

/**
 * Updates the track dropdown list contained within the dropdown menus.
 *
 * @param array titles An array of playlist titles.
 */
View.prototype.update_track_dropdowns = function( titles ) {
	var dropdowns = document.querySelectorAll( '.task-dropdown' );

	// replaces the list of playlist titles in each of the dropdowns
	for ( var i = 0; i < dropdowns.length; i++ ) {
		var dropdown_list = component.create_task_dropdown_list();
		dropdowns[ i ].querySelector( '.dropdown-menu' ).remove();
		dropdowns[ i ].appendChild( dropdown_list );
	}
};

/**
 * Updates the list of available playlists.
 *
 * @param array titles An array of playlist titles.
 */
View.prototype.update_playlist_list = function( titles ) {

	// cleans up the list
	var list_container = document.getElementById( 'playlist-list-container' );
	list_container.empty();

	var list = component.create_playlist_list( titles );

	list_container.appendChild( list );
};

/**
 * Updates the playlist editor with for a specific playlist.
 *
 * @param Playlist playlist The playlist to edit.
 */
View.prototype.update_playlist_editor = function( playlist ) {

	// cleans up the editor
	var editor_container = document.getElementById( 'playlist-editor-container' );
	editor_container.empty();

	var editor = component.create_playlist_editor( playlist );

	editor_container.appendChild( editor );

	var track_arr = 'undefined' !== typeof playlist && 'undefined' !== typeof playlist.config ?
		playlist.config.tracks :
		null;
	var audio_arr = editor_container.querySelectorAll( 'audio' );
	var loop_btn_arr = editor_container.querySelectorAll( '.ctrl-loop-button' );
	for ( var i = 0; i < audio_arr.length; i++ ) {
		var audio_track = audio_arr[ i ];
		var loop_btn = loop_btn_arr[ i ];

		if ( 'undefined' !== typeof track_arr ) {
			var track = track_arr[ i ];

			audio_track.volume = track.options.volume;
			audio_track.currentTime = track.options.start_point;
			audio_track.loop = track.options.loop;
		}

		// manually updating the loop button style
		if ( audio_track.loop ) {
			loop_btn.classList.add( 'ctrl-button-toggled' );
		} else {
			loop_btn.classList.remove( 'ctrl-button-toggled' );
		}
	}

	// highlights the playlist that is being currently edited in the playlist list
	var playlist_items = document.querySelectorAll( '.playlist-list-item' );

	for ( var x = 0; x < playlist_items.length; x++ ) {
		var item_title = playlist_items[ x ].querySelector( '.playlist-title' ).
			innerText;
		if ( 'undefined' !== typeof playlist ) {
			if ( playlist_items[ x ].classList.contains( 'playlist-editing' ) && playlist.title !== item_title ) {
				playlist_items[ x ].classList.remove( 'playlist-editing' );
			} else if ( playlist.title === item_title ) {
				playlist_items[ x ].classList.add( 'playlist-editing' );
			}
		}
	}
};

module.exports = new View();
