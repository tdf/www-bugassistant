/*
 * This file is part of the LibreOffice BSA project.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
(function($) {
    $.bugzilla = {

        url: 'https://www.libreoffice.org/bugzilla',
        cookieName: 'BSA_id',
        email: null,
        isSearchingDuplicates: false,

        // This function calls the XMLRPC-function.
        // Returns the data or throws an error.
        call: function(method, parameters = null, async = false, returnFunction = null) {
            var result;
            $.xmlrpc({
                async: async,
                url: $.bugzilla.url + "/xmlrpc.cgi",
                methodName: method,
                params: parameters
            }).always(function(data) {
                result = data[0];
                if (method == "Bug.possible_duplicates") {
                    $.bugzilla.isSearchingDuplicates = false;
                    result = result.bugs;
                }
                if (returnFunction != null) {
                    returnFunction(result);
                }
            }).fail(function(obj, obj2, error) {
                throw error;
            });
            return result;
        },

        // This function logs a user in.
        // Returns the id or throws an error.
        login: function(user,pass) {
            $.bugzilla.email = null;
            try {
                var user = $.bugzilla.call("User.login",
                                           [{login:user,
                                             password: pass}]);
            } catch(error) {
                if (error.code != undefined)
                    $.bugzilla.setCookie($.bugzilla.cookieName, null);
                throw error;
            }
            $.bugzilla.setCookie($.bugzilla.cookieName, escape(user.id));
            return user.id;
        },

        // This function logs a user out
        // It doesn't care of any is logged in
        // Returns nothing
        logout: function() {
            $.bugzilla.setCookie($.bugzilla.cookieName, null);
            $.bugzilla.email = null;
            try {
                $.bugzilla.call("User.logout");
            } catch(error) {
                //Won't do anything we are logged out anyway now
            }
        },

        // This function gets the user that is logged in as kept in a cookie
        // Returns the user-id of the user logged in or null
        getCurrentUserId: function() {
            return $.bugzilla.getCookie($.bugzilla.cookieName);
        },

        // This function gets the user that is logged in and checks it with bugzilla
        // Returns if a user is logged in
        isLoggedIn: function() {
            return ($.bugzilla.getAccountEmail() != null);
        },

        // This function gets the email of the logged in user
        // Returns the email of the logged in user
        getAccountEmail: function() {
            var id = $.bugzilla.getCurrentUserId();
            if (id == null && $.bugzilla.email != null) {
                $.bugzilla.email = null;
            } else if (id != null && $.bugzilla.email == null) {
                try {
                    var answer = $.bugzilla.call("User.get", [{ids: [ id ], include_fields: [ "email" ]}]);
                    $.bugzilla.email = answer.users[0].email;
                } catch(error) {
                    if (error.code != undefined)
                        $.bugzilla.setCookie($.bugzilla.cookieName, null);
                    throw error;
                }
            }
            return $.bugzilla.email;
        },

        // This function sends a request to bugzilla for a account on the given email
        // Bugzilla then checks if email is allowed and sends a english email to the user
        // Returns nothing
        sendAccountEmail: function(email) {
            $.bugzilla.call("User.offer_account_by_email", [{email: email}]);
        },

        // This function sends a request to bugzilla to search similar bugs based on the summary
        // The returnFunction needs to be a function with 1 parameter that is an array with bugs
        // Returns true if searching or false if it is already busy
        searchDuplicates: function(summary, returnFunction) {
            if ($.bugzilla.isSearchingDuplicates) {
                return false;
            }
            $.bugzilla.isSearchingDuplicates = true;
            $.bugzilla.call("Bug.possible_duplicates",
                             [{summary: summary,
                               product: [ "LibreOffice" ],
                               include_fields: [ "id", "summary", "status", "product" ]}],
                             true, returnFunction);
            return true;
        },

        // This function creates a bug without attachments in bugzilla
        // Returns the bugnumber if created or throws a error.
        createBug: function(component, summary, version, description, op_sys, whiteboard) {
            var bug = $.bugzilla.call("Bug.create",
                                      [{product: "LibreOffice",
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

        // This function gets the attachments attached to the bug
        // Returns the attachments
        getAttachmentsOfBug: function (id) {
            var bug = $.bugzilla.call("Bug.attachments",
                                      [{ ids: [ id ] }]);
            return bug.bugs;
        },


        // This function gets the value of the cookie-variable with that name
        // Returns the value of the cookie-variable or null
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

        // This function sets the cookie-variable given with the value untill 2038
        // Returns nothing
        setCookie: function( name, value ) {
            if (value == null) {
              document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
            } else {
              document.cookie = name + "=" + escape(value) + "; expires=vr, 01 Jan 2038 00:00:01 GMT;";
            }
        }

    };
})(jQuery);
