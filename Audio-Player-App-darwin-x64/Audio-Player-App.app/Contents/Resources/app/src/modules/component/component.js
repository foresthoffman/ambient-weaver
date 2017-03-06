function Component() {}

/**
 * Creates a custom audio player.
 *
 * @param string name The name of the source file.
 * @param string type The file type.
 * @param string path The source directory path.
 * @return HTMLElement The audio player node.
 */
Component.prototype.create_audio_player = function( name, type, path ) {
	var player, audio, source, source_type;
	var play_button, loop_button, progress_bar, volume_bar;

	// creates the audio player
	player = document.createElement( 'div' );
	player.classList.add( 'audio-player' );

	// creates the custom audio controls
	play_button  = this.create_play_button();
	loop_button  = this.create_loop_button();
	progress_bar = this.create_progress_bar();
	volume_bar   = this.create_volume_bar();

	// creates the actual audio element
	audio  = document.createElement( 'audio' );
	source = document.createElement( 'source' );

	// sets up the internal audio elements
	audio.style = 'display: none;';

	// sets up the source elements
	source.setAttribute( 'src', path );
	if ( 'm4a' === type || '' === type ) {
		type = 'mp4';
	}
	source.setAttribute( 'type', 'audio/' + type );

	// adds important event listeners
	listen.apply( audio      , 'audio-player' );
	listen.apply( play_button, 'play-button' );
	listen.apply( loop_button, 'loop-button' );

	// appends children to parents
	audio.appendChild( source );
	player.appendChild( audio );
	player.appendChild( play_button );
	player.appendChild( loop_button );
	player.appendChild( volume_bar );
	player.appendChild( progress_bar );

	return player;
};

/**
 * Creates a progress bar.
 *
 * @return HTMLElement A wrapper node with the progress bar and label.
 */
Component.prototype.create_progress_bar = function() {
	var bar, fg_bar, bg_bar, label;

	// creates a wrapper div to group the bar and its label together
	bar = document.createElement( 'div' );
	bar.classList.add( 'progress-bar-wrapper' );

	// creates the foreground bar (this one's width will change)
	fg_bar = document.createElement( 'div' );
	fg_bar.classList.add( 'progress-bar', 'progress-bar-success' );

	fg_bar.setAttribute( 'role'         , 'progressbar' );
	fg_bar.setAttribute( 'aria-valuenow', '0' );
	fg_bar.setAttribute( 'aria-valuemin', '0' );
	fg_bar.setAttribute( 'aria-valuemax', '100' );
	fg_bar.style = 'width: 0%';

	// creates the background bar (this one remains static)
	bg_bar = document.createElement( 'div' );
	bg_bar.classList.add( 'progress', 'progress-bar-dark' );

	// creates the label to display the duration of the audio track
	label = document.createElement( 'label' );
	label.classList.add( 'progress-bar-label' );

	// gives the label a default value.
	label.innerText = '00:00:00 / 00:00:00';

	bg_bar.appendChild( fg_bar );
	bar.appendChild( label );
	bar.appendChild( bg_bar );

	listen.apply( bg_bar, 'progress-bar' );

	return bar;
};

/**
 * Creates a volume bar.
 *
 * @return HTMLElement A wrapper node with the volume bar and button.
 */
Component.prototype.create_volume_bar = function() {
	var bar, fg_bar, bg_bar, vol_btn;

	// creates a wrapper div to group the bar and its button together
	bar = document.createElement( 'div' );
	bar.classList.add( 'volume-bar-wrapper' );

	// creates the foreground bar (this one's width will change)
	fg_bar = document.createElement( 'div' );
	fg_bar.classList.add( 'progress-bar', 'progress-bar-success' );

	fg_bar.setAttribute( 'role'         , 'progressbar' );
	fg_bar.setAttribute( 'aria-valuenow', '0' );
	fg_bar.setAttribute( 'aria-valuemin', '0' );
	fg_bar.setAttribute( 'aria-valuemax', '100' );
	fg_bar.style = 'width: 0%';

	// creates the background bar (this one remains static)
	bg_bar = document.createElement( 'div' );
	bg_bar.classList.add( 'progress', 'progress-bar-dark' );

	// creates the span to display the volume button
	vol_btn = document.createElement( 'span' );
	vol_btn.classList.add( 'glyphicon', 'glyphicon-volume-up',
		'ctrl-volume-button', 'ctrl-button', 'ctrl-button-toggled' );

	bg_bar.appendChild( fg_bar );
	bar.appendChild( vol_btn );
	bar.appendChild( bg_bar );

	listen.apply( bg_bar, 'volume-bar' );
	listen.apply( vol_btn, 'volume-button' );

	return bar;
};

/**
 * Creates a play/pause button.
 *
 * @return HTMLElement The button node.
 */
Component.prototype.create_play_button = function() {
	var btn, icon;

	btn = document.createElement( 'div' );
	btn.classList.add( 'ctrl-play-button-wrapper' );
	icon = document.createElement( 'span' );
	icon.classList.add( 'glyphicon', 'glyphicon-play', 'ctrl-play-button', 'ctrl-button' );

	btn.appendChild( icon );

	return btn;
};

/**
 * Creates a loop button.
 *
 * @return HTMLElement The button node.
 */
Component.prototype.create_loop_button = function() {
	var btn, icon;

	btn = document.createElement( 'div' );
	btn.classList.add( 'ctrl-loop-button-wrapper' );
	icon = document.createElement( 'span' );
	icon.classList.add( 'glyphicon', 'glyphicon-repeat', 'ctrl-loop-button', 'ctrl-button' );

	btn.appendChild( icon );

	return btn;
};

/**
 * Create a list of tracks.
 *
 * @param array  tracks An array of track file names.
 * @param string path   The tracks directory PATH.
 * @return HTMLElement The track list node tree.
 */
Component.prototype.create_track_list = function( tracks, path ) {
	var list = document.createElement( 'div' );
	list.classList.add( 'ctrl-list' );

	var dir_div = document.createElement( 'div' );
	dir_div.classList.add( 'track-directory' );

	var dir_input = document.createElement( 'input' );
	dir_input.classList.add( 'track-directory-input' );
	dir_input.setAttribute( 'placeholder', 'Select a track folder...' );
	dir_input.value = window.controller.tracks_dir;
	dir_input.setAttribute( 'disabled', true );

	var dir_btn = document.createElement( 'div' );
	dir_btn.classList.add( 'btn', 'btn-info', 'track-directory-btn' );

	var dir_btn_span = document.createElement( 'span' );
	dir_btn_span.classList.add( 'glyphicon', 'glyphicon-folder-open' );

	var dir_btn_span_content = document.createElement( 'span' );
	dir_btn_span_content.innerText = 'Choose Folder';

	dir_btn.appendChild( dir_btn_span );
	dir_btn.appendChild( dir_btn_span_content );

	listen.apply( dir_btn, 'track-dir-button' );

	dir_div.appendChild( dir_input );
	dir_div.appendChild( dir_btn );

	list.appendChild( dir_div );

	if ( tracks.length > 0 ) {
		for ( var i = 0; i < tracks.length; i++ ) {
			var file = tracks[ i ].name;
			var file_type = tracks[ i ].type;

			// creates the list item div
			var item = document.createElement( 'div' );
			item.classList.add( 'ctrl-list-item' );

			// creates the item div
			var div = document.createElement( 'div' );

			var small = document.createElement( 'small' );
			small.classList.add( 'item-index' );
			small.innerText = ( ( i + 1 ) < 10 ? '0' + ( i + 1 ) : ( i + 1 ) ) + ' ';

			var span = document.createElement( 'span' );
			span.classList.add( 'track-title' );
			span.innerText = file;

			div.appendChild( small );
			div.appendChild( span );

			var dropdown_container = document.createElement( 'div' );
			dropdown_container.classList.add( 'task-dropdown', 'dropdown' );

			var dropdown_btn = document.createElement( 'div' );
			dropdown_btn.classList.add( 'btn', 'btn-success', 'dropdown-toggle', 'ctrl-button',
				'ctrl-button-track-dropdown' );
			dropdown_btn.setAttribute( 'data-toggle', 'dropdown' );
			dropdown_btn.setAttribute( 'title', 'Assign Track To Playlist' );

			var dropdown_btn_content_span = document.createElement( 'span' );
			dropdown_btn_content_span.innerText = 'Assign Track';

			var caret = document.createElement( 'span' );
			caret.classList.add( 'caret' );

			dropdown_btn.appendChild( dropdown_btn_content_span );
			dropdown_btn.appendChild( caret );

			var dropdown_list = component.create_task_dropdown_list();

			dropdown_container.appendChild( dropdown_btn );
			dropdown_container.appendChild( dropdown_list );

			var player = component.create_audio_player( file, file_type, path + '/' + file );

			// appends the div element to the list item and then the list item to the list itself
			item.appendChild( div );
			item.appendChild( dropdown_container );
			item.appendChild( player );
			list.appendChild( item );
		}
	} else {
		var none_div = document.createElement( 'div' );
		none_div.classList.add( 'none-msg' );
		none_div.innerText = 'No Tracks Found In Folder';

		list.appendChild( none_div );
	}

	return list;
};

/**
 * Create a dropdown list that contains all the available playlist titles. This is only a child
 * element, which is intended to be used inside of a '.dropdown' menu.
 *
 * @return HTMLElement The dropdown list node.
 */
Component.prototype.create_task_dropdown_list = function() {

	var playlist_titles = window.controller.get_titles();

	var dropdown_list = document.createElement( 'ul' );
	dropdown_list.classList.add( 'dropdown-menu' );

	var dropdown_item, item_anchor;

	if ( 0 === playlist_titles.length ) {
		dropdown_item = document.createElement( 'li' );
		dropdown_item.classList.add( 'track-dropdown-item' );

		item_anchor = document.createElement( 'a' );
		item_anchor.setAttribute( 'href', '#' );
		item_anchor.classList.add( 'track-dropdown-item-anchor' );
		item_anchor.innerText = 'No Playlists Available';

		dropdown_item.appendChild( item_anchor );
		dropdown_list.appendChild( dropdown_item );
	} else {
		for ( var x = 0; x < playlist_titles.length; x++ ) {
			dropdown_item = document.createElement( 'li' );
			dropdown_item.classList.add( 'track-dropdown-item' );

			item_anchor = document.createElement( 'a' );
			item_anchor.setAttribute( 'href', '#' );
			item_anchor.classList.add( 'track-dropdown-item-anchor' );
			item_anchor.innerText = playlist_titles[ x ];

			dropdown_item.appendChild( item_anchor );
			dropdown_list.appendChild( dropdown_item );

			listen.apply( dropdown_item, 'track-dropdown-item' );
		}
	}

	return dropdown_list;
};

/**
 * Create a list of playlists.
 *
 * @param  array playlists An array of playlist titles.
 * @return HTMLElement The playlist node tree.
 */
Component.prototype.create_playlist_list = function( playlists ) {
	if ( 'undefined' === typeof playlists ) {
		console.error( 'Component: create_playlist_list() expects playlists to be a valid array.' );
		return;
	}
	var list;

	// creates the playlist list
	list = document.createElement( 'div' );
	list.classList.add( 'playlist-list' );

	// add button
	var add_btn = document.createElement( 'div' );
	add_btn.classList.add( 'btn', 'btn-success', 'playlist-btn-add' );
	add_btn.title = 'Add a playlist';

	var add_span = document.createElement( 'span' );
	add_span.classList.add( 'glyphicon', 'glyphicon-plus' );

	var add_content_span = document.createElement( 'span' );
	add_content_span.classList.add( 'btn-content' );
	add_content_span.innerText = ' Add Playlist';

	add_btn.appendChild( add_span );
	add_btn.appendChild( add_content_span );
	list.appendChild( add_btn );

	listen.apply( add_btn, 'add-playlist-button' );

	if ( playlists.length > 0 ) {
		for ( var i = 0; i < playlists.length; i++ ) {
			var playlist = playlists[ i ];
			var list_item = this.create_playlist_item( playlist, i );

			list.appendChild( list_item );
		}
	} else {
		var none_div = document.createElement( 'div' );
		none_div.classList.add( 'none-msg' );
		none_div.innerText = 'No Playlists Available';

		list.appendChild( none_div );
	}

	return list;
};

/**
 * Create a single list item for the playlist list.
 *
 * @param  string playlist A single playlist title.
 * @return HTMLElement The playlist list item node.
 */
Component.prototype.create_playlist_item = function( playlist, i ) {
	if ( 'undefined' === typeof playlist ) {
		console.error( 'Component: create_playlist_item() expects playlist to be a non-empty' +
			' string.' );
		return;
	}

	if ( 'undefined' === typeof i || i < 0 ) {
		i = 0;
	}

	var list_item = document.createElement( 'div' );
	list_item.classList.add( 'playlist-list-item' );

	var title_wrap = document.createElement( 'div' );
	title_wrap.classList.add( 'playlist-title-wrap' );

	var small = document.createElement( 'small' );
	small.classList.add( 'item-index' );
	small.innerText = ( ( i + 1 ) < 10 ? '0' + ( i + 1 ) : ( i + 1 ) );

	var title = document.createElement( 'div' );
	title.classList.add( 'playlist-title' );
	title.innerText = playlist;
	title.title = playlist;

	listen.apply( list_item, 'playlist-item' );

	title_wrap.appendChild( small );
	title_wrap.appendChild( title );
	list_item.appendChild( title_wrap );

	return list_item;
};

/**
 * Creates the playlist editor.
 *
 * @param Playlist|string playlist_obj The playlist to edit.
 * @return HTMLElement The playlist editor node.
 */
Component.prototype.create_playlist_editor = function( playlist_obj ) {
	var playlist_title = 'No Playlist Selected';

	if ( playlist_obj ) {
		if ( 'undefined' !== typeof playlist_obj.title ) {
			playlist_title = playlist_obj.title;
		} else {
			playlist_title = playlist_obj;
		}
	}

	var editor;

	// creates the editor
	editor = document.createElement( 'div' );
	editor.classList.add( 'playlist-editor' );

	// creates the editor meta
	var meta = document.createElement( 'div' );
	meta.classList.add( 'playlist-editor-meta' );

	// creates the editor title h1
	var title_h1 = document.createElement( 'h1' );
	title_h1.classList.add( 'container-title' );
	title_h1.innerText = 'Playlist: ';

	// creates the editor title span
	var title_span = document.createElement( 'span' );
	title_span.classList.add( 'playlist-editor-title' );
	title_span.innerText = playlist_title;

	// creates the editor title input
	var title_field = document.createElement( 'input' );
	title_field.classList.add( 'playlist-editor-title-input', 'hidden' );
	title_field.value = playlist_title;
	title_field.title = playlist_title;

	title_h1.appendChild( title_span );
	title_h1.appendChild( title_field );
	meta.appendChild( title_h1 );
	editor.appendChild( meta );

	// creates a container for the 'Edit' and 'Save' buttons
	var btns = document.createElement( 'div' );
	btns.classList.add( 'playlist-editor-btn-container' );

	// master play (play all) button
	var play_btn = document.createElement( 'div' );
	play_btn.classList.add( 'btn', 'btn-default', 'playlist-editor-btn-play',
		'ctrl-master-play-button' );
	play_btn.title = 'Play All Tracks';

	var play_span = document.createElement( 'span' );
	play_span.classList.add( 'glyphicon', 'glyphicon-play' );

	var play_content_span = document.createElement( 'span' );
	play_content_span.innerText = ' Play All';

	play_btn.appendChild( play_span );
	play_btn.appendChild( play_content_span );

	// refresh playlist button
	var refresh_btn = document.createElement( 'div' );
	refresh_btn.classList.add( 'btn', 'btn-info', 'playlist-editor-btn-refresh' );
	refresh_btn.title = 'Refresh Playlist';

	var refresh_span = document.createElement( 'span' );
	refresh_span.classList.add( 'glyphicon', 'glyphicon-refresh' );

	var refresh_content_span = document.createElement( 'span' );
	refresh_content_span.innerText = ' Refresh';

	refresh_btn.appendChild( refresh_span );
	refresh_btn.appendChild( refresh_content_span );

	// edit button
	var edit_btn = document.createElement( 'div' );
	edit_btn.classList.add( 'btn', 'btn-info', 'playlist-editor-btn-edit' );
	edit_btn.title = 'Edit';

	var edit_span = document.createElement( 'span' );
	edit_span.classList.add( 'glyphicon', 'glyphicon-pencil' );

	var edit_content_span = document.createElement( 'span' );
	edit_content_span.innerText = ' Edit';

	edit_btn.appendChild( edit_span );
	edit_btn.appendChild( edit_content_span );

	// save button
	var save_btn = document.createElement( 'div' );
	save_btn.classList.add( 'btn', 'btn-success', 'playlist-editor-btn-save', 'hidden' );
	save_btn.title = 'Save Playlist and Stop Editing';

	var save_span = document.createElement( 'span' );
	save_span.classList.add( 'glyphicon', 'glyphicon-save' );

	var save_content_span = document.createElement( 'span' );
	save_content_span.innerText = ' Save';

	save_btn.appendChild( save_span );
	save_btn.appendChild( save_content_span );

	// cancel button
	var cancel_btn = document.createElement( 'div' );
	cancel_btn.classList.add( 'btn', 'btn-warning', 'playlist-editor-btn-cancel', 'hidden' );
	cancel_btn.title = 'Stop Editing Without Saving';

	var cancel_span = document.createElement( 'span' );
	cancel_span.classList.add( 'glyphicon', 'glyphicon-remove' );

	var cancel_content_span = document.createElement( 'span' );
	cancel_content_span.innerText = ' Cancel';

	cancel_btn.appendChild( cancel_span );
	cancel_btn.appendChild( cancel_content_span );

	// delete button
	var remove_btn = document.createElement( 'div' );
	remove_btn.classList.add( 'btn', 'btn-danger', 'playlist-editor-btn-remove', 'hidden' );
	remove_btn.title = 'Permanently Delete Playlist';

	var remove_span = document.createElement( 'span' );
	remove_span.classList.add( 'glyphicon', 'glyphicon-trash' );

	var remove_content_span = document.createElement( 'span' );
	remove_content_span.innerText = ' Delete Playlist';

	remove_btn.appendChild( remove_span );
	remove_btn.appendChild( remove_content_span );

	btns.appendChild( play_btn );
	btns.appendChild( refresh_btn );
	btns.appendChild( edit_btn );
	btns.appendChild( cancel_btn );
	btns.appendChild( save_btn );
	btns.appendChild( remove_btn );

	listen.apply( play_btn   , 'master-play-button' );
	listen.apply( refresh_btn, 'refresh-playlist-button' );
	listen.apply( edit_btn   , 'edit-playlist-button' );
	listen.apply( save_btn   , 'save-playlist-button' );
	listen.apply( cancel_btn , 'cancel-playlist-button' );
	listen.apply( remove_btn , 'remove-playlist-button' );

	// creates editor track list
	var list = document.createElement( 'div' );
	list.classList.add( 'playlist-editor-track-list' );

	if ( 'undefined' !== typeof playlist_obj && 'undefined' !== typeof playlist_obj.config.tracks ) {
		for ( var i = 0; i < playlist_obj.config.tracks.length; i++ ) {
			var track = playlist_obj.config.tracks[ i ];

			// creates the list item div
			var item = document.createElement( 'div' );
			item.classList.add( 'ctrl-list-item' );

			// creates the item div
			var div = document.createElement( 'div' );

			var remove_track = document.createElement( 'div' );
			remove_track.classList.add( 'btn', 'btn-danger', 'playlist-editor-btn-remove-track',
				'hidden' );
			remove_track.title = 'Remove Track From Playlist';

			var remove_track_span = document.createElement( 'span' );
			remove_track_span.classList.add( 'glyphicon', 'glyphicon-trash' );

			var remove_track_txt = document.createElement( 'span' );
			remove_track_txt.innerText = ' Remove';

			remove_track.appendChild( remove_track_span );
			remove_track.appendChild( remove_track_txt );

			var small = document.createElement( 'small' );
			small.classList.add( 'item-index' );
			small.innerText = ( ( i + 1 ) < 10 ? '0' + ( i + 1 ) : ( i + 1 ) ) + ' ';

			var span = document.createElement( 'span' );
			span.classList.add( 'track-title' );
			span.innerText = track.title;

			div.appendChild( remove_track );
			div.appendChild( small );
			div.appendChild( span );

			listen.apply( remove_track, 'remove-track' );

			var player = this.create_audio_player( track.title, track.file_type, track.src );

			item.appendChild( div );
			item.appendChild( player );
			list.appendChild( item );
		}
	}

	if ( 'object' === typeof playlist_obj ) {
		editor.appendChild( btns );
	}

	editor.appendChild( list );

	return editor;
};

module.exports = new Component();
