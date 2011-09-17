//
//     Copyright (C) 2011 Loic Dachary <loic@dachary.org>
//
//     This program is free software: you can redistribute it and/or modify
//     it under the terms of the GNU General Public License as published by
//     the Free Software Foundation, either version 3 of the License, or
//     (at your option) any later version.
//
//     This program is distributed in the hope that it will be useful,
//     but WITHOUT ANY WARRANTY; without even the implied warranty of
//     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//     GNU General Public License for more details.
//
//     You should have received a copy of the GNU General Public License
//     along with this program.  If not, see <http://www.gnu.org/licenses/>.
//
(function($) {

    $.bug = {

        post: $.post,

        get: $.get,

        lookup_result: function(data, error_regexp, success_regexp) {
            var error = data.match(error_regexp);
            if(error !== null) {
                $('.error').text(error[1]);
                throw error;
            } else {
                var success = data.match(success_regexp);                
                if(success !== null) {
                    return success[1];
                } else {
                    $('.error').text("could not match " + success_regexp + " on the string returned by the server " + data);
                    throw data;
                }
            }
        },

        // if this string is found in the page returned when 
        // trying to login, it means the login / password combination
        // is invalid.
        state_signin_error_regexp: 'class="throw_error">([^<]*)',
        state_signin_success_regexp: 'Log&nbsp;out</a>([^<]*)',

        state_signin: function() {
            var element = $('.signin');
            $('.go', element).click(function() {
                $('.error').empty();
                $.bug.post('/index.cgi', {
                    Bugzilla_login: $('.user', element).val(),
                    Bugzilla_password: $('.password', element).val()
                }).pipe(function(data) {
                    return $.bug.lookup_result(data,
                                               $.bug.state_signin_error_regexp,
                                               $.bug.state_signin_success_regexp);
                }).pipe(function(data) {
                    $('.username').text(data);
                    element.hide();
                    $.bug.state_component();
                });
            });
            element.show();
        },

        state_component: function() {
            var element = $('.state_component');

            var change_component = function() {
                var component = $(this).val();
                $('.comment', element).hide();
                $('.comment.' + component, element).show();
                $.bug.state_subcomponent();
            };

            $('.component', element).change(change_component);
            $('.component', element).prop("selectedIndex", 0);

            element.show();
        },

        state_subcomponent: function() {
            var element = $('.state_subcomponent');
            var component = $('.state_component .component').val();
            var subcomponent = $('.subcomponents .' + component, element).html();
            $('.active_subcomponent', element).html(subcomponent);
            var change_subcomponent = function() {
                $.bug.refresh_related_bugs();
                $.bug.state_version();
            };

            $('.subcomponent', element).change(change_subcomponent);
            $('.subcomponent', element).prop("selectedIndex", 0);

            element.show();
        },

        state_version: function() {
            var element = $('.state_version');
            if(!element.hasClass('initialized')) {
                $(".versions", element).change(function() {
                    $.bug.state_description();
                });
                $(".versions").prop("selectedIndex", 0);
                element.addClass('initialized');
                element.show();
            }
        },

        state_description: function() {
            var element = $('.state_description');
            if(!element.hasClass('initialized')) {
                var validate = function() {
                    if($(".short", element).val().length > 3 &&
                       $(".long", element).val().length > 10) {
                        $.bug.state_submit();
                    }
                };

                $(".short", element).change(function() { validate(); });
                $(".long", element).keyup(function() { validate(); });
                element.addClass('initialized');
                element.show();
            }
        },

        state_submit_error_string: 'font size="+2">',
        state_submit_success_string: 'title>Bug ',

        state_submit: function() {
            var element = $('.state_submit');
            if(!element.hasClass('initialized')) {
                $('.go', element).click(function() {
                    $.bug.post('/post_bug.cgi', {
                        product: 'LibreOffice',
                        bug_status: 'UNCONFIRMED',
                        rep_platform: 'Other',
                        op_sys: 'All',
                        bug_severity: 'normal',
                        priority: 'medium',
                        assigned_to: 'libreoffice-bugs@lists.freedesktop.org',
                        component: $('.state_component .component').val(),
                        short_desc: $('.state_subcomponent .active_subcomponent .subcomponent').val() + ': ' + $('.state_description .short').val(),
                        version: $('.state_version .versions').val(),
                        comment: $('.state_description .long').val()
                    }, function(data) {
                        var error = data.indexOf($.bug.state_submit_error_string);
                        if(error >= 0) {
                            $('.error').text(data.substring(error + $.bug.state_submit_error_string.length, data.indexOf('<', error)));
                        } else {
                            var success = data.indexOf($.bug.state_submit_success_string);
                            var start = success + $.bug.state_submit_success_string.length;
                            $('.bug', element).text(data.substring(start, data.indexOf(' ', start)));
                            $.bug.state_success();
                            $.bug.state_attach();
                        }
                    });
                });
                element.addClass('initialized');
                element.show();
            }
        },

        state_attach_error_string: 'class="throw_error">',
        state_attach_success_string: 'Attachment #',

        state_attach: function() {
            var element = $('.state_attach');
            var bug = $('.state_submit .bug').text();
            $('.bug', element).val(bug);
            $('form', element).iframePostForm({ complete: function(data) {
                var error = data.indexOf($.bug.state_attach_error_string);
                if(error >= 0) {
                    $('.error').text(data.substring(error + $.bug.state_attach_error_string.length, data.indexOf('<', error)));
                } else {
                    var success = data.indexOf($.bug.state_attach_success_string);
                    var attachment = data.substring(success + $.bug.state_attach_success_string.length, data.indexOf('<', success));
                    $('img', element).attr('src', '/attachment.cgi?id=' + attachment);
                }
            }});
            element.show();
        },

        state_success: function() {
            $('.submission').hide();
            var element = $('.state_success');
            var bug = $('.state_submit .bug').text();
            $('.bug', element).attr('href', '/show_bug.cgi?id=' + bug);
            element.show();
        },

        // if this string is found in the page returned when 
        // trying to fill a bug, it means the user is not logged in
        logged_in_false: 'form name="login"',

        logged_in: function() {
            $("body").css("cursor", "progress");
            return $.bug.get('/enter_bug.cgi').pipe(function(data) {
                $("body").css("cursor", "default");
                return data.indexOf($.bug.logged_in_false) < 0;
            });
        },
        
        refresh_related_bugs: function() {
            $('.related_bugs').empty();
            var component = $('.state_component .component').val().replace('_','%20');
            var subcomponent = $('.state_subcomponent .subcomponent').val();
            var list = '/buglist.cgi?columnlist=short_desc&component=' + component + '&product=LibreOffice&query_format=advanced&short_desc_type=allwordssubstr&ctype=csv&short_desc=' + subcomponent;
            $.bug.get(list, undefined, function(data) {
                var lines = data.split('\n');
                var bug_urls = [];
                for(var i = 1; i < lines.length; i++) {
                    bug_urls.push(lines[i].replace(/([0-9]*),"(.*)"/,'<a href="/show_bug.cgi?id=$1">$2</a>'));
                }
                $('.related_bugs').html(bug_urls.join('<br>'));
            });
        },

        main: function() {
            $.bug.logged_in().done(function(status) {
                if(status) {
                    $.bug.state_component();
                } else {
                    $.bug.state_signin();
                }
            });
        }
    };

})(jQuery);
