/*
 * This file is part of the LibreOffice BSA project.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
(function($) {
    $.bugzilla = {

        url: 'https://www.libreoffice.org/bugzilla/xmlrpc.cgi',
        cookieName: 'BSA_id',
        email: '',
        lastError: '',

        call: function(method, parameters) {
            var result;
            $.xmlrpc({
                async: false,
                url: $.bugzilla.url,
                methodName: method,
                params: parameters
            }).always(function(data) {
                result = data[0];
            }).fail(function(obj, obj2, error) {
                $.bugzilla.lastError = error.msg;
                throw error.code;
            });
            return result;
        },

        login: function(user,pass) {
            //The bugzilla-server can be set to different default-values for "remember"
            //we try without this paramter for now.
            var user = $.bugzilla.call("User.login", [{login:user,
                                                       password: pass}]);
            $.bugzilla.setCookie($.bugzilla.cookieName, escape(user.id));
            $.bugzilla.email = "";
            return user.id;
        },

        logout: function() {
            $.bugzilla.setCookie($.bugzilla.cookieName, null);
            $.bugzilla.email = "";
            try {
                $.bugzilla.call("User.logout");
            } catch(error) {
                //Won't do anything we are logged out anyway now
            }
        },

        getCurrentUserId: function() {
            return $.bugzilla.getCookie($.bugzilla.cookieName);
        },

        isLoggedIn: function() {
            if ($.bugzilla.email == "") try {
                $.bugzilla.getAccountEmail( $.bugzilla.getCurrentUserId() );
            } catch(error) {
                //Won't do anything with this, we are logged out
            }
            if ($.bugzilla.email == "") {
                $.bugzilla.setCookie($.bugzilla.cookieName, null);
            }
            return ($.bugzilla.email != "");
        },

        getAccountEmail: function(id) {
            if ($.bugzilla.email == "") {
                var answer = $.bugzilla.call("User.get", [{ids: [ id ], include_fields: [ "email" ]}]);
                $.bugzilla.email = answer.users[0].email;
            }
            return $.bugzilla.email;
        }, 

        sendAccountEmail: function(email) {
            $.bugzilla.call("User.offer_account_by_email", [{email: email}]);
        },

        searchDuplicates: function(summary) {
            var answer = $.bugzilla.call("Bug.possible_duplicates", [{summary: summary,
                                                                      products: [ "LibreOffice" ],
                                                                      include_fields: [ "id", "summary", "status" ]}]);
            return answer.bugs;
        },

        createBug: function(component, summary, version, description, op_sys, whiteboard) {
            var bug = $.bugzilla.call("Bug.create", [{product: "LibreOffice",
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
            return bug.id;
        },

        getCookie: function( name ) {
            var start = document.cookie.indexOf( name + "=" );
            var len = start + name.length + 1;
            if ( ( !start ) && ( name != document.cookie.substring( 0, name.length ) ) )
            {
                return null;
            }
            if ( start == -1 ) return null;
            var end = document.cookie.indexOf( ";", len );
            if ( end == -1 ) end = document.cookie.length;
                return unescape( document.cookie.substring( len, end ) );
        },

        setCookie: function( name, value ) {
	    if (value == null) {
              document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
	    } else {
              document.cookie = name + "=" + escape(value);
	    }
        }

    };
})(jQuery);
