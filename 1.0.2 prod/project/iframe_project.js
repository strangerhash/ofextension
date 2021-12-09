
	function iframe_project ( app ) {

		return {

			handle_state_update: async ( exec ) => {

				if ( app.state.init_data.context === "browser_action_popup" ) {

					app.state.model.active_page_name = "popup";

					await exec( "util", "wait", 100 );

					if ( document.querySelector( "#iframe_container iframe" ) === null ) {

						$( "#iframe_container" ).append( `<iframe src="https://www.youtube.com/embed/qXQUhpx8KD0" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"></iframe>` );

					};

				} else {

					// purchase button text

						var selected_product_data = exec( "common", "find", app.state.model.purchase_model.option_data_arr, "selected", true );
						var total_price = selected_product_data.price_number * ( 1 - app.state.model.purchase_model.promo_code_discount );
						var total_price_text = currency( total_price ).format();

						app.state.model.purchase_model.purchase_button_text = `Buy ${ selected_product_data.credits_text } follows for ${ total_price_text }`;

					app.state.model.drawer_item_hash.toggle_present_mode = true;

					if ( app.state.auth_data.user_is_logged_in ) {

						if ( app.state.model.active_second_section_name !== "purchase" ) {

							app.state.model.active_second_section_name = "follow";

						};

						app.state.model.drawer_item_hash.log_out = true;

					} else {

						app.state.model.active_second_section_name = "auth";
						app.state.model.drawer_item_hash.log_out = false;

					};

					// if ( app.state.active_second_section_name === "auth" ) {

					// } else if ( app.state.active_second_section_name === "follow" ) {

					// } else if ( app.state.active_second_section_name === "purchase" ) {

					// } else {

					// }

					if ( app.state.sub_count_data && app.state.profile_info && app.state.storage ) {

						app.state.model.page_info = app.state.page_info;
						app.state.model.active_page_name = "main";

						// console.log( 'app.state.eligible_sub_data_arr', app.state.eligible_sub_data_arr );

						var sub_data_arr = app.state.storage[ app.state.sub_data_arr_key ];

						app.state.eligible_sub_data_arr = sub_data_arr.filter( ( data ) => {

							if ( data.subscribePrice === 0 && data.subscribedBy !== true && data.canAddSubscriber === true ) {

								return true;

							} else {

								return false;

							};

						});

						// console.log( 'app.state.eligible_sub_data_arr', app.state.eligible_sub_data_arr );

						// console.log( 'app.state.followable_sub_data_arr', app.state.followable_sub_data_arr );

						app.state.followable_sub_data_arr = app.state.eligible_sub_data_arr.filter( ( data ) => {

							if ( data.chromane_followed === true || data.chromane_skipped === true ) {

								return false;

							} else {

								return true;

							};

						});

						// console.log( 'app.state.followable_sub_data_arr', app.state.followable_sub_data_arr );

						app.state.model.collect_model.metrics.expired = app.state.sub_count_data.subscribers.expired;
						app.state.model.collect_model.metrics.collected = sub_data_arr.length;
						app.state.model.collect_model.metrics.eligible = app.state.eligible_sub_data_arr.length;

						app.state.model.follow_model.metrics.credits = app.state.user_data.credits;
						
						if ( app.state.user_data.unlimited_credits ) {
						
							app.state.model.follow_model.metrics.credits = "Unlimited";

						};

						app.state.model.follow_model.metrics.eligible = app.state.eligible_sub_data_arr.length;
						app.state.model.follow_model.metrics.followed_total = app.state.eligible_sub_data_arr.filter( ( data ) => {

							if ( data.chromane_followed === true ) {

								return true;

							} else {

								return false;

							};

						}).length;

						// https://onlyfans.com/api2/v2/users/43264624/subscribe
						// 					{source: "fans"}
						// source: "fans"

						// app.state.model_qa_data_arr = exec( "iframe_project", "get_model_qa_data_arr", app.state.sheet_data.questions, app.state.sheet_data.answers, app.state.page_info.model_id );
						// app.state.model.faq_model.qa_data_arr = exec( "iframe_project", "filter_qa_data_arr", app.state.model_qa_data_arr, app.state.model.faq_model.category, app.state.model.faq_model.type, app.state.model.faq_model.query );

					} else {

						app.state.model.active_page_name = "progress";

					};

				};

			},

			load_user_data: ( exec ) => {

				$.ajax({

					type: "POST",
					url: `${ window.chromane_config.functions_root_url }/get_user_data`,
					data: {

						token: app.state.auth_data.token,
						extension_id: chrome.runtime.id

					},
					success: ( response ) => {

						if ( response ) {

							app.state.auth_data.loaded = true;
							app.state.user_data = response;

							exec( 'iframe_project', "handle_state_update" );

						};

					},
					error:  ( e ) => {

						app.state.auth_data.loaded = false;
						exec( 'iframe_project', "handle_state_update" );

					},

				});

			},

			check_promo_code: async ( promo_code, exec ) => {

				var result = await fetch( `${ window.chromane_config.functions_root_url }/check_promo_code`, {

					method: "POST",
					headers: {
						"content-type": "application/json",
					},
					body: JSON.stringify({

						promo_code,

					}),

				});

				var json = await result.json();

				return json;

			},

			remove_credit: ( exec ) => {

				return new Promise( ( resolve ) => {

					$.ajax({

						type: "POST",
						url: `${ window.chromane_config.functions_root_url }/remove_credit`,
						data: {

							token: app.state.auth_data.token,
							extension_id: chrome.runtime.id

						},
						success: ( response ) => {

							resolve({ meta: { success: true }, data: response });

						},
						error: ( e ) => {

							resolve({ meta: { success: false } });

						},

					});

				});

			},

			init_state: ( state ) => {

				state.page_info = {

					page_name: "model",
					model_id: null,

				};

				state.auth_data = {

					token: null,
					loaded: false,
					user_is_upgraded: null,
					user_is_logged_in: null,
					user_email: null,

				};

				state.user_data = null;

				state.headers_available_flag = false;

				state.model_qa_data_arr = [];

				state.active_second_section_name = "";

				state.model = {

					active_page_name: "progress",
					root_url: "chrome-extension://" + chrome.runtime.id,
					active_second_section_name: "",

					page_info: {

						page_name: "not_defined",
						model_id: null,

					},

					drawer_item_hash: {

						log_out: false,
						download_log: false,
						toggle_present_mode: false,

					},

					collect_model: {

						active: true,
						status: "idle",

						error_message: "",

						metrics: {

							expired: 0,
							collected: 0,
							eligible: 0,

						},

					},

					follow_model: {

						active: false,
						status: "idle",

						error_message: "",

						metrics: {

							credits: 0,
							eligible: 0,
							followed_total: 0,
							followed_today: 0,

							last_followed_url: "",
							last_followed_name: "",

							next_in_line_url: "",
							next_in_line_name: "",

						},

						purchase_credits_status: "idle",

					},

					purchase_model: {

						active: false,

						promo_code: "",
						promo_code_status: "hidden",
						promo_code_success_message: "",
						promo_code_failure_message: "",
						promo_code_discount: 0,

						number_of_credits: 3000,
						price: "$300",

						purchase_button_text: "Buy",

						option_data_arr: [

							{

								selected: false,

								price_text: "$100",
								product_name: "100",
								price_number: 100,

								credits_text: "1,100",
								credits_number: 1100,
								credits_per_dollar: 11
							},

							{

								selected: false,

								price_text: "$200",
								product_name: "200",
								price_number: 200,

								credits_text: "2,400",
								credits_number: 2400,
								credits_per_dollar: 12
							},

							{

								selected: true,

								price_text: "$300",
								product_name: "300",
								price_number: 300,

								credits_text: "3,900",
								credits_number: 3900,
								credits_per_dollar: 13
							},

							{

								selected: false,

								price_text: "$500",
								product_name: "500",
								price_number: 500,

								credits_text: "7,500",
								credits_number: 7500,
								credits_per_dollar: 15
							},

							{

								selected: false,

								price_text: "$1,000",
								product_name: "1000",
								price_number: 1000,

								credits_text: "20,000",
								credits_number: 20000,
								credits_per_dollar: 20
							},

							{

								selected: false,

								price_text: "$2,000",
								product_name: "2000",
								price_number: 2000,

								credits_text: "Unlimited",
								credits_number: 9999999,
								credits_per_dollar: "hidden",
							},

						],

					},

					auth_model: {

						active: false,

						stage_name: "sign_up",
						status: "idle",

						error_message: "",
						success_message: "",

						email: "",
						password: "",

					},

				};

			},

		}

	};