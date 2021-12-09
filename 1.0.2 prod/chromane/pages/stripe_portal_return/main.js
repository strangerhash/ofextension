
	( function () {

		chrome.runtime.sendMessage({

			module_name: "ctrl_bg",
			method_name: "handle_stripe_page",
			arg_arr: [ "stripe_portal_return", "_tab_" ]

		});

	} () );