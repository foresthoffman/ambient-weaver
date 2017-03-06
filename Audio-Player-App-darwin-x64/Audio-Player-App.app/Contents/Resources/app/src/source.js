// core & electron modules
var fs   = require( 'fs' );

// custom modules
var utils               = require( 'utils' );
var listen              = require( 'listen' );
var component           = require( 'component' );
var view                = require( 'view' );
var Playlist_Controller = require( 'playlist_controller' );
var Playlist            = require( 'playlist' );
var Config              = require( 'config' );
var Track               = require( 'track' );

window.onload = function() {
	listen.apply( document, 'focused_bar' );

	var controller = new Playlist_Controller();
	window.controller = controller;

	// asynchronously loads the stored maps, and then the stored playlists
	controller.init_maps( function() {
		controller.init_playlists( function() {

			// asynchronously loads the tracks
			controller.init_tracks( function( err, tracks ) {
				view.update_file_list( tracks, controller.tracks_dir );
			});

			var playlist_titles = controller.get_titles();
			view.update_playlist_list( playlist_titles );

			if ( playlist_titles.length > 0 ) {
				view.update_playlist_editor( controller.get_playlist( playlist_titles[0] ) );
			}
		});
	});
};

/**
 * Removes all of the child nodes from an element.
 */
Element.prototype.empty = function() {
	while ( this.firstChild ) {
		this.removeChild( this.firstChild );
	}
	return this;
};
