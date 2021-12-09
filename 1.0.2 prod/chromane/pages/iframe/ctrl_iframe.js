
	function ctrl_iframe ( app ) {

		return {

			// observers

				add_observers: () => {

					chrome.runtime.onMessage.addListener( ( message ) => {

						exec( "ctrl_iframe", "handle_event", app.state, message.name, message.data );

					});

					window.addEventListener( "message", ( event ) => {

						var name = event.data.name;
						var data = event.data.data;

						if ( name ) {

							exec( "ctrl_iframe", "handle_window_message", app.state, name, data, event );

						};

					});

				},

			// init

				init: async ( context, exec ) => {

					exec( "ctrl_iframe", "add_observers" );

					var init_data = exec( "util", "decode_json", window.name );

					app.state.init_data = init_data;

					exec( "common", "post_window_message", window.parent, "iframe_ready", { init_data } );

					// await exec( "iframe_project", "load_sheet_data" );

					exec( "iframe_project", "handle_state_update" );

					// set up firebase auth

						const firebaseConfig = {

							apiKey: "AIzaSyCHFco8bF3gj4qgAreLRQeyD6WHpRVvK_k",
							authDomain: "onlyfans-automator.firebaseapp.com",
							projectId: "onlyfans-automator",
							storageBucket: "onlyfans-automator.appspot.com",
							messagingSenderId: "510640578841",
							appId: "1:510640578841:web:e664d7188d0817a8d26588"

						};

						// Initialize Firebase

						firebase.initializeApp( firebaseConfig );
						firebase.auth().onAuthStateChanged( ( user ) => {

							app.exec.exec( "iframe_event_handlers", "handle_auth_state_change", user );

						});

					app.state.storage = await exec( "chrome", "call", "storage.local.get", null );

				},

				update_model: () => {

				},

				open_drawer: async ( state, exec ) => {

					document.querySelector( "#drawer_overlay" ).style.display = "block";

					await exec( "util", "wait", 20 );

					document.querySelector( "#drawer_overlay" ).classList.add( "opened" );

				},

				close_drawer: async function ( state, exec ) {

					document.querySelector( "#drawer_overlay" ).classList.remove( "opened" );

					await exec( "util", "wait", 200 );

					document.querySelector( "#drawer_overlay" ).style.display = "none";

				},

				update_state: ( state, new_state, exec ) => {

					function update_object ( object, new_object ) {

						Object.keys( new_object ).forEach( ( key ) => {

							if ( object[ key ] !== null && typeof object[ key ] === "object" ) {

								update_object( object[ key ], new_object[ key ]);

							} else {

								object[ key ] = new_object[ key ];

							};

						});

					};

					update_object( state, new_state );

					exec( "iframe_project", "handle_state_update" );

				},

				handle_event: async ( state, name, data, exec ) => {

					if ( name === "menu_button_click" ) {

						exec( "ctrl_iframe", "open_drawer", state );

					} else if ( name === "drawer_overlay_click" ) {

						exec( "ctrl_iframe", "close_drawer", state );

					} else if ( name === "drawer_click" ) {

						data.event.stopPropagation();

					} else if ( name === 'drawer_item_click' ) {

						if ( data.item_name === "log_out" ) {

							firebase.auth().signOut().then(() => {

								app.state.auth_data.user_is_logged_in = false;
								app.state.model.auth_model.stage_name = "log_in";
								exec( 'iframe_project', "handle_state_update" );

							}, function ( error ) {} );

							exec( "ctrl_iframe", "close_drawer", state );

						} else if ( data.item_name === "toggle_present_mode" ) {

							window.parent.postMessage({ name: "toggle_present_mode" }, "*" );

						} else if ( data.item_name === "download_log" ) {

							window.parent.postMessage({ name: "download_log" }, "*" );
							exec( "ctrl_iframe", "close_drawer", state );

						};

					} else if ( name === "sign_in_button_click" ) {

						exec( "sheets", "sign_in" );

					} else if ( name === "close_button_click" ) {

						window.parent.postMessage({ name: "toggle_iframe" }, "*" );

					} else {

						exec( "iframe_event_handlers", name, data );

					};

				},

				handle_window_message: async ( state, name, data, event, exec ) => {

					if ( name === "exec" ) {

						for ( var i = 0; i < data.exec_arr.length; i++ ) {

							for ( var j = 0; j < data.exec_arr[ i ].length; j++ ) {

								if ( data.exec_arr[ i ][ j ] === "_state_" ) {

									data.exec_arr[ i ].splice( j, 1, state );

								};

							};

							await exec.apply( null, data.exec_arr[ i ] );

						};

					} else if ( name === "set_page_info" ) {

						app.state.sub_count_data = {
							subscribers: {
								expired: 3333,
							}
						};

						state.page_info = data.page_info;

						exec( "iframe_project", "handle_state_update" );

					} else {

						exec( "iframe_event_handlers", name, data );

					};

				},

		};

	};