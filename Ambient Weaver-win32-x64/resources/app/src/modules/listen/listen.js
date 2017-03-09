var component = require( 'component' );
var view      = require( 'view' );
var utils     = require( 'utils' );

/**
 * The listener class allows a list of events and listeners to be stored, and then pulls from
 * that list in order to add event listeners to elements.
 */
function Listen() {
	this.map = {
		'focused_bar': {
			'mousedown': this.focused_bar_listener,
			'keydown'  : this.focused_bar_keydown_listener,
		},
		'audio-player': {
			'timeupdate': this.audio_player_timeupdate_listener,
			'loadedmetadata': [
				this.audio_player_timeupdate_listener,
				this.audio_player_init_volume_listener
			],
			'ended': this.audio_player_ended_listener,
		},
		'progress-bar': {
			'mousemove': this.progress_bar_listener,
			'click'    : this.progress_bar_listener,
		},
		'volume-bar': {
			'mousemove': this.volume_bar_listener,
			'click'    : this.volume_bar_listener,
		},
		'volume-button': {
			'click': this.volume_button_listener,
		},
		'play-button': {
			'click': this.play_button_listener,
		},
		'master-play-button': {
			'click': this.master_play_button_listener,
		},
		'loop-button': {
			'click': this.loop_button_listener,
		},
		'add-playlist-button': {
			'click': this.add_playlist_button_listener,
		},
		'refresh-playlist-button': {
			'click': this.refresh_playlist_button_listener,
		},
		'edit-playlist-button': {
			'click': this.edit_playlist_button_listener,
		},
		'cancel-playlist-button': {
			'click': this.cancel_playlist_button_listener,
		},
		'save-playlist-button': {
			'click': this.save_playlist_button_listener,
		},
		'remove-playlist-button': {
			'click': this.remove_playlist_button_listener,
		},
		'playlist-item': {
			'click': this.playlist_item_listener,
		},
		'track-dropdown-item': {
			'click': this.track_dropdown_item_listener,
		},
		'track-dir-button': {
			'click': this.track_dir_button_listener,
		},
		'remove-track': {
			'click': this.remove_track_button_listener,
		}
	};
}

/**
 * Applies one or many event listeners to an element.
 *
 * @param Element el   The element.
 * @param string  name The name that corresponds to a key in the 'map' property.
 */
Listen.prototype.apply = function( el, name ) {
	if ( null === this.map ) {
		console.error( 'Listen: map was empty.' );
		return;
	}
	if ( ! ( el instanceof Element ) && ! ( el instanceof HTMLDocument ) ) {
		console.error( 'Listen: apply() expects el to be a child of Element or HTMLDocument.' );
		return;
	}
	if ( '' === name || 'undefined' === typeof name ) {
		console.error( 'Listen: apply() expects name to be a non-empty string.' );
		return;
	}

	var event_map = this.map[ name ];
	var events = Object.keys( event_map );
	for ( var i = 0; i < events.length; i++ ) {
		var event = events[ i ];
		var listener = event_map[ event ];
		if ( listener instanceof Array ) {
			for ( var x = 0; x < listener.length; x++ ) {
				el.addEventListener( event, listener[ x ] );
			}
		} else {
			el.addEventListener( event, listener );
		}
	}
};

/**
 * Handles the 'timeupdate' event for the custom audio player. Also called to handle the
 * 'loadedmetadata' event when the custom audio player first loads.
 *
 * @param Event event The event.
 */
Listen.prototype.audio_player_timeupdate_listener = function( event ) {
	var audio, progress_bar, label, time_ratio;

	audio = event.target;
	progress_bar = audio.parentElement.querySelector( 'div.progress-bar-wrapper div.progress-bar' );
	label = audio.parentElement.querySelector( 'div.progress-bar-wrapper label.progress-bar-label' );

	time_ratio = audio.currentTime / audio.duration;

	// update progress bar and its label
	progress_bar.style = 'width: ' + ( 100 * time_ratio ) + '%';
	label.innerText = utils.format_time( audio.currentTime ) + ' / ' +
			utils.format_time( audio.duration );
};

/**
 * Handles the 'loadedmetadata' event for the custom audio player. Sets up the volume bar using the
 * audio player that just finished loading.
 *
 * @param Event event The event.
 */
Listen.prototype.audio_player_init_volume_listener = function( event ) {
	var audio, vol_bar, vol_btn, bar_width, vol_ratio;

	audio = event.target;
	vol_bar = audio.parentElement.querySelector( 'div.volume-bar-wrapper div.progress-bar' );
	vol_btn = audio.parentElement.querySelector( 'div.volume-bar-wrapper span.ctrl-volume-button' );

	// update volume bar and its volume button
	vol_bar.style = 'width: ' + ( 100 * audio.volume ) + '%;';
	update_volume_button( audio, vol_btn );
};

/**
 * Handles the 'ended' event. If the player isn't looping, the track resets (but doesn't play) along
 * with the play button.
 *
 * @param Event event The event.
 */
Listen.prototype.audio_player_ended_listener = function( event ) {
	var audio = event.target;
	var btn = audio.parentElement.querySelector( 'span.ctrl-play-button' );

	if ( ! audio.loop ) {
		audio.currentTime = 0;
	}

	if ( null !== audio && audio instanceof HTMLMediaElement ) {
		btn.classList.remove( 'glyphicon-pause' );
		btn.classList.add( 'glyphicon-play' );
		btn.classList.remove( 'ctrl-button-toggled' );
	}
};

/**
 * Handles the 'mousemove' and 'click' events for the custom progress bars.
 *
 * @param MouseEvent event The event.
 */
Listen.prototype.progress_bar_listener = function( event ) {

	// the left mouse button was pressed when the event fired
	if ( 1 === event.buttons || 'click' === event.type ) {
		var bg_bar, fg_bar, label, audio;

		// the event is within the context of the foreground bar (not desirable)
		if ( event.target.classList.contains( 'progress-bar' ) ) {

			// gets the background bar
			bg_bar = event.target.parentNode;

			// gets the foreground bar
			fg_bar = event.target;
		} else {

			// gets the background bar
			bg_bar = event.target;

			// gets the foreground bar
			fg_bar = event.target.children[0];
		}

		if ( bg_bar !== window.focused_bar ) {
			return;
		}

		// getting the label and audio elements
		label = bg_bar.parentElement.querySelector( 'label.progress-bar-label' );
		audio = bg_bar.parentElement.parentElement.querySelector( 'audio' );

		var mouse_offset = event.offsetX;
		var bg_bar_width = parseInt( window.getComputedStyle( bg_bar ).width );

		var width_ratio = mouse_offset / bg_bar_width;
		fg_bar.style = 'width: ' + ( 100 * width_ratio ) + '%';

		audio.currentTime = audio.duration * width_ratio;
		label.innerText = utils.format_time( audio.currentTime ) + ' / ' +
			utils.format_time( audio.duration );
	}
};

/**
 * Handles the 'mousemove' and 'click' events for the custom volume bars.
 *
 * @param MouseEvent event The event.
 */
Listen.prototype.volume_bar_listener = function( event ) {

	// the left mouse button was pressed when the event fired
	if ( 1 === event.buttons || 'click' === event.type ) {
		var bg_bar, fg_bar, vol_btn, audio;

		// the event is within the context of the foreground bar (not desirable)
		if ( event.target.classList.contains( 'progress-bar' ) ) {

			// gets the background bar
			bg_bar = event.target.parentElement;

			// gets the foreground bar
			fg_bar = event.target;
		} else {

			// gets the background bar
			bg_bar = event.target;

			// gets the foreground bar
			fg_bar = event.target.firstChild;
		}

		if ( bg_bar !== window.focused_bar ) {
			return;
		}

		// getting the volume button and audio elements
		vol_btn = bg_bar.parentElement.querySelector( '.ctrl-volume-button' );
		audio = bg_bar.parentElement.parentElement.querySelector( 'audio' );

		var mouse_offset = event.offsetX;
		var bg_bar_width = parseInt( window.getComputedStyle( bg_bar ).width );
		var width_ratio = mouse_offset / bg_bar_width;

		fg_bar.style = 'width: ' + ( 100 * width_ratio ) + '%;';
		if ( width_ratio < 0 ) {
			audio.volume = 0;
		} else if ( width_ratio > 1 ) {
			audio.volume = 1;
		} else {
			audio.volume = width_ratio;
		}

		update_volume_button( audio, vol_btn );
	}
};

/**
 * Handles the 'click' event for the volume button. Mutes the audio player when it isn't, and vice
 * versa.
 *
 * @param MouseEvent event The event.
 */
Listen.prototype.volume_button_listener = function( event ) {
	event.stopPropagation();

	var vol_btn = event.target;
	var audio = vol_btn.parentElement.parentElement.querySelector( 'audio' );

	if ( null !== audio && audio instanceof HTMLMediaElement ) {
		if ( audio.muted ) {
			audio.muted = false;
		} else {
			audio.muted = true;
		}

		update_volume_button( audio, vol_btn );
	}
};

/**
 * Handles the 'click' event for the play button. Plays/pauses the audio player.
 *
 * @param MouseEvent event The event.
 */
Listen.prototype.play_button_listener = function( event ) {
	event.stopPropagation();

	if ( ! event.target.classList.contains( 'ctrl-play-button' ) ) {
		return;
	}

	var btn = event.target;
	var audio = btn.parentElement.parentElement.querySelector( 'audio' );

	if ( null !== audio && audio instanceof HTMLMediaElement ) {
		if ( audio.paused ) {
			audio.play();
			btn.classList.remove( 'glyphicon-play' );
			btn.classList.add( 'glyphicon-pause' );
			btn.classList.add( 'ctrl-button-toggled' );
		} else {
			audio.pause();
			btn.classList.remove( 'glyphicon-pause' );
			btn.classList.add( 'glyphicon-play' );
			btn.classList.remove( 'ctrl-button-toggled' );
		}
	}
};

/**
 * Handles the 'click' event for the play button. Plays/pauses all audio players within the playlist
 * editor.
 *
 * @param MouseEvent event The event.
 */
Listen.prototype.master_play_button_listener = function( event ) {
	event.stopPropagation();

	var master_btn = event.target;
	var glyphicon;
	if ( ! master_btn.classList.contains( 'ctrl-master-play-button' ) ) {
		master_btn = event.target.parentElement;
	}

	glyphicon = master_btn.querySelector( '.glyphicon' );

	// the master button's current state
	var master_paused = glyphicon.classList.contains( 'glyphicon-pause' ) ? false : true;
	var audio_tags = utils.parentElementN( master_btn, 3 ).querySelectorAll( 'audio' );

	if ( master_paused ) {
		master_paused = false;
		glyphicon.classList.remove( 'glyphicon-play' );
		glyphicon.classList.add( 'glyphicon-pause' );
		master_btn.classList.remove( 'btn-default' );
		master_btn.classList.add( 'btn-success' );
	} else {
		master_paused = true;
		glyphicon.classList.remove( 'glyphicon-pause' );
		glyphicon.classList.add( 'glyphicon-play' );
		master_btn.classList.remove( 'btn-success' );
		master_btn.classList.add( 'btn-default' );
	}

	for ( var i = 0; i < audio_tags.length; i++ ) {
		var audio = audio_tags[ i ];
		var play_btn = audio.parentElement.querySelector( '.ctrl-play-button' );

		if ( ! master_paused && audio.paused ) {

			// plays the audio track, if it wasn't previously
			audio.play();
			play_btn.classList.remove( 'glyphicon-play' );
			play_btn.classList.add( 'glyphicon-pause' );
			play_btn.classList.add( 'ctrl-button-toggled' );
		} else if ( master_paused && ! audio.paused ) {

			// pauses the audio track
			audio.pause();
			play_btn.classList.remove( 'glyphicon-pause' );
			play_btn.classList.add( 'glyphicon-play' );
			play_btn.classList.remove( 'ctrl-button-toggled' );
		}
	}
};

/**
 * Handles the 'click' event for the loop button. Toggles the 'loop' property of the audio player.
 *
 * @param MouseEvent event The event.
 */
Listen.prototype.loop_button_listener = function( event ) {
	event.stopPropagation();

	var btn = event.target;
	var audio = btn.parentElement.parentElement.querySelector( 'audio' );

	if ( null !== audio && audio instanceof HTMLMediaElement ) {
		if ( ! audio.loop ) {
			audio.loop = true;
			btn.classList.add( 'ctrl-button-toggled' );
		} else {
			audio.loop = false;
			btn.classList.remove( 'ctrl-button-toggled' );
		}
	}
};

/**
 * Handles the 'click' event for the 'add' playlist button. Adds an item to the playlist list.
 *
 * @param MouseEvent event The event.
 */
Listen.prototype.add_playlist_button_listener = function( event ) {
	event.stopPropagation();

	var btn = event.target;
	var p_list;
	if ( btn.classList.contains( 'btn-content' ) ) {
		p_list = utils.parentElementN( btn, 2 );
	} else {
		p_list = btn.parentElement;
	}

	var title = 'Untitled-' + Date.now();
	var new_item = component.create_playlist_item( title, p_list.children.length - 1 );

	p_list.appendChild( new_item );

	window.controller.add_playlist( title, null, function() {
		view.update_playlist_list( window.controller.get_titles() );
		view.update_file_list( window.controller.track_files, window.controller.tracks_dir );
	});
};

/**
 * Handles the 'click' event for the 'refresh' playlist button. Refreshes the playlist editor.
 *
 * @param MouseEvent event The event.
 */
Listen.prototype.refresh_playlist_button_listener = function( event ) {
	event.stopPropagation();

	var editor = utils.parentElementN( event.target, 2 );
	if ( ! editor.classList.contains( 'playlist-editor' ) ) {
		editor = editor.parentElement;
	}

	var playlist_title = editor.querySelector( '.playlist-editor-title' ).innerText;

	view.update_playlist_editor( window.controller.get_playlist( playlist_title ) );
};

/**
 * Handles the 'click' event for the 'edit' playlist button. Makes the playlist editable. Changes
 * the 'edit' playlist button into a 'save' playlist button.
 *
 * @param MouseEvent event The event.
 */
Listen.prototype.edit_playlist_button_listener = function( event ) {
	event.stopPropagation();

	var editor = utils.parentElementN( event.target, 2 );
	if ( ! editor.classList.contains( 'playlist-editor' ) ) {
		editor = editor.parentElement;
	}

	// switches from the 'edit' to 'save' button
	var edit_btn = editor.querySelector( '.btn.playlist-editor-btn-edit' );
	edit_btn.classList.add( 'hidden' );
	var save_btn = editor.querySelector( '.btn.playlist-editor-btn-save' );
	save_btn.classList.remove( 'hidden' );
	var cancel_btn = editor.querySelector( '.btn.playlist-editor-btn-cancel' );
	cancel_btn.classList.remove( 'hidden' );
	var remove_btn = editor.querySelector( '.btn.playlist-editor-btn-remove' );
	remove_btn.classList.remove( 'hidden' );
	var remove_track_btns = editor.querySelectorAll( '.btn.playlist-editor-btn-remove-track' );
	for ( var i = 0; i < remove_track_btns.length; i++ ) {
		remove_track_btns[ i ].classList.remove( 'hidden' );
	}

	// hides the playlist's title span and shows the title input
	var title_span = editor.querySelector( '.playlist-editor-title' );
	title_span.classList.add( 'hidden' );
	var title_input = editor.querySelector( '.playlist-editor-title-input' );
	title_input.classList.remove( 'hidden' );
};

/**
 * Handles the 'click' event for the 'save' playlist button. Calls the controller to update the
 * playlist with new data. Changes the 'save' button back into the 'edit' button.
 *
 * @param MouseEvent event The event.
 */
Listen.prototype.save_playlist_button_listener = function( event ) {
	event.stopPropagation();

	var current_title = '', title_input_val = '', new_title = '';
	var config = { volume: 1.0, tracks: [] };
	var track_list, editor;
	var btn = event.target;
	if ( ! btn.classList.contains( 'playlist-editor-btn-save' ) ) {
		btn = btn.parentElement;
	}

	editor = utils.parentElementN( btn, 2 );

	// gets the playlist title
	current_title = editor.querySelector( '.playlist-editor-title' ).innerText;
	title_input_val = editor.querySelector( '.playlist-editor-title-input' ).value;

	if ( current_title !== title_input_val ) {
		new_title = title_input_val;
	}

	// gets the configuration information
	track_list = editor.querySelector( '.playlist-editor-track-list' );
	for ( var i = 0; i < track_list.children.length; i++ ) {
		var track_item = track_list.children[ i ];

		var track_title = track_item.querySelector( '.track-title' ).innerText;
		var audio_tag = track_list.children[ i ].querySelector( 'audio' );
		var src = audio_tag.querySelector( 'source' ).getAttribute( 'src' );
		var src_dir = src.slice( 0, -( track_title.length + 1 ) );

		config.tracks.push( new Track(
			track_title,
			src_dir,
			{
				volume     : audio_tag.volume,
				loop       : audio_tag.loop,
				delay      : 0,
				duration   : audio_tag.duration,
				start_point: audio_tag.currentTime,
				end_point  : audio_tag.duration
			}
		));
	}

	window.controller.edit_playlist( current_title, { title: new_title, config: config }, function( err ) {
		if ( err ) {
			console.error( err );

			var btn_container = btn.parentElement;

			// switches from the 'save' button to the 'edit' button
			var edit_btn = btn_container.querySelector( '.btn.playlist-editor-btn-edit' );
			edit_btn.classList.remove( 'hidden' );
			var save_btn = btn_container.querySelector( '.btn.playlist-editor-btn-save' );
			save_btn.classList.add( 'hidden' );
			var cancel_btn = btn_container.querySelector( '.btn.playlist-editor-btn-cancel' );
			cancel_btn.classList.add( 'hidden' );
			var remove_btn = btn_container.querySelector( '.btn.playlist-editor-btn-remove' );
			remove_btn.classList.add( 'hidden' );
			var remove_track_btns = btn_container.parentElement.
				querySelectorAll( '.btn.playlist-editor-btn-remove-track' );
			for ( var x = 0; x < remove_track_btns.length; x++ ) {
				remove_track_btns[ x ].classList.add( 'hidden' );
			}

			// shows the playlist's title span and hides the title input
			var title_span = editor.querySelector( '.playlist-editor-title' );
			title_span.classList.remove( 'hidden' );
			var title_input = editor.querySelector( '.playlist-editor-title-input' );
			title_input.classList.add( 'hidden' );

			return;
		}

		if ( '' !== new_title ) {
			current_title = new_title;
		}

		view.update_track_dropdowns( window.controller.get_titles() );
		view.update_playlist_list( window.controller.get_titles() );
		view.update_playlist_editor( window.controller.get_playlist( current_title ) );
	});
};

/**
 * Handles the 'click' event for the 'cancel' playlist button. Stops editing the playlist, without
 * saving. Changes the 'edit' playlist button into a 'save' playlist button and hides the necessary
 * buttons.
 *
 * @param MouseEvent event The event.
 */
Listen.prototype.cancel_playlist_button_listener = function( event ) {
	event.stopPropagation();

	var editor = utils.parentElementN( event.target, 2 );
	if ( ! editor.classList.contains( 'playlist-editor' ) ) {
		editor = editor.parentElement;
	}

	// switches from the 'edit' to 'save' button
	var edit_btn = editor.querySelector( '.btn.playlist-editor-btn-edit' );
	edit_btn.classList.remove( 'hidden' );
	var save_btn = editor.querySelector( '.btn.playlist-editor-btn-save' );
	save_btn.classList.add( 'hidden' );
	var cancel_btn = editor.querySelector( '.btn.playlist-editor-btn-cancel' );
	cancel_btn.classList.add( 'hidden' );
	var remove_btn = editor.querySelector( '.btn.playlist-editor-btn-remove' );
	remove_btn.classList.add( 'hidden' );
	var remove_track_btns = editor.querySelectorAll( '.btn.playlist-editor-btn-remove-track' );
	for ( var i = 0; i < remove_track_btns.length; i++ ) {
		remove_track_btns[ i ].classList.add( 'hidden' );
	}

	// hides the playlist's title span and shows the title input
	var title_span = editor.querySelector( '.playlist-editor-title' );
	title_span.classList.remove( 'hidden' );
	var title_input = editor.querySelector( '.playlist-editor-title-input' );
	title_input.classList.add( 'hidden' );
};

/**
 * Handles the 'click' event for the 'remove' playlist button. Calls the controller to remove the
 * playlist.
 *
 * @param MouseEvent event The event.
 */
Listen.prototype.remove_playlist_button_listener = function( event ) {
	event.stopPropagation();

	var remove_btn = event.target;
	if ( ! remove_btn.classList.contains( 'playlist-editor-btn-remove' ) ) {
		remove_btn = remove_btn.parentElement;
	}

	var title = utils.parentElementN( remove_btn, 2 ).
		querySelector( '.playlist-editor-title' ).innerText;

	if ( confirm( 'You are about to delete the "' + title + '" playlist. This action is' +
		' non-reversible, ARE YOU SURE?' ) ) {

		window.controller.remove_playlist( title, function( err ) {

			// removes the playlist item from the list when the I/O succeeded
			if ( ! err ) {
				view.update_track_dropdowns( window.controller.get_titles() );
				view.update_playlist_list( window.controller.get_titles() );
				view.update_playlist_editor();
			}
		});
	}
};

/**
 * Updates a volume button's glyphicon state based on the volume/muted status of the audio player.
 *
 * @access private
 *
 * @param HTMLMediaElement audio   The audio element.
 * @param HTMLElement      vol_btn The volume button.
 */
function update_volume_button( audio, vol_btn ) {

	// updates the volume button's icon
	if ( 0 === audio.volume || audio.muted ) {

		// uses the off glyphicon
		if ( vol_btn.classList.contains( 'glyphicon-volume-up' ) ||
			vol_btn.classList.contains( 'glyphicon-volume-down' ) ) {

			vol_btn.classList.remove( 'glyphicon-volume-up', 'glyphicon-volume-down' );
			vol_btn.classList.add( 'glyphicon-volume-off' );
		}
	} else if ( audio.volume < 0.5 ) {

		// uses the volume-down glyphicon
		if ( vol_btn.classList.contains( 'glyphicon-volume-off' ) ||
			vol_btn.classList.contains( 'glyphicon-volume-up' ) ) {

			vol_btn.classList.remove( 'glyphicon-volume-off', 'glyphicon-volume-up' );
			vol_btn.classList.add( 'glyphicon-volume-down' );
		}
	} else {

		// uses the volume-up glyphicon
		if ( vol_btn.classList.contains( 'glyphicon-volume-off' ) ||
			vol_btn.classList.contains( 'glyphicon-volume-down' ) ) {

			vol_btn.classList.remove( 'glyphicon-volume-off', 'glyphicon-volume-down' );
			vol_btn.classList.add( 'glyphicon-volume-up' );
		}
	}

	// makes the button the default/toggled color
	if ( vol_btn.classList.contains( 'glyphicon-volume-off' ) ) {
		vol_btn.classList.remove( 'ctrl-button-toggled' );
	} else {
		vol_btn.classList.add( 'ctrl-button-toggled' );
	}
}

/**
 * Handles 'mousedown' events on the document in order to cache the current progress bar as the
 * focus for further mouse events. This prevents multiple progress bars from responding to a
 * combination of 'mousedown' and 'mousemove' events, when only one should be responding.
 *
 * @param MouseEvent event The event.
 */
Listen.prototype.focused_bar_listener = function( event ) {
	var target = event.target;

	if ( ! target.classList.contains( 'progress' ) && ! target.classList.contains( 'progress-bar' ) ) {
		if ( window.focused_bar ) {
			delete window.focused_bar;
		}
		return;
	}

	// grab the inner progress-bar's parent, which should be the out progress-bar
	if ( target.classList.contains( 'progress-bar' ) ) {
		target = target.parentElement;
	}

	if ( target !== window.focused_bar ) {
		window.focused_bar = target;
	}
};

/**
 * Handles 'keydown' events on the document and waits for the left or right arrow keys to be
 * pressed. Updates the focused (@see focused_bar_listener() for reference) progress bar when either
 * key is pressed. For volume bars, it increases/decreases the volume and likewise for track
 * progress bars.
 *
 * @param MouseEvent event The event.
 */
Listen.prototype.focused_bar_keydown_listener = function( event ) {
	if ( 'undefined' === typeof event.key ||
		( 'ArrowLeft' !== event.key && 'ArrowRight' !== event.key ) ||
		! window.focused_bar ) {
		return;
	}

	var shift = event.shiftKey ? true : false;
	var left_key_pressed = 'ArrowLeft' === event.key ? true : false;
	var audio = utils.parentElementN( window.focused_bar, 3 ).
		querySelector( '.audio-player > audio' );

	var fg_bar, bg_bar_width, width_ratio;

	fg_bar = window.focused_bar.querySelector( '.progress-bar' );
	bg_bar_width = parseInt( window.getComputedStyle( window.focused_bar ).width );

	if ( window.focused_bar.parentElement.classList.contains( 'volume-bar-wrapper' ) ) {

		/**
		 * the focused progress bar relates to the volume
		 */
		var vol_btn, new_vol;

		// getting the volume button
		vol_btn = window.focused_bar.parentElement.querySelector( '.ctrl-volume-button' );

		if ( left_key_pressed ) {
			new_vol = audio.volume - 0.1;
		} else {
			new_vol = audio.volume + 0.1;
		}

		if ( new_vol < 0 ) {
			audio.volume = 0;
		} else if ( new_vol > 1 ) {
			audio.volume = 1;
		} else {
			audio.volume = new_vol;
		}

		width_ratio = audio.volume;
		fg_bar.style = 'width: ' + ( 100 * width_ratio ) + '%;';

		update_volume_button( audio, vol_btn );

	} else if ( window.focused_bar.parentElement.classList.contains( 'progress-bar-wrapper' ) ) {

		/**
		 * the focused progress bar relates to the progress of the audio track
		 */
		var label, new_time;

		// getting the label
		label = window.focused_bar.parentElement.querySelector( 'label.progress-bar-label' );

		if ( left_key_pressed ) {
			new_time = audio.currentTime - 1 * ( shift ? 10 : 1 );
		} else {
			new_time = audio.currentTime + 1 * ( shift ? 10 : 1 );
		}

		width_ratio = new_time / audio.duration;
		fg_bar.style = 'width: ' + ( 100 * width_ratio ) + '%';

		audio.currentTime = new_time;
		label.innerText = utils.format_time( audio.currentTime ) + ' / ' +
			utils.format_time( audio.duration );

	}
};

/**
 * Handles 'click' events for the playlist list items. Clicking a playlist item should
 * load the target playlist into the playlist editor view.
 *
 * @param MouseEvent event The event.
 */
Listen.prototype.playlist_item_listener = function( event ) {
	var item, title_wrap, title;

	if ( event.target.classList.contains( 'playlist-title' ) ||
			event.target.classList.contains( 'item-index' ) ) {

		item = utils.parentElementN( event.target, 2 );
	} else if ( event.target.classList.contains( 'playlist-title-wrap' ) ) {
		item = event.target.parentElement;
	} else {
		item = event.target;
	}

	title = item.querySelector( '.playlist-title' ).innerText;

	var playlist = controller.get_playlist( title );
	if ( playlist ) {
		view.update_playlist_editor( playlist );
		var current_playlist_item = item.parentElement.querySelector( '.playlist-editing' );
		if ( current_playlist_item ) {
			current_playlist_item.classList.remove( 'playlist-editing' );
		}
		item.classList.add( 'playlist-editing' );
	}
};

/**
 * Handles 'click' events for the track list dropdown items. Clicking a dropdown item should add
 * the relative track to the playlist selected from the dropdown.
 *
 * @param MouseEvent event The event.
 */
Listen.prototype.track_dropdown_item_listener = function( event ) {
	var item, playlist_title, track_title;

	if ( ! event.target.classList.contains( 'track-dropdown-item-anchor' ) ) {
		item = event.target;
		playlist_title = item.querySelector( 'track-dropdown-item-anchor' ).innerText;
	} else {
		item = event.target.parentElement;
		playlist_title = event.target.innerText;
	}

	track_title = utils.parentElementN( item, 3 ).querySelector( '.track-title' ).innerText;

	var playlist_obj = window.controller.get_playlist( playlist_title );
	playlist_obj.config.add_track( track_title );
	playlist_obj.save();

	var editing_playlist_title = document.querySelector( '.playlist-editor-title' ).innerText;

	if ( playlist_obj.title === editing_playlist_title ) {
		view.update_playlist_editor( playlist_obj );
	}
};

/**
 * Handles 'click' events for the track list directory button. Clicking the button should initiate
 * a dialog box for the user to select a track directory. After selection, the track list should
 * be updated using the new track directory path.
 *
 * @param MouseEvent event The event.
 */
Listen.prototype.track_dir_button_listener = function( event ) {

	var input;
	var btn = event.target;
	if ( ! event.target.classList.contains( 'track-directory-btn' ) ) {
		btn = event.target.parentElement;
	}

	input = btn.parentElement.querySelector( '.track-directory-input' );

	var dir_path = window.electron.remote.dialog.showOpenDialog({
		title: 'Select a track directory',
		properties: [ 'openDirectory', 'createDirectory' ],
	});

	if ( dir_path && 'undefined' !== typeof dir_path[0] ) {
		if ( window.controller.set_tracks_dir( dir_path[0] ) ) {
			window.controller.save_maps( function() {
				view.update_file_list( window.controller.track_files, dir_path );
			});
		}
	}
};

/**
 * Handles 'click' events for the remove button in each item of the track list within the playlist
 * editor. Clicking the button should remove the track from the playlist being edited.
 *
 * @param MouseEvent event The event.
 */
Listen.prototype.remove_track_button_listener = function( event ) {
	var item, playlist_title, track_title;

	if ( ! event.target.classList.contains( 'playlist-editor-btn-remove-track' ) ) {
		item = utils.parentElementN( event.target, 3 );
	} else {
		item = utils.parentElementN( event.target, 2 );
	}

	playlist_title = utils.parentElementN( item, 2 ).querySelector( '.playlist-editor-title' ).
		innerText;
	track_title = item.querySelector( '.track-title' ).innerText;

	var playlist_obj = window.controller.get_playlist( playlist_title );
	playlist_obj.config.remove_track( track_title );

	// removes the track from the track list in the editor view
	item.remove();
};

module.exports = new Listen();
