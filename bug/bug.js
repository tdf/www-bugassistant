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
                  message = messageStrings("ERROR_BUGZILLA");
                } else {
                    message += messageStrings("ERROR_GENERAL") + "\n";
                    if('status' in error) {
                        if(error.status == 404 || error.status == 0) {
                            message += messageStrings("ERROR_URL") + "\n";
                        }
                        message += '\nStatus = ' + error.status + ' ';
                    }
                    if('responseText' in error) {
                        message += '\nresponseText = ' + error.responseText + ' ';
                    }
                    if('statusText' in error) {
                        message += '\nstatusText = ' + error.statusText + ' ';
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
                throw data;
            } else {
                var success = data.match(success_regexp);
                if(success !== null) {
                    return success[1];
                } else {
                    $.bug.error_set(messageStrings("ERROR_REGEX", success_regexp, data));
                    throw data;
                }
            }
        },

        current_step: function(name) {
            $('.step').removeClass('current');
            $('.step_' + name).addClass('current');
        },

        error_clear: function() {
            $('.feedback_container').hide();
        },

        error_set: function(message, domain) {
            if ((domain == "Bugzilla")&&($.bug.BSALang == "en"))
                message = message.msg;
            else if (domain == "Bugzilla")
                message = BugzillaErrorStrings(message.code);
            $('.feedback_container').show();
            $('.feedback_container').addClass('error');
            $('.feedback_container').text(message);
        },
        
        set_warning: function(heading, text) {
            $('.feedback_container').show();
            $('.feedback_container').addClass('warning');
            $('.feedback_container').html('<h1>'+heading+'</h1><p>'+text+'</p>');
        },
        
        url: 'https://www.libreoffice.org/bugzilla',
        token: '',
        sub_component: 'EMPTY',
        op_sys: '',
        lo_version: '',
        regression: '',
        lo_version_id: '',
        regression_id: '',
        BSALang: '',
        searchDuplicatesAgain: false,

        state_signin: function() {
            var element = $('.signin');
            $('.button', element).click(function() {
                $("body").css("cursor", "progress");
                $.bug.error_clear();
                try {
                    id = $.bugzilla.login($('.user', element).val(), $('.password', element).val());
                } catch(error) {
                    $.bug.error_set(error, "Bugzilla");
                }
                $("body").css("cursor", "default");
                if (id > 0) {
                        element.hide();
                        $.bug.state_component();
                }
            });
            $('.password').keypress(function(e) {
                if (e.keyCode == 13) {
                    $('.button', element).click();
                }
            });
            $('.user').keypress(function(e) {
                if (e.keyCode == 13) {
                    $('.button', element).click();
                }
            });

            $('.login-link', element).attr('href', $.bug.url + '/');
            $('.create-account-link', element).attr('href', $.bug.url + '/createaccount.cgi');
            $.bug.current_step('signin');
            element.show();
            $('.user', element).focus();
            //Make sure all steps are hidden
            $('.state_component').hide();
            $('.state_details').hide();
            $('.state_description').hide();
            $('.state_attach').hide();
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
                if(component === 'WWW') {
                    if($.bug.BSALang == "en") {
                        $.bug.set_warning('WWW Bugs are being moved to Redmine', 'All of our WWW bugs are currently being moved to <a href="https://redmine.documentfoundation.org">our Redmine</a>. We would appreciate if you submit the bug directly through Redmine and thus we could be able to fix it faster. Thanks. ');
                    }else{
                    	$.bug.set_warning('Les bugs WWW sont maintenant remplis sur Redmine', 'Tous nos bugs WWW sont actuellement déplacés sur <a href="https://redmine.documentfoundation.org">notre Redmine</a>>. Nous aimerions que vous soumettiez le bug directement sur Redmine, de la sorte nous pourrons le corriger plus rapidement. Merci');
                    }
                    $.bug.window.scrollTo(0, 255);
                }
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
            // Start by hiding the end-of-life message.
            var uv_element = $('.state_details .unsupported-versions');
            uv_element.hide();

            $('.active_subcomponent .select', element).select();
            $('.active_subcomponent .select .choice', element).click(function() {
                $.bug.sub_component = $('.state_details .active_subcomponent .chosen').attr('data');
                if ($.bug.BSALang == 'en')
                    $.bug.refresh_related_bugs();
                if ($.bug.lo_version != '' && $.bug.op_sys != '' && $.bug.regression != '') {
                    $.bug.state_description();
                }
            });
            $(".select", element).select();
            $(".state_details .versions .choice[data='NONE']").remove();
            // When the user selects a version in the drop-down box,
            // run this function.
            $(".versions .select .choice", element).click(function() {
                $.bug.lo_version = $('.state_details .versions .chosen').attr('data');
                $.bug.lo_version_id = $('.state_details .versions .chosen').attr('idvalue');
                if ($.bug.sub_component != 'EMPTY' && $.bug.op_sys != '' && $.bug.regression != '') {
                  $.bug.state_description();
                }

                // If this version is unsupported
		if ($.bug.lo_version_id == -2) {
		  // Display a warning message.
                  uv_element.show();
                  // Put a red box around the version field
                  $(".versions.initialized").css('border', '2px solid red');
                  // Make sure the description elements are hidden.
                  //$(".state_description").hide();
                } else {
                  uv_element.hide();
                  // Hide any border showing.
                  $(".versions.initialized").css('border', '');
                  //$(".state_description").show();
                }
            });
            $(".select", element).select();
            $(".op_sys .select .choice", element).click(function() {
                $.bug.op_sys = $('.state_details .op_sys .chosen').attr('data');
                if ($.bug.sub_component != 'EMPTY' && $.bug.lo_version != '' && $.bug.regression != '') {
                    $.bug.state_description();
                }
             });
            $(".select", element).select();
            $(".state_details .regression .choice[data='unspecified']").remove();
            $(".regression .select .choice", element).click(function() {
                $.bug.regression = $('.state_details .regression .chosen').attr('data');
                $.bug.regression_id = $('.state_details .regression .chosen').attr('idvalue');
                if ($.bug.sub_component != 'EMPTY' && $.bug.lo_version != '' && $.bug.op_sys != '') {
                    $.bug.state_description();
                }
             });
             $(".state_details .regression .choice[data='NONE']").click();


        },

        // What does this state do? Just show the fields here?
        state_description: function() {
            var element = $('.state_description');
            var template = $(".long", element).val();
            if(!element.hasClass('initialized')) {
                var validate_long = function() {
                    if($(".long", element).val().length != template) {
                        $(".long", element).css('background', 'url("images/description.png") no-repeat scroll 0 0 transparent');
                    } else {
                        $(".long", element).css('background', 'url("images/description-empty.png") no-repeat scroll 0 0 transparent');
                    }
                    if($(".short", element).val().length > 3 && $(".long", element).val() != template) {
                        $.bug.state_submit();
                    }
                };
                var validate_short = function() {
                    if($(".short", element).val().length > 3) {
                        $(".short", element).css('background', 'url("images/subject.png") no-repeat scroll 0 0 transparent');
                    } else {
                        $(".short", element).css('background', 'url("images/subject-empty.png") no-repeat scroll 0 0 transparent');
                    }
                };
                var related_short = function() {
                    $.bug.refresh_related_bugs();
                };
                $(".short", element).keyup(validate_short);
                $(".long", element).keyup(validate_long);
                if ($.bug.BSALang == 'en') {
                    $(".short", element).blur(related_short);
                    $.bug.state_attach();
                }
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
                var validate = function() {
                    if ($('input[name="data"]', element).val() != "" &&
                        $('input[name="description"]', element).val() == "")
                    {
                       $('input[name="description"]', element).css('background', 'url("images/subject-empty.png") no-repeat scroll 0 0 transparent');
                    }
                    else if ($('input[name="data"]', element).val() == "" &&
                        $('input[name="description"]', element).val() != "")
                    {
                       $('input[name="ignored"]', element).css('background', 'url("images/upload-input-empty.png") no-repeat scroll 0 0 transparent');
                    }
                    else
                    {
                       $('input[name="description"]', element).css('background', 'url("images/subject.png") no-repeat scroll 0 0 transparent');
                       $('input[name="ignored"]', element).css('background', 'url("images/upload-input.png") no-repeat scroll 0 0 transparent');
                    }
                };
                $('input[name="data"]', element).change(validate);
                $('input[name="description"]', element).keyup(validate);
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
                if ($.bug.token == '') {
                    $.bug.get_token();
                }

                var form = $('.submission_form form');
                $.bug.error_clear();
                if ($.bug.BSALang == 'en') {
                    form.attr('action', $.bug.url + '/post_bug.cgi');
                } else {
                    var locarray = window.location.href.split("/");
                    delete locarray[(locarray.length-1)];
                    form.attr('action', locarray.join("/") + '/mail.php');
                }
                form.submit(function() {
                    if($(element).hasClass('inprogress')) {
                        return false;
                    } else if ($.bug.token == '') {
                        $.bug.error_set(messageStrings("ERROR_TOKEN"));
                        return false;
                    } else if ($.bug.sub_component == '') {
                        $.bug.error_set(messageStrings("ERROR_SUBCOMPONENT"));
                        return false;
                    } else if ($('.state_attach input[name="data"]').val() != "" && $('.state_attach input[name="description"]').val() == ""){
                        $.bug.error_set(messageStrings("ERROR_ATTACHMENT"));
                        return false;
                    } else {
                        $(element).addClass('inprogress');
                    }
                    $.bug.error_clear();
                    var component = $('.state_component .chosen').attr('data').replace(new RegExp('_', "gm"),' ');
                    var short_desc = $.bug.sub_component + ': ' + $('.state_description .short').val();
                    //Add Operating System
                    var op_sys = $('.state_op_sys .chosen').attr('data');
                    var comment = $('.state_description .long').val();
                    if (($.bug.regression_id >= 0) && ($.bug.regression_id <= $.bug.lo_version_id))
                      $.bug.regression_id = -1;
                    comment = comment + "\n" + messageStrings("Operating System: ") + $(".op_sys .chosen").text();
                    comment = comment + "\n" + messageStrings("Version: ") + $.bug.lo_version;
                    comment = comment + (($.bug.regression_id >= 0)?"\n" + messageStrings("Last worked in: ") + $.bug.regression:"");
                    $("body").css("cursor", "progress");
                    $('input[name="token"]', form).val($.bug.token);
                    $('input[name="component"]', form).val(component);
                    $('input[name="version"]', form).val($.bug.lo_version);
                    $('input[name="op_sys"]', form).val($.bug.op_sys);
                    $('input[name="short_desc"]', form).val(short_desc);
                    $('input[name="comment"]', form).val(comment);
                    $('input[name="status_whiteboard"]', form).val("BSA" + (($.bug.regression_id >= 0)?" PossibleRegression":""));
                    $('input[name="BSAemail"]', form).val($.bugzilla.getAccountEmail());
                    $.bug.token = '';
                    return true;
                });

                $('#submissionoutput').load(function() {
                    $(element).removeClass('inprogress');
                    $("body").css("cursor", "default");
                    var output = $(this).contents().find($.bug.state_submit_element).html();
                    if ($.bug.BSALang == 'en') {
                        var data = $.bug.lookup_result(output,
                                                   $.bug.state_submit_error_regexps,
                                                   $.bug.state_submit_success_regexp);
                        $('.bug', element).text(data);
                        $.bug.state_success();
                    } else if (output.indexOf("TRUE") > 0)  {
                        $.bug.state_success();
                    } else {
                        $.bug.state_failure();
                        $.bug.get_token();
                    }
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
            $.bug.window.scrollTo(0,225);
        },

        state_failure: function() {
            $.bug.error_set($('.state_failure').text());
            $.bug.window.scrollTo(0,225);
        },

        refresh_related_bugs_return: function (bugs) {
            var bug_urls = [];
            for(var i = 0; i < bugs.length; i++) {
                bug_urls.push('<a href="' + $.bugzilla.url + '/show_bug.cgi?id=' + bugs[i].id + '" target="_blank">' + bugs[i].summary + '</a>');
            }
            $('.related_bugs').empty();
            if (bug_urls.length > 0) {
                $('.related_bugs').html('<div class="bugs">' + bug_urls.join('</div><div class="bugs">') + '</div>');
            } else {
                $('.related_bugs').html("No related bugs found.");
            }
            if ($.bug.searchDuplicatesAgain) {
                $.bug.refresh_related_bugs();
            }
        },

        refresh_related_bugs: function() {
            var summary = $.bug.sub_component + ": " + $(".short", $('.state_description')).val();
            $.bug.searchDuplicatesAgain = false;
            var answer = $.bugzilla.searchDuplicates(summary, $.bug.refresh_related_bugs_return /*Is a function*/);
            if (!answer) {
                $.bug.searchDuplicatesAgain = true;
            }
        },

        get_token: function() {
          $.bug.token = '';
          $.bug.ajax('GET', $.bug.url + '/enter_bug.cgi?product=LibreOffice&bug_status=UNCONFIRMED').pipe(function(data){
            $.bug.token = data.match(/<input type="hidden" name="token" value="([A-Za-z0-9]{10})">/)[1];
          });
        },

        compatibility: function() {
            $('.left .step:last-child').addClass('last-child'); // cross browser compatibility
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

        main: function(lang, in_isTest) {
            $.bug.compatibility();
            $.bug.BSALang = lang;
            if ($.bugzilla.isLoggedIn()) {
               $.bug.state_component();
            } else {
               $.bug.state_signin();
            }
            $.bug.process_params();
            $('a#sign-out').click(function(){
                var status = $('.state_success').css('display');
                if(status !== 'block') {
                    $.bug.state_signin();
                }
                $('.feedback_container').addClass('success');
                $.bug.window.scrollTo(0, 255);
                if($.bug.BSALang === "en") {
                    $('.state_component .chosen').html('(Choose one)');
                    $('.feedback_container').text('You have been signed out');
                }else{
                    $('.state_component .chosen').html('(en choisir un)');
                    $('.feedback_container').text('Vous avez été déconnecté');
                }
            });
        }
    };

})(jQuery);
