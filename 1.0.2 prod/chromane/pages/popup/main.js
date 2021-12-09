
	( function () {

		var iframe = document.createElement( "iframe" );
		iframe.name = JSON.stringify({ context: "browser_action_popup" });
		iframe.src = chrome.extension.getURL( "/chromane/pages/iframe/index.html" );
		document.body.querySelector( "#root" ).appendChild( iframe );

		window.addEventListener( "message", ( event ) => {

			var name = event.data.name;
			var data = event.data.data;

			if ( name === "button_click" && data.name === "close" ) {

				window.close();

			} else if ( name === "toggle_iframe" ) {

				window.close();

			};

		});

	} () )