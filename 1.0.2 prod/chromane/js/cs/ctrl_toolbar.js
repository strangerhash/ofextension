
	function ctrl_toolbar ( app ) {

		return {

			// UI

				toggle: () => {

					$( "#chromane_iframe_container" ).toggleClass( "active" );

				},

				hide: () => {

					$( "#chromane_iframe_container" ).removeClass( "active" );

				},

				show: () => {

					$( "#chromane_iframe_container" ).addClass( "active" );

				},

			// Injection

				inject_iframe: ( document ) => {

					$( document.documentElement ).append( `

						<div id = "chromane_iframe_container" >

							<div id = "chromane_iframe_toggle_button" >
								
								<svg class = "chromane_chevron_left" style="width:24px;height:24px" viewBox="0 0 24 24">
									<path fill="white" d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z" />
								</svg>
								
								<svg class = "chromane_chevron_right" style="width:24px;height:24px" viewBox="0 0 24 24">
									<path fill="white" d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
								</svg>

							</div>

						</div>

					` );

					var iframe = document.createElement( "iframe" )
					iframe.name = JSON.stringify({ context: "sidebar" });
					iframe.src = chrome.extension.getURL( "/chromane/pages/iframe/index.html" );
					
					document.querySelector( "#chromane_iframe_container" ).append( iframe );

				},

				inject_styles: async ( document ) => {

					var result = await fetch( chrome.extension.getURL( "/chromane/css/content.css" ) );
					var text = await result.text();

					$( document.documentElement ).append( `<style>${ text }</style>` );

				},

				inject: async ( document, exec ) => {

					await exec( "ctrl_toolbar", "inject_styles", document );
					await exec( "ctrl_toolbar", "inject_iframe", document );

				},

		};

	};