
	function ctrl_main ( app, exec ) {

		return {

			// add_observers

				handle_window_message: async ( state, name, data, event, exec ) => {

					if ( name === "toggle_iframe" ) {

						exec( "ctrl_toolbar", "toggle" );

					} else if ( name === "open_iframe" ) {

						exec( "ctrl_toolbar", "show" );

					} else if ( name === "toggle_present_mode" ) {

						$( document.body ).toggleClass( "chromane-present-mode" );

						if ( document.body.classList.contains( "chromane-present-mode" ) ) {

							chrome.storage.local.set({ present_mode: true });

						} else {

							chrome.storage.local.set({ present_mode: false });

						};

					} else {

						exec( "cs_event_handlers", name, data );

					};

				},

				add_observers: () => {

					$( document ).on( "click", "#chromane_iframe_toggle_button", () => {

						$( "#chromane_iframe_container" ).toggleClass( "active" );

					});

					window.addEventListener( "message", ( event ) => {

						var name = event.data.name;
						var data = event.data.data;

						if ( name ) {

							exec( "ctrl_main", "handle_window_message", app.state, name, data, event );

						};

					});

				},

			// main

				init: async ( exec ) => {

					chrome.storage.local.get([ "present_mode" ], ( storage ) => {

						if ( storage.present_mode ) {

							$( document.body ).addClass( "chromane-present-mode" );

						};

					});

					exec( "ctrl_main", "add_observers" );
					exec( "ctrl_toolbar", "inject", document );

				},

		};

	};
