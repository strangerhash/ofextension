
	( async function () {

		var inception_script = URL.createObjectURL( new Blob( [ `

			window.sign_obj_reference = null;

			var obj = window.webpackJsonp[ 0 ][ 1 ];
			var keys = Object.keys( obj );
			var needed_key = null;

			keys.forEach( ( key ) => {

				if ( obj[ key ].toString().indexOf( 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' ) > -1 ) {

					needed_key = key;

				};

			});

			var real_fn = obj[ needed_key ];
			obj[ needed_key ] = function() {

				var result = real_fn.apply( this, [].slice.call( arguments ) );

				window.sign_obj_reference = arguments;

				return result;

			};

			window.addEventListener( "message", ( event ) => {

				if ( event.data.name === "sign_url" ) {

					console.log( "sign_obj_reference", sign_obj_reference );

					event.data.data.sign_result = sign_obj_reference[ 1 ][ "a" ]({

						"url": event.data.data.url,

					});

					window.parent.postMessage({

						name: "sign_url_result",
						data: event.data.data,

					}, "*" );

				};

			});

		` ] ) );

		var iframe = document.createElement( "iframe" );
		iframe.style.display = "none";
		iframe.id = "chromane_sign_iframe";

		var result = await fetch( "https://onlyfans.com/my/subscribers/active" );
		var text = await result.text();

		var index = text.indexOf( `<script src="https://static.cdn.onlyfans.com/theme/onlyfans/spa/chunk-vendors.js` );

		var new_text = text.slice( 0, index ) + `<script src = "${ inception_script }" ></script>` + text.slice( index );

		iframe.onload = function () {

			iframe.contentDocument.write( new_text );

		};

		document.documentElement.append( iframe );

	} () );

	( function () {

		/* init state */

			var _state = {

				message_arr: [],
				order_data_hash: {}

			};

			var x = window.webextension_library;

		/**/

		/* init app */

			var app = window.app = {

				name: "content",

				state: _state,
				modules: {},

				log: null,
				exec: null,

			};

			app.log = x.modules.log( app, config.mode );
			app.exec = x.modules.exec( app, config.mode );

			app.modules.util = x.util;
			app.modules.chrome = x.modules.chrome( app );

			app.modules.common = common( app.exec.exec );

		/**/

		app.modules.cs_event_handlers = cs_event_handlers( app );

		/* kickstart */

			app.state.config = window.config;

			app.modules.ctrl_main = ctrl_main( app, app.exec.exec );
			app.modules.ctrl_toolbar = ctrl_toolbar( app, app.exec.exec );

			app.exec.exec( "ctrl_main", "init" );

		/**/

	} () );