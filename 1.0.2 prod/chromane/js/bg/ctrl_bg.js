
	function ctrl_bg ( app ) {

		return {

			// app logic

				handle_stripe_page: async ( page_name, tab, exec ) => {

					if ( page_name === 'upgrade_success' ) {

						chrome.tabs.remove( tab.id );

						chrome.runtime.sendMessage({

							name: "upgrade_success"

						});

					} else if ( page_name === 'upgrade_failure' ) {

						chrome.tabs.remove( tab.id );

						chrome.runtime.sendMessage({

							name: "upgrade_failure"

						});

					} else if ( page_name === 'stripe_portal_return' ) {

						chrome.tabs.remove( tab.id );

					};

				},

			// standart logic

				handle_runtime_message: async ( message, sender, callback, exec ) => {

					exec( "log", "write_exec", "message", message );
					exec( "log", "write_exec", message.module_name );
					exec( "log", "write_exec", message.method_name );

					if ( message.data && message.data.sender ) {

						message.data.sender = sender;

					};

					if ( message.arg_arr ) {

						for ( var i = message.arg_arr.length; i--; ) {

							if ( message.arg_arr[ i ] === "_tab_id_" ) {

								message.arg_arr[ i ] = sender.tab.id;

							} else if ( message.arg_arr[ i ] === "_tab_" ) {

								message.arg_arr[ i ] = sender.tab;

							};

						};

					};

					if ( message.arg_arr ) {

						var arg_arr = [ message.module_name, message.method_name ];
						arg_arr = arg_arr.concat( message.arg_arr );

					} else {

						var arg_arr = [ message.module_name, message.method_name ];

					};

					var result = await exec.apply( null, arg_arr );

					callback( result );

				},

				add_observers: () => {

					chrome.runtime.onMessage.addListener( function ( message, sender, callback ) {

						app.exec.exec( "ctrl_bg", "handle_runtime_message", message, sender, callback );
						return true;

					});

					chrome.webRequest.onBeforeSendHeaders.addListener( function ( details ) {

						// console.log( details );

						var headers = {};

						details.requestHeaders.forEach( ( header ) => {

							if ( header.name === "app-token" || header.name === "sign" || header.name === "user-id" || header.name === "x-bc" || header.name === "time" ) {

								headers[ header.name ] = header.value;

							};

						});

						if ( headers[ "app-token" ] && headers[ "sign" ] && headers[ "user-id" ] && headers[ "x-bc" ] && headers[ "time" ] ) {

							chrome.runtime.sendMessage({

								name: "headers_available",
								data: { headers },

							});

						};

					}, { urls: [ "https://*.onlyfans.com/*" ] }, [ "requestHeaders" ] );

				},

				init_storage: ( exec ) => {

				},

			// init

				init: ( exec ) => {

					exec( "ctrl_bg", "init_storage" );
					exec( "ctrl_bg", "add_observers" );

				},

		};

	};