
	( function () {

		/* init state */

			var _state = {};

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

			app.modules.common = common();
			app.modules.ctrl_bg = ctrl_bg( app );

		/**/

		/* kickstart */

			app.state.config = window.config;

			app.exec.exec( "ctrl_bg", "init" );

		/**/

	} () );