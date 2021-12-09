
	function common () {

		return {

			post_window_message: ( target, name, data ) => {

				target.postMessage( { name, data }, "*" );

			},

			background_exec: async function () {

				var argument_arr = Array.from( arguments );

				var module_name = argument_arr[ 0 ];
				var method_name = argument_arr[ 1 ];
				var arg_arr = argument_arr.slice( 2, -1 );
				var exec = argument_arr[ argument_arr.length - 1 ];

				return await exec( "chrome", "call", "runtime.sendMessage", { module_name, method_name, arg_arr } );

			},

			download_string: ( str, name ) => {
						
				var blob = new Blob([ str], { type: 'text/plain' } );
				var url = URL.createObjectURL( blob );
				var a = document.createElement("a");

				document.body.appendChild( a );
				a.style = "display: none";
				a.href = url;
				a.download = name;
				a.click();
			
				window.URL.revokeObjectURL( url );

			},

			find: ( arr, key, value ) => {

				for ( var i = 0; i < arr.length; i++ ) {

					if ( arr[ i ][ key ] === value ) {

						return arr[ i ];

					};

				};

				return null;

			},

		};

	};