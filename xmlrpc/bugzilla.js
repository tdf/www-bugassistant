/*
 * This file is part of the LibreOffice BSA project.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
(function($) {
    $.bugzilla = {

        url: 'https://bugassistant.libreoffice.org/xmlrpc.cgi',

        call: function(method, parameters) {
	    var result;
            $.xmlrpc({
                async: false,
                url: $.bugzilla.url,
                methodName: method,
                params: parameters
	    }).always(function(data) { 
	        result = data;
	    }).fail(function(error) {
	        alert("error");
	        throw error;
	    });
	    return result;
        },

        login: function(user,pass) {
            //The bugzilla-server can be set to different default-values for "remember"
            //we try without this paramter for now.
            var user = $.bugzilla.call("User.login", [{login:user,
				 		       password: pass}]);
	    return user[0].id;
        },

	logout: function() {
	    $.bugzilla.call("User.logout");
	},

	sendAccountEmail: function(email) {
	    $.bugzilla.call("User.offer_account_by_email",email);
	},

	searchDuplicates: function(summary) {
	    return $.bugzilla.call("Bug.possible_duplicates", [{summary: summary, 
                                                                products: [ "LibreOffice" ]}]);
	},

	createBug: function(component, summary, version, description, op_sys, whiteboard) {
	    return $.bugzilla.call("Bug.create", [{product: "LibreOffice",
						   component: component,
                                                   summary: summary,
                                                   version: version,
                                                   description: description,
                                                   op_sys: op_sys,
                                                   platform: "All",
                                                   priority: "medium",
                                                   severity: "normal",
                                                   assigned_to: "libreoffice-bugs@lists.freedesktop.org",
                                                   status: "UNCONFIRMED",
                                                   status_whiteboard: whiteboard}]);
	}

    };
})(jQuery);
