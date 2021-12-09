
	function iframe_event_handlers ( app ) {

		return {

			// misc

				send_fetch_request: ( id, url, details, exec ) => {

					window.parent.postMessage({ name: "send_fetch_request", data: {

						id,
						url,
						details,

						headers: app.state.headers,

					} }, "*" );

				},

				headers_available: async ( data, exec ) => {

					app.state.headers = data.headers;

					if ( app.state.headers_available_flag === false ) {

						app.state.headers_available_flag = true;

						await exec( "util", "wait", 2000 );
						/* async_logic 1 1 */
						exec( "iframe_event_handlers", "send_fetch_request", "sub_count", `/api2/v2/subscriptions/count/all`, null );
						/* async_logic 4 1 */
						exec( "iframe_event_handlers", "send_fetch_request", "profile_info", `/api2/v2/users/me`, null );

					};

				},

				fetch_request_result: async ( data, exec ) => {

					// exec( "iframe_event_handlers", "send_fetch_request", "sub_count", `/api2/v2/subscriptions/count/all` );

					if ( data.id === "sub_count" ) {

						/* async_logic 1 2 */

						app.state.sub_count_data = data.result.data;
						exec( "iframe_project", "handle_state_update" );

					} else if ( data.id === "get_subs" ) {

						/* async_logic 2 2 */

						if ( data.result.meta.status === 200 ) {

							app.state.storage[ app.state.sub_data_arr_key ] = app.state.storage[ app.state.sub_data_arr_key ].concat( data.result.data );

							var sub_data_arr = app.state.storage[ app.state.sub_data_arr_key ];

							chrome.storage.local.set( app.state.storage );

							exec( "iframe_project", "handle_state_update" );

							await exec( "util", "wait", 2000 );

							if ( app.state.sub_collection_active ) {

								/* async_logic 2 3 */

								exec( "iframe_event_handlers", "send_fetch_request", "get_subs", `/api2/v2/subscriptions/subscribers?limit=10&offset=${ sub_data_arr.length }&sort=asc&field=expire_date&type=expired`, {

									offset: sub_data_arr.length,

								});

							};

						} else {

							app.state.sub_collection_active = false;
							app.state.model.collect_model.status = "idle";
							app.state.model.collect_model.error_message = "There was an issue with collecing subscribers.";

						};

					} else if ( data.id === "follow" ) {

						/* async_logic 3 2 */

						if ( data.result.meta.status === 200 ) {

							var sub_data = exec( "common", "find", app.state.eligible_sub_data_arr, "id", data.details.sub_data_id );

							if ( app.state.user_data.unlimited_credits ) {

								var should_continue = true;

							} else {

								var remove_credit_result = await exec( "iframe_project", "remove_credit" );

								if ( remove_credit_result.meta.success ) {

									var should_continue = true;

									app.state.user_data = remove_credit_result.data;
									app.state.model.follow_model.metrics.credits = app.state.user_data.credits;

								} else {

									var should_continue = false;

								};

							};

							if ( should_continue ) {

								app.state.model.follow_model.metrics.last_followed_url = "https://onlyfans.com/" + sub_data.username;
								app.state.model.follow_model.metrics.last_followed_name = "@" + sub_data.username;

								sub_data.chromane_followed = true;
								chrome.storage.local.set( app.state.storage );
								await exec( "iframe_project", "handle_state_update" );

								if ( app.state.user_data.unlimited_credits || app.state.user_data.credits > 0 ) {

									exec( "iframe_event_handlers", "follow_step" );

								} else {

									app.state.user_data = remove_credit_result.data;
									app.state.model.follow_model.metrics.credits = app.state.user_data.credits;

									app.state.sub_following_active = false;
									app.state.model.follow_model.status = "idle";
									app.state.model.follow_model.error_message = "Please purchase more credits to continue auto-following.";

								};

							} else {

								app.state.sub_following_active = false;
								app.state.model.follow_model.status = "idle";
								app.state.model.follow_model.error_message = "There was an issue with following subscribers.";

							};

						} else if ( data.result.data && data.result.data.error && ( data.result.data.error.message === "To many requests." ) ) {

							// var sub_data = exec( "common", "find", app.state.eligible_sub_data_arr, "id", data.details.sub_data_id );

							// app.state.model.follow_model.metrics.last_followed_url = "";
							// app.state.model.follow_model.metrics.last_followed_name = "";

							// sub_data.chromane_followed = true;
							// chrome.storage.local.set( app.state.storage );

							// await exec( "iframe_project", "handle_state_update" );

							await exec( "util", "wait", 2000 );

							exec( "iframe_event_handlers", "follow_step" );

						} else if ( data.result.data && data.result.data.error && ( data.result.data.error.message === "Daily limit exceeded. Please try again later." ) ) {

							app.state.sub_following_active = false;
							app.state.model.follow_model.status = "idle";
							app.state.model.follow_model.error_message = "OnlyFans daily limit exceeded. Please try again tomorrow.";

						} else if ( data.result.data && data.result.data.error && ( data.result.data.error.message === "User can not add subscriber." ) ) {

							var sub_data = exec( "common", "find", app.state.eligible_sub_data_arr, "id", data.details.sub_data_id );

							app.state.model.follow_model.metrics.last_followed_url = "";
							app.state.model.follow_model.metrics.last_followed_name = "";

							sub_data.chromane_skipped = true;
							chrome.storage.local.set( app.state.storage );

							await exec( "iframe_project", "handle_state_update" );

							if ( app.state.sub_following_active ) {

								exec( "iframe_event_handlers", "follow_step" );

							};

						} else {

							var sub_data = exec( "common", "find", app.state.eligible_sub_data_arr, "id", data.details.sub_data_id );

							app.state.model.follow_model.metrics.last_followed_url = "";
							app.state.model.follow_model.metrics.last_followed_name = "";

							sub_data.chromane_skipped = true;
							chrome.storage.local.set( app.state.storage );

							await exec( "iframe_project", "handle_state_update" );

							if ( app.state.sub_following_active ) {

								exec( "iframe_event_handlers", "follow_step" );

							};

						};

					} else if ( data.id === "profile_info" ) {

						/* async_logic 4 2 */

						if ( data.result.meta.status === 200 ) {

							console.log( "profile_info", data.result.data );
							app.state.profile_info = data.result.data;
							exec( "iframe_project", "handle_state_update" );

							if ( app.state.profile_info.id && app.state.profile_info.id ) {

								app.state.sub_data_arr_key = "sub_data_arr_" + app.state.profile_info.id;

								if ( app.state.storage.sub_data_arr ) {

									app.state.storage[ app.state.sub_data_arr_key ] = app.state.storage.sub_data_arr;
									app.state.storage.sub_data_arr = null;

								};

								if ( !app.state.storage[ app.state.sub_data_arr_key ] ) {

									app.state.storage[ app.state.sub_data_arr_key ] = [];

								};

								chrome.storage.local.set( app.state.storage );

							};

							exec( "iframe_project", "handle_state_update" );

						};

					};

				},

			// auth

				auth_keypress: ( data, exec ) => {

					if ( data.event.keyCode === 13 ) {

						if ( app.state.model.auth_model.stage_name === "log_in" ) {

							exec( "iframe_event_handlers", "auth_log_in" );

						} else if ( app.state.model.auth_model.stage_name === "sign_up" ) {

							exec( "iframe_event_handlers", "auth_sign_up" );

						};

					};

				},

				auth_go_to_sign_up: () => {

					app.state.model.auth_model.stage_name = "sign_up";

				},

				auth_go_to_log_in: () => {

					app.state.model.auth_model.stage_name = "log_in";

				},

				auth_log_in: () => {

					var am = app.state.model.auth_model;

					am.status = "loading";
					am.error_message = "";
					am.success_message = "";

					firebase.auth().signInWithEmailAndPassword( am.email, am.password )
					.then( async ( result ) => {

						am.stage_name = "log_in_success";

						am.error_message = "";
						am.success_message = "You have been logged in successfully.";
						am.status = "idle";

					})
					.catch( ( error ) => {

						am.error_message = error.message;
						am.success_message = "";
						am.status = "idle";

					});

				},

				auth_sign_up: ( data, exec ) => {

					var am = app.state.model.auth_model;

					am.status = "loading";
					am.error_message = "";
					am.success_message = "";

					firebase.auth().createUserWithEmailAndPassword( am.email, am.password )
					.then( async ( result ) => {

						am.stage_name = "sign_up_success";

						am.error_message = "";
						am.success_message = "Your account has been created successfully.";
						am.status = "idle";

						await exec( "util", "wait", 1000 );
						exec( "iframe_project", "load_user_data" );

						await exec( "util", "wait", 1000 );
						exec( "iframe_project", "load_user_data" );

					})
					.catch( ( error ) => {

						am.error_message = error.message;
						am.success_message = "";
						am.status = "idle";

					});

				},

				auth_success_continue: () => {

					app.state.model.active_second_section_name = "follow";

				},

				handle_auth_state_change: ( user, exec ) => {

					if ( user ) {

						app.state.auth_data.user_is_logged_in = true;
						app.state.auth_data.user_email = user.email;

						firebase.auth().currentUser.getIdToken(true)
						.then( async ( token ) => {

							app.state.auth_data.token = token;
							app.state.auth_data.loaded = true;
							app.state.auth_data.user_is_logged_in = true;
							app.state.auth_data.user_is_upgraded = true;

							exec( "iframe_project", "load_user_data" );
							exec( 'iframe_project', "handle_state_update" );

						})
						.catch( ( err ) => {

							app.state.auth_data.token = null;
							app.state.auth_data.loaded = true;
							app.state.auth_data.user_is_logged_in = false;
							app.state.auth_data.user_is_upgraded = false;

							exec( 'iframe_project', "handle_state_update" );

						});

					} else {

						app.state.auth_data.token = null;
						app.state.auth_data.loaded = true;
						app.state.auth_data.user_is_logged_in = false;
						app.state.auth_data.user_is_upgraded = false;

						exec( 'iframe_project', "handle_state_update" );

					}

				},

			// collect

				start_collecting_click: ( data, exec ) => {

					app.state.sub_collection_active = true;
					app.state.model.collect_model.status = "collecting";
					app.state.model.collect_model.error_message = "";

					chrome.storage.local.set( app.state.storage );

					var sub_data_arr = app.state.storage[ app.state.sub_data_arr_key ];

					/* async_logic 2 1 */
					exec( "iframe_event_handlers", "send_fetch_request", "get_subs", `/api2/v2/subscriptions/subscribers?limit=10&offset=${ sub_data_arr.length }&sort=asc&field=expire_date&type=expired`, {

						offset: sub_data_arr.length,

					});

				},

				stop_collecting_click: () => {

					app.state.sub_collection_active = false;
					app.state.model.collect_model.status = "idle";

					chrome.storage.local.set( app.state.storage );

				},

				delete_collected_accounts: () => {

					var result = window.confirm( "Are you sure you want to delete collected accounts? This will only delete accounts from the extension and you can always collect them later." );

					if ( result ) {

						app.state.storage[ app.state.sub_data_arr_key ] = [];

						chrome.storage.local.set( app.state.storage );

						exec( 'iframe_project', "handle_state_update" );

					};

				},

			// follow

				follow_step: async ( exec ) => {

					if ( app.state.sub_following_active ) {

						var sub_data = app.state.followable_sub_data_arr[ 0 ];

						if ( !sub_data ) {

							app.state.model.follow_model.metrics.next_in_line_url = "";
							app.state.model.follow_model.metrics.next_in_line_name = "";

							while ( true ) {

								await exec( "util", "wait", 2000 );

								var sub_data = app.state.followable_sub_data_arr[ 0 ];

								if ( !app.state.sub_following_active ) {

									return;

								};

								if ( sub_data ) {

									break;

								};

							};

							if ( !app.state.sub_following_active ) {

								return;

							};

						};

						app.state.model.follow_model.metrics.next_in_line_url = "https://onlyfans.com/" + sub_data.username;
						app.state.model.follow_model.metrics.next_in_line_name = "@" + sub_data.username;

						await exec( "util", "wait", 1000 );

						/* async_logic 3 1 */
						exec( "iframe_event_handlers", "send_fetch_request", "follow", `/api2/v2/users/${ sub_data.id }/subscribe`, {

							method: "post",
							body: { source: "fans" },

							sub_data_id: sub_data.id,

						});

					} else {

						app.state.model.follow_model.metrics.next_in_line_url = "";
						app.state.model.follow_model.metrics.next_in_line_name = "";

					};

				},

				start_following_click: async ( data, exec ) => {

					if ( app.state.user_data.credits === 0 && app.state.user_data.unlimited_credits !== true ) {

						app.state.model.follow_model.error_message = "Please purchase more credits to auto-follow.";

					} else {

						app.state.sub_following_active = true;
						app.state.model.follow_model.status = "following";
						app.state.model.follow_model.error_message = "";

						chrome.storage.local.set( app.state.storage );

						exec( "iframe_event_handlers", "follow_step" );

					};

				},

				stop_following_click: ( data, exec ) => {

					app.state.sub_following_active = false;
					app.state.model.follow_model.status = "idle";

					chrome.storage.local.set( app.state.storage );

				},

			// purchase

				purchase_option_click: ( data ) => {

					app.state.model.purchase_model.option_data_arr.forEach( ( option ) => {

						option.selected = false;

					});

					data.option.selected = true;

					exec( 'iframe_project', "handle_state_update" );

				},

				promo_code_input: async ( data, exec ) => {

					var input_ts = Date.now();
					var promo_code = app.state.model.purchase_model.promo_code;

					if ( promo_code === "" ) {

						app.state.model.purchase_model.promo_code_status = "hidden";
						return;

					};

					await exec( "util", "wait", 200 );

					if ( app.state.model.purchase_model.promo_code === promo_code ) {

						app.state.model.purchase_model.promo_code_status = "progress";

						var result = await exec( "iframe_project", "check_promo_code", app.state.model.purchase_model.promo_code );

						if ( result && result.promo_code === promo_code ) {

							if ( result.success ) {

								app.state.model.purchase_model.promo_code_status = "success";
								app.state.model.purchase_model.promo_code_discount = result.discount
								app.state.model.purchase_model.promo_code_success_message = `Promo code ${ result.promo_code } applied successfully. You get a ${ result.discount * 100 }% discount.`;

							} else {

								app.state.model.purchase_model.promo_code_status = "failure";
								app.state.model.purchase_model.promo_code_discount = 0;
								app.state.model.purchase_model.promo_code_failure_message = "The promo code is invalid.";

							};

						} else {

							app.state.model.purchase_model.promo_code_status = "failure";
							app.state.model.purchase_model.promo_code_discount = 0;
							app.state.model.purchase_model.promo_code_failure_message = "The promo code is invalid.";

						};

						exec( 'iframe_project', "handle_state_update" );

					};

				},

				purchase_more_credits: ( data, exec ) => {

					app.state.model.follow_model.purchase_credits_status = "progress";

					var selected_product_data = exec( "common", "find", app.state.model.purchase_model.option_data_arr, "selected", true );

					$.ajax({

						type: "POST",
						url: `${ window.chromane_config.functions_root_url }/create_checkout_session`,
						data: {

							api_version: "1.0.1",
							token: app.state.auth_data.token,
							extension_id: chrome.runtime.id,

							product_name: selected_product_data.product_name,
							promo_code: app.state.model.purchase_model.promo_code,

						},
						success: ( response ) => {

							chrome.tabs.create({

								url: `${ window.chromane_config.hosting_root_url }/stripe_redirect.html#${ response }`,
								active: true,

							});

							console.log( "response", response );

							app.state.model.follow_model.purchase_credits_status = "idle";

						},
						error:  ( e ) => {

							console.log( e );

							app.state.model.follow_model.purchase_credits_status = "idle";

						},

					});

				},

				upgrade_success: () => {

					app.state.model.follow_model.purchase_credits_status = "progress";

					$.ajax({

						type: "POST",
						url: `${ window.chromane_config.functions_root_url }/get_user_data`,
						data: {

							token: app.state.auth_data.token,
							extension_id: chrome.runtime.id

						},
						success: ( response ) => {

							app.state.auth_data.loaded = true;
							app.state.user_data = response;

							app.state.model.follow_model.purchase_credits_status = "idle";

							exec( 'iframe_project', "handle_state_update" );

							alert( "Thank you for purchasing!" );

						},
						error:  ( e ) => {

							app.state.model.follow_model.purchase_credits_status = "idle";

							app.state.auth_data.loaded = false;
							exec( 'iframe_project', "handle_state_update" );

						},

					});

				},

				purchase_go_back: () => {

					app.state.model.active_second_section_name = "follow";

				},

				go_to_purchase: () => {

					app.state.model.active_second_section_name = "purchase";

				},

		}

	};