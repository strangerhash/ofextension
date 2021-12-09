
	function cs_event_handlers ( app ) {

		return {

			send_fetch_request: async ( data, exec ) => {

				/* async_logic 10 1 */

				document.querySelector( "#chromane_sign_iframe" ).contentWindow.postMessage({

					name: "sign_url",
					data

				}, "*" );

			},

			sign_url_result: async ( data, exec ) => {

				/* async_logic 10 2 */

				data.headers[ "sign" ] = data.sign_result.sign;
				data.headers[ "time" ] = data.sign_result.time;
				data.headers[ "accept" ] = "application/json, text/plain, */*";

				if ( data.details && data.details.method === "post" ) {

					data.headers[ "content-type" ] = "application/json";

					var result = await fetch( data.url, {

						method: "post",
						headers: data.headers,
						body: JSON.stringify( data.details.body ),

					});

				} else {

					var result = await fetch( data.url, {

						headers: data.headers,

					});

				};

				var json = await result.json();

				exec( "common", "post_window_message", $( "#chromane_iframe_container iframe" ).get( 0 ).contentWindow, "fetch_request_result", {

					id: data.id,
					url: data.url,
					details: data.details,

					result: {

						meta: { status: result.status },
						data: json

					},

				});

			},

			check_promo_code: () => {

			},

			set_fake_page_info: ( data, exec ) => {

				exec( "common", "post_window_message", $( "#chromane_iframe_container iframe" ).get( 0 ).contentWindow, "set_page_info", {

					page_info: {

						page_name: "model",
						model_id: "@test",

					},

				});

			},

			sign_url_result: async ( data, exec ) => {

				/* async_logic 10 2 */

				data.headers[ "sign" ] = data.sign_result.sign;
				data.headers[ "time" ] = data.sign_result.time;
				data.headers[ "accept" ] = "application/json, text/plain, */*";

				if ( data.details && data.details.method === "post" ) {

					data.headers[ "content-type" ] = "application/json";

					var result = await fetch( data.url, {

						method: "post",
						headers: data.headers,
						body: JSON.stringify( data.details.body ),

					});

				} else {

					var result = await fetch( data.url, {

						headers: data.headers,

					});

				};

				var json = await result.json();

				exec( "common", "post_window_message", $( "#chromane_iframe_container iframe" ).get( 0 ).contentWindow, "fetch_request_result", {

					id: data.id,
					url: data.url,
					details: data.details,

					result: {

						meta: { status: result.status },
						data: json

					},

				});

			},

		}

	};