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

        window: window,

        ajax: function(type, url, args) {
            return $.ajax({
                type: type,
                url: url,
                data: args
            }).pipe(null, function(error) {
                var message;
		if (args == undefined) {
		  message = url + '() XHR error. ';
		} else {
		  message = url + '(' + $.param(args) + ') XHR error. ';
		}
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
                window.scrollTo(0,0);
                throw error;
            });
        },

        lookup_result: function(data, error_regexps, success_regexp) {
            var error = null;
            for(var i = 0; i < error_regexps.length; i++) {
                error = data.match(error_regexps[i]);
                if(error !== null) {
                    break;
                }
            }
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

        url: '',

        state_signin_error_regexps: [/CLASS="THROW_ERROR">([^<]*)/i],
        state_signin_success_regexp: /LOG&NBSP;OUT<\/A>([^<]*)/i,

        state_signin: function() {
            var element = $('.signin');
            $('.go', element).click(function() {
                $("body").css("cursor", "progress");
                $.bug.error_clear();
                $.bug.ajax('POST', $.bug.url + '/index.cgi', {
                    Bugzilla_login: $('.user', element).val(),
                    Bugzilla_password: $('.password', element).val()
                }).pipe(function(data) {
                    $("body").css("cursor", "default");
                    return $.bug.lookup_result(data,
                                               $.bug.state_signin_error_regexps,
                                               $.bug.state_signin_success_regexp);
                }).pipe(function(data) {
                    $('.username').html(data);
                    element.hide();
                    $.bug.state_component();
                });
            });
            $('.login-link', element).attr('href', $.bug.url + '/');
            $('.create-account-link', element).attr('href', $.bug.url + '/createaccount.cgi');
            $.bug.current_step('signin');
            element.show();
        },

        state_component: function() {
            var element = $('.state_component');

            $.bug.current_step('component');
            element.show();
            $('.select', element).select();
            $('.select .choice, img', element).hover(function() {
                var component = $(this).attr('data');
                $('.comment', element).hide();
                $('.comment.' + component, element).show();
            });
            $('.select .choice', element).click(function() {
                $(this).mouseenter();
                var component = $(this).attr('data');
                $('img', element).removeClass('selected');
                $('img[data="' + component + '"]').addClass('selected');
                $.bug.state_subcomponent();
            });
            $('img', element).click(function() {
                var component = $(this).attr('data');
                $(".select .choice[data='" + component + "']", element).click();
            });
            $('.components_icons').mouseleave(function() {
                $('img.selected', element).mouseenter();
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
            var template = $(".long", element).val();
            if(!element.hasClass('initialized')) {
                template = template + '\nBrowser: ' + window.navigator.userAgent;
                $(".long", element).val(template);
                var validate = function() {
                    if($(".short", element).val().length > 3 &&
                       $(".long", element).val() != template) {
                        $.bug.state_attach();
                        $.bug.state_submit();
                    }
                };

                $(".short", element).change(validate);
                $(".long", element).keyup(validate);
                element.addClass('initialized');
                $.bug.current_step('description');
                element.show();
            }
        },

        state_attach: function() {
            var element = $('.state_attach');
            if(!element.hasClass('initialized')) {
                var file_input = $("input[type='file']", element);
                var container = $('.attach-file', element);
                container.mousemove(function(e) {
                    file_input.css({
				'left': e.pageX - container.offset().left - file_input.outerWidth() + 10,
				'top': e.pageY - container.offset().top - 10
		    });
                });
                file_input.change(function() {
                    // http://lists.whatwg.org/htdig.cgi/whatwg-whatwg.org/2009-March/018981.html
                    // in a nutshell : deal with it, it won't go away
                    var path = $(this).val().replace("C:\\fakepath\\","");
                    $("input[name='ignored']", element).val(path);
                });
                element.addClass('initialized');
                $.bug.current_step('attach');
                element.show();
            }
        },
        // Making the double quotes optional caters for differing browser
        // behaviour with jquery .text() - IE8 removes double quotes.
        state_submit_error_regexps: [/CLASS="?THROW_ERROR"?>([^<]*)/i, /FONT SIZE=\"?\+2\"?>([^<]*)/i, // bugzilla < 4
                                     /<DIV CLASS=\"?BOX\"?>\s+<P>([^<]+)/i],                         // bugzilla >= 4
        state_submit_success_regexp: /Bug ([0-9]+)/i,
        state_submit_element: 'html',

        state_submit: function() {
            var element = $('.state_submit');
            if(!element.hasClass('initialized')) {
                var form = $('.submission_form form');
                form.attr('action', $.bug.url + '/post_bug.cgi');
                form.submit(function() {
                    if($(element).hasClass('inprogress')) {
                        return false;
                    } else {
                        $(element).addClass('inprogress');
                    }
                    var version = $('.state_version .chosen').attr('data');
                    var component = $('.state_component .chosen').attr('data').replace('_',' ');
                    var short_desc = $('.state_subcomponent .active_subcomponent .chosen').attr('data') + ': ' + $('.state_description .short').val();
                    var comment = $('.state_description .long').val();
                    $("body").css("cursor", "progress");
                    $('input[name="component"]', form).val(component);
                    $('input[name="version"]', form).val(version);
                    $('input[name="short_desc"]', form).val(short_desc);
                    $('input[name="comment"]', form).val(comment);
                    return true;
                });

                $('#submissionoutput').load(function() {
                    $(element).removeClass('inprogress');
                    $("body").css("cursor", "default");
                    var output = $(this).contents().find($.bug.state_submit_element).html();
                    var data = $.bug.lookup_result(output,
                                                   $.bug.state_submit_error_regexps,
                                                   $.bug.state_submit_success_regexp);
                    $('.bug', element).text(data);
                    $.bug.state_success();
                });
                element.addClass('initialized');
                $.bug.current_step('submit');
                element.show();
            }
        },

        state_success: function() {
            $('.state_submit').hide();
            $('.submission').css('visibility', 'hidden');
            var element = $('.state_success');
            var bug = $('.state_submit .bug').text();
            $('.bug', element).attr('href', $.bug.url + '/show_bug.cgi?id=' + bug);
            element.show();
        },

        // if this string is found in the page returned when
        // trying to fill a bug, it means the user is not logged in
        logged_in_false: 'form name="login"',

        logged_in: function() {
            $("body").css("cursor", "progress");
            return $.bug.ajax('GET', $.bug.url + '/enter_bug.cgi').pipe(function(data) {
                $("body").css("cursor", "default");
                return data.indexOf($.bug.logged_in_false) < 0;
            });
        },

        refresh_related_bugs: function() {
            $('.related_bugs').empty();
            var component = $('.state_component .chosen').attr('data').replace('_','%20');
            var subcomponent = $('.state_subcomponent .active_subcomponent .chosen').attr('data');
            var list = $.bug.url + '/buglist.cgi?columnlist=short_desc&component=' + component + '&product=LibreOffice&query_format=advanced&short_desc_type=allwordssubstr&ctype=csv&short_desc=' + subcomponent;
            $.bug.ajax('GET', list).pipe(function(data) {
                var lines = data.split('\n');
                var bug_urls = [];
                for(var i = 1; i < lines.length; i++) {
                    bug_urls.push(lines[i].replace(/([0-9]*),"(.*)"/,'<a href="' + $.bug.url + '/show_bug.cgi?id=$1" target="_blank">$2</a>'));
                }
                $('.related_bugs').html(bug_urls.join('<br>'));
            });
        },

        compatibility: function() {
            $('.left .step:last-child').addClass('last-child'); // cross browser compatibility
        },

        frame: function() {
            if($.bug.window != $.bug.window.top && $.bug.window.parent.bugzilla_url !== undefined) {
                $.bug.url = $.bug.window.parent.bugzilla_url;
            }
        },

        main: function(in_isTest) {
            $.bug.compatibility();
            $.bug.frame();
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
