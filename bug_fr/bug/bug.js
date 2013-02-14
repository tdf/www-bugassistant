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

		if (url == "/enter_bug.cgi" && 'status' in error && (error.status == 404 || error.status == 0)) {
		  message = "It seems there is a problem to connect with Bugzilla. Please try again later.";
		}
		else
		{
                    if('status' in error) {
		        if(error.status == 404 || error.status == 0) {
			    message += "Cannot find the URL specified.\n\n";
		        }
                        message += 'status = ' + error.status + ' ';
                    }
                    if('responseText' in error) {
                        message += 'responseText = ' + error.responseText + ' ';
                    }
                    if('statusText' in error) {
                        message += 'statusText = ' + error.statusText + ' ';
                    }
		}
                $.bug.error_set(message);
                $.bug.window.scrollTo(0,225);
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
	token: '',
        sub_component: 'EMPTY',
        op_sys: '',
        lo_version: '',
        regression: '',
	lo_version_id: '',
	regression_id: '',

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
                $.bug.state_details();
            });
            $('img', element).click(function() {
                var component = $(this).attr('data');
                $(".select .choice[data='" + component + "']", element).click();
            });
            $('.components_icons').mouseleave(function() {
                $('img.selected', element).mouseenter();
            });
        },

        state_details: function() {
            var element = $('.state_details');
            var component = $('.state_component .chosen').attr('data');
            var subcomponent = $('.subcomponents .' + component, element).html();
            $('.active_subcomponent', element).html(subcomponent);
            if(!element.hasClass('initialized')) {
                element.addClass('initialized');
                $.bug.current_step('details');
            }
            element.show();
            $('.active_subcomponent .select', element).select();
            $('.active_subcomponent .select .choice', element).click(function() {
                $.bug.refresh_related_bugs();
                $.bug.subcomponent = $('.state_details .active_subcomponent .chosen').attr('data');
                if ($.bug.lo_version != '' && $.bug.op_sys != '' && $.bug.regression != '') {
                    $.bug.state_description();
                }
            });
            $(".select", element).select();
            $(".state_details .versions .choice[data='NONE']").remove();
            $(".versions .select .choice", element).click(function() {
                $.bug.lo_version = $('.state_details .versions .chosen').attr('data');
                $.bug.lo_version_id = $('.state_details .versions .chosen').attr('idvalue');
                if ($.bug.subcomponent != 'EMPTY' && $.bug.op_sys != '' && $.bug.regression != '') {
                    $.bug.state_description();
                }
            });
            $(".select", element).select();
            $(".op_sys .select .choice", element).click(function() {
                $.bug.op_sys = $('.state_details .op_sys .chosen').attr('data');
                if ($.bug.subcomponent != 'EMPTY' && $.bug.lo_version != '' && $.bug.regression != '') {
                    $.bug.state_description();
                }
             });
            $(".select", element).select();
            $(".state_details .regression .choice[data='unspecified']").remove();
            $(".regression .select .choice", element).click(function() {
                $.bug.regression = $('.state_details .regression .chosen').attr('data');
                $.bug.regression_id = $('.state_details .regression .chosen').attr('idvalue');
                if ($.bug.subcomponent != 'EMPTY' && $.bug.lo_version != '' && $.bug.op_sys != '') {
                    $.bug.state_description();
                }
             });
             $(".state_details .regression .choice[data='NONE']").click();


        },

        state_description: function() {
            var element = $('.state_description');
            var template = $(".long", element).val();
            if(!element.hasClass('initialized')) {
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
            if ($.bug.token == '') {
                $.bug.ajax('GET', $.bug.url + '/enter_bug.cgi?product=LibreOffice&bug_status=UNCONFIRMED').pipe(function(data){
                    $.bug.token = data.match(/<input type="hidden" name="token" value="([A-Za-z0-9]{10})">/)[1];
                });
            }
            if(!element.hasClass('initialized')) {
		var locarray = window.location.href.split("/");
		delete locarray[(locarray.length-1)];
                var form = $('.submission_form form');
                $.bug.error_clear();
                form.attr('action', locarray.join("/") + '/mail.php');
                form.submit(function() {
                    if($(element).hasClass('inprogress')) {
                        return false;
                    } else {
                        $(element).addClass('inprogress');
                    }
		    $.bug.error_clear();
                    var component = $('.state_component .chosen').attr('data').replace('_',' ');
                    var short_desc = $.bug.subcomponent + ': ' + $('.state_description .short').val();
                    //Add Operating System
                    var op_sys = $('.state_op_sys .chosen').attr('data');
                    var comment = $('.state_description .long').val();
		    if (($.bug.regression_id >= 0) && ($.bug.regression_id <= $.bug.lo_version_id))
		      $.bug.regression_id = -1;
                    comment = comment + "\nOperating System: " + $(".op_sys .chosen").text();
                    comment = comment + "\nVersion: " + $.bug.lo_version;
                    comment = comment + (($.bug.regression_id >= 0)?"\nLast worked in: " + $.bug.regression:"");
                    $("body").css("cursor", "progress");
                    $('input[name="token"]', form).val($.bug.token);
                    $('input[name="component"]', form).val(component);
                    $('input[name="version"]', form).val($.bug.lo_version);
                    $('input[name="op_sys"]', form).val($.bug.op_sys);
                    $('input[name="short_desc"]', form).val(short_desc);
                    $('input[name="comment"]', form).val(comment);
                    $('input[name="keywords"]', form).val((($.bug.regression_id >= 0)?"regression":""));
                    $.bug.token = '';
                    return true;
                });

                $('#submissionoutput').load(function() {
                    $(element).removeClass('inprogress');
                    $("body").css("cursor", "default");
                    var output = $(this).contents().find($.bug.state_submit_element).html();
		    if (output.indexOf("TRUE") > 0)
			var data = "The bug report has been successfully submitted.".
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
            /*$('.bug', element).attr('href', $.bug.url + '/show_bug.cgi?id=' + bug);*/
            element.show();
            $.bug.window.scrollTo(0,225);
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

        get: function (name){
           if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
               return decodeURIComponent(name[1]);
         },

         //set default values if request parameters are present
         process_params: function () {
            lo_version = $.bug.get('lo_version');
	    module = $.bug.get('module');

            if (lo_version){
                var lo_versions = [];
		$(".versions .choice").each(function() {
                   lo_versions.push($(this).text());
                });
               if ($.inArray(lo_version, lo_versions)){
                  $(".versions .chosen").text(lo_version)
               }
            }

            if (module){
                var components = [];
                $(".component .choice").each(function() {
                   components.push($(this).text());
                });
                var component = $.bug.get_component(module);
                if ($.inArray(component, components)){
                  var element = $('.state_component');
                  $('img[data="' + component + '"]').mouseenter();
                  $('img[data="' + component + '"]').addClass('selected');

                  $(".component .chosen").text(component);
                  $(".component .chosen").attr("data", component);

                  $('.comment', element).hide();
                  $('.comment.' + component, element).show();
                  $.bug.state_details();
               }
            }
         },

        get_component: function (module){
           var components = new Array();
           components["TextDocument"] = "Writer";
           components["SpreadsheetDocument"] = "Spreadsheet";
           components["DrawingDocument"] = "Drawing";
           components["PresentationDocument"] = "Presentation";
           components["FormulaDocument"] = "Formula_Editor";
	   components["OfficeDatabaseDocument"] = "Database";
           components["StartModule"] = "Libreoffice";
           return components[module];
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
           $.bug.process_params();
        }
    };

})(jQuery);
