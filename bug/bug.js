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

        ajax: function(type, url, args, callback) {
            return $.ajax({
                type: type,
                url: url,
                data: args,
                success: callback
            }).pipe(null, function(error) {
                var message = url + '(' + $.param(args) + ') XHR error. ';
                if('status' in error) {
                    message += 'status = ' + error.status + ' ';
                }
                if('responseText' in error) {
                    message += 'responseText = ' + error.responseText + ' ';
                }
                if('statusText' in error) {
                    message += 'statusText = ' + error.statusText + ' ';
                }
                $.bug.error_set(message);
                throw error;
            });
        },

        lookup_result: function(data, error_regexp, success_regexp) {
            var error = data.match(error_regexp);
            if(error !== null) {
                $.bug.error_set(error[1]);
                throw error;
            } else {
                var success = data.match(success_regexp);                
                if(success !== null) {
                    return success[1];
                } else {
                    $.bug.error_set("could not match " + success_regexp + " on the string returned by the server " + data);
                    throw data;
                }
            }
        },

        current_step: function(name) {
            $('.step').removeClass('current');
            $('.step_' + name).addClass('current');
        },

        error_clear: function() {
            $('.error-container').hide();
        },

        error_set: function(message) {
            $('.error').text(message);
            $('.error-container').show();
        },

        state_signin_error_regexp: 'class="throw_error">([^<]*)',
        state_signin_success_regexp: 'Log&nbsp;out</a>([^<]*)',

        state_signin: function() {
            var element = $('.signin');
            $('.go', element).click(function() {
                $("body").css("cursor", "progress");
                $.bug.error_clear();
                $.bug.ajax('POST', '/index.cgi', {
                    Bugzilla_login: $('.user', element).val(),
                    Bugzilla_password: $('.password', element).val()
                }).pipe(function(data) {
                    $("body").css("cursor", "default");
                    return $.bug.lookup_result(data,
                                               $.bug.state_signin_error_regexp,
                                               $.bug.state_signin_success_regexp);
                }).pipe(function(data) {
                    $('.username').html(data);
                    element.hide();
                    $.bug.state_component();
                });
            });
            $.bug.current_step('signin');
            element.show();
        },

        state_component: function() {
            var element = $('.state_component');

            $.bug.current_step('component');
            element.show();
            $('.select', element).select();
            $('.select .choice, img', element).click(function() {
                var component = $(this).attr('data');
                $('.select .chosen', element).attr('data', component);
                $('.comment', element).hide();
                $('.comment.' + component, element).show();
                $.bug.state_subcomponent();
            });
        },

        state_subcomponent: function() {
            var element = $('.state_subcomponent');
            var component = $('.state_component .chosen').attr('data');
            var subcomponent = $('.subcomponents .' + component, element).html();
            $('.active_subcomponent', element).html(subcomponent);
            if(!element.hasClass('initialized')) {
                element.addClass('initialized');
                $.bug.current_step('subcomponent');
            }
            element.show();
            $('.active_subcomponent .select', element).select();
            $('.active_subcomponent .select .choice', element).click(function() {
                $.bug.refresh_related_bugs();
                $.bug.state_version();
            });
        },

        state_version: function() {
            var element = $('.state_version');
            if(!element.hasClass('initialized')) {
                element.addClass('initialized');
                $.bug.current_step('version');
                element.show();
                $('.select', element).select();
                $(".select .choice", element).click(function() {
                    $.bug.state_description();
                });
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
                $.bug.current_step('description');
                element.show();
            }
        },

        state_submit_error_regexp: 'font size="\\+2">([^<]*)',
        state_submit_success_regexp: 'title>Bug ([0-9]+)',

        state_submit: function() {
            var element = $('.state_submit');
            if(!element.hasClass('initialized')) {
                $('.go', element).click(function() {
                    var version = $('.state_version .chosen').attr('data');
                    var component = $('.state_component .chosen').attr('data');
                    var short_desc = $('.state_subcomponent .active_subcomponent .chosen').attr('data') + ': ' + $('.state_description .short').val();
                    var comment = $('.state_description .long').val();
                    $("body").css("cursor", "progress");
                    $.bug.ajax('POST', '/post_bug.cgi', {
                        product: 'LibreOffice',
                        bug_status: 'UNCONFIRMED',
                        rep_platform: 'Other',
                        op_sys: 'All',
                        bug_severity: 'normal',
                        priority: 'medium',
                        assigned_to: 'libreoffice-bugs@lists.freedesktop.org',
                        component: component,
                        version: version,
                        short_desc: short_desc,
                        comment: comment
                    }).pipe(function(data) {
                        $("body").css("cursor", "default");
                        return $.bug.lookup_result(data,
                                                   $.bug.state_submit_error_regexp,
                                                   $.bug.state_submit_success_regexp);
                    }).pipe(function(data) {
                        $('.bug', element).text(data);
                        $.bug.state_success();
                        $.bug.state_attach();
                    });
                });
                element.addClass('initialized');
                $.bug.current_step('submit');
                element.show();
            }
        },

        state_attach_error_regexp: 'class="throw_error">([^<]*)',
        state_attach_success_regexp: 'Attachment #([0-9]+)',

        state_attach: function() {
            var element = $('.state_attach');
            var bug = $('.state_submit .bug').text();
            $('.bug', element).val(bug);
            $('form', element).iframePostForm({ complete: function(data) {
                var attachment = $.bug.lookup_result(data,
                                                     $.bug.state_attach_error_regexp,
                                                     $.bug.state_attach_success_regexp);
                $('img', element).
                    attr('src', '/attachment.cgi?id=' + attachment).
                    show();
                
            }});
            $("input[type='file']", element).change(function() {
                $("input[type='text']", element).val($(this).val());
            });
            $.bug.current_step('attach');
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
            return $.bug.ajax('GET', '/enter_bug.cgi').pipe(function(data) {
                $("body").css("cursor", "default");
                return data.indexOf($.bug.logged_in_false) < 0;
            });
        },
        
        refresh_related_bugs: function() {
            $('.related_bugs').empty();
            var component = $('.state_component .chosen').attr('data').replace('_','%20');
            var subcomponent = $('.state_subcomponent .active_subcomponent .chosen').attr('data');
            var list = '/buglist.cgi?columnlist=short_desc&component=' + component + '&product=LibreOffice&query_format=advanced&short_desc_type=allwordssubstr&ctype=csv&short_desc=' + subcomponent;
            $.bug.ajax('GET', list).pipe(function(data) {
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
