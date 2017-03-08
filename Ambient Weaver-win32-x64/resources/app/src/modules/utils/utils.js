var path = require( 'path' );

function Utils() {

	this.types = [
		'mp3', 'm4a', 'ogg', 'wav'
	];
	this.types_joined = this.types.join( '|' );
	this.name_regex = new RegExp( '.*\\.(' + this.types_joined + ')$' );

	/*
	 * Determine the equivalence of two pieces of data. Originally intended for nested objects and
	 * arrays, but technically works for non-object data.
	 *
	 * @param  object o1 The first object.
	 * @param  object o2 The second object.
	 * @return boolean Whether or not the objects are equal.
	 */
	this.eq = function( o1, o2 ) {
		if ( 'undefined' === typeof o1 || 'undefined' === typeof o2 ) {
			console.error( 'Utils: eq() expects o1 and o2 to non-empty.' );
			return false;
		}

		if ( typeof o1 !== typeof o2 ) {
			return false;
		}

		if ( o1 instanceof Object && ! ( o1 instanceof Array ) ) {

			var o1_keys = Object.keys( o1 );
			var o2_keys = Object.keys( o2 );

			if ( o1_keys.length !== o2_keys.length ) {
				return false;
			}

			for ( var i = 0; i < o1_keys.length; i++ ) {
				var key1 = o1_keys[ i ];
				var key2 = o2_keys[ i ];
				var prop1 = o1[ key1 ];
				var prop2 = o2[ key2 ];

				if ( key1 !== key2 || ! this.eq( prop1, prop2 ) ) {
					return false;
				}
			}
		} else if ( o1 instanceof Array ) {

			if ( o1.length !== o2.length ) {
				return false;
			}

			for ( var x = 0; x < o1.length; x++ ) {
				if ( ! this.eq( o1[ x ], o2[ x ] ) ) {
					return false;
				}
			}
		} else {
			if ( o1 !== o2 ) {
				return false;
			}
		}

		return true;
	};

	/**
	 * Formats seconds as minutes:seconds (e.g. 63 seconds => "01:03")
	 *
	 * @param  int|float seconds Raw seconds.
	 * @return string|null A formatted string.
	 */
	this.format_time = function( total_seconds ) {
		if ( 'undefined' === typeof total_seconds ) {
			console.error( 'format_time():', 'Invalid arg seconds provided.' );
			return;
		}

		var hours, minutes, raw_minutes, seconds, f_hour, f_min, f_sec;

		raw_minutes = parseInt( total_seconds / 60 );
		minutes = ( raw_minutes < 60 ? raw_minutes : 0 );
		hours = parseInt( raw_minutes / 60 );
		seconds = parseInt( total_seconds ) - hours * 3600 - minutes * 60;

		f_sec = ( seconds < 10 ? '0' + seconds : seconds );
		f_min = ( minutes < 10 ? '0' + minutes : minutes );
		f_hour = ( hours < 10 ? '0' + hours : hours );

		return f_hour + ':' + f_min + ':' + f_sec;
	};

	/**
	 * Gets the non-empty values of the Array upon which the function is called. This is a wrapper
	 * function for the custom Array.prototype.vals() function.
	 *
	 * @param  array arr The array.
	 * @return array|null The values in the Array. Null if the argument isn't an array.
	 */
	this.arr_vals = function( arr ) {
		if ( 'undefined' === typeof arr || ! ( arr instanceof Array ) ) {
			console.error( 'Utils: arr_vals() expects arr to be a valid array.' );
			return null;
		}

		return arr.vals();
	};

	/**
	 * Gets the file name slug from the raw file name.
	 *
	 * @param  string name The file name.
	 * @return string|null The slug.
	 */
	this.slug = function( name ) {
		if ( 'undefined' === typeof name || null === name || '' === name ) {
			console.error( 'Utils: slug() expects name to be a non-empty string.' );
			return null;
		}

		var slug = '';
		try {
			slug = name.trim().replace( /[\s\\\/\'\"]+/g, '_' ).
				replace( /[;&]+/g, '-' ).toLowerCase();
		} catch ( e ) {
			console.error( e );
			return null;
		}

		return slug;
	};

	/**
	 * Determines whether or not a file name matches any of the valid file types.
	 *
	 * @param  string name The file name.
	 * @return array|null An array of match data. Null if there was a problem or there were no
	 *                    matches.
	 */
	this.valid_file_type = function( name ) {
		if ( 'undefined' === typeof name || null === name || '' === name ) {
			console.error( 'Utils: valid_file_type() expects name to be a non-empty string.' );
			return null;
		}

		return name.match( this.name_regex );
	};

	/**
	 * Gets the nth parent of an Element instance.
	 *
	 * @param  Element el The target.
	 * @param  int     n  How far up in the tree the function should look.
	 * @return Element|null The parent. The target will be returned if n = 0, or if the parentElement
	 *                      is null. Null is returned upon error.
	 */
	this.parentElementN = function( el, n ) {
		if ( 'undefined' === el || ! ( el instanceof Element ) ) {
			console.error( 'Utils: parentElementN() expects el to inherit from Element.' );
			return null;
		}

		if ( 'undefined' === n ) {
			n = 0;
		}

		var parent = el;
		n = ( n < 0 ? -1 * parseInt( n ) : parseInt( n ) );

		for ( var i = 0; i < n; i++ ) {
			parent = parent.parentElement;
		}

		return parent;
	};

	this.data_dir = path.resolve( __dirname, '../../../data/' );
	this.test_dir = path.resolve( __dirname, '../../../test/data/' );

	this.enable_test_mode = function() {
		this.data_dir = this.test_dir;
	};

	/**
	 * Gets the non-empty values of the Array upon which the function is called.
	 *
	 * @return Array The values in the Array.
	 */
	Array.prototype.vals = function() {
		var values = [];

		for ( var i = 0; i < this.length; i++ ) {
			if ( 'undefined' !== typeof this[ i ] && '' !== this[ i ] ) {
				values.push( this[ i ] );
			}
		}

		return values;
	};
}

module.exports = new Utils();
