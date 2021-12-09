
	( function () {

		// Vue.config.errorHandler = function ( err, vm, info ) {};

		var _state = {

			config: window.config,
			model: {},

		};

		function init_vue ( model ) {

			window.main_vm = new Vue({

				el: "#root",
				data: { model },

				render: function () { return window.iframe_render.apply( this ) },
				staticRenderFns: ( function () { return window.iframe_static_render_fns.apply( this ) } () ),

				methods: {

					handle_event: function ( name, data ) {

						window.exec( "ctrl_iframe", "handle_event", _state, name, data );

					},

				},

			});

		};

		( async function ( x ) {

			var app = window.app = {

				name: "iframe",

				log: null,
				exec: null,

				state: _state,
				modules: {},

			};

			app.log = x.modules.log( app, window.config.mode );
			app.exec = x.modules.exec( app, window.config.mode );

			app.modules.chrome = x.modules.chrome( app );
			app.modules.util = x.util;

			app.modules.ctrl_iframe = ctrl_iframe( app );
			app.modules.common = common( app );

			app.modules.iframe_event_handlers = iframe_event_handlers( app );
			app.modules.iframe_project = iframe_project( app );


			// init

			app.exec.exec( "iframe_project", "init_state", app.state );

			window.exec = app.exec.exec;
			init_vue( app.state.model );

			await app.exec.exec( "ctrl_iframe", "init", app );

		} ( window[ window.webextension_library_name ] ) );

	} () )