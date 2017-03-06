var utils = require( 'utils' );

/**
 * Creates an object structure to encapsulate important Playlist object data.
 *
 * @see Playlist
 *
 * @param object playlist The playlist.
 */
function Playlist_Map( title ) {
	this.set_title( title );
}

Playlist_Map.prototype.set_title = function( title ) {
	if ( 'undefined' === typeof title || null === title || '' === title ) {
		console.error( 'Playlist_Map: set_title() expects title to be a non-empty string.' );
		return;
	}

	this.title = title;
	this.slug = utils.slug( title );
};

module.exports = Playlist_Map;
