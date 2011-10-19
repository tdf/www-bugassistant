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
module("bug");

test("frame", function() {
    expect(3);

    var bugzilla_url = location.protocol + '//' + location.hostname;

    equal(location.href.indexOf(bugzilla_url), 0, bugzilla_url);

    $.bug.window = {
        top: 'something',
        parent: { bugzilla_url: bugzilla_url }
    };

    equal($.bug.url, '');
    $.bug.frame();
    equal($.bug.url, bugzilla_url);
});

test("ajax", function() {
    expect(4);

    var status = 404;
    var statusText = 'Status text';
    var responseText = 'Error text';
    var ajax = $.ajax;
    $.ajax = function(settings) {
        return $.Deferred().reject({
            status: status,
            statusText: statusText,
            responseText: responseText
        });
    };

    try {
        $.bug.ajax('POST', 'DOESNOTEXIST', {});
    } catch(e) {
        ok($('.error').text().indexOf(status) >= 0, status);
        ok($('.error').text().indexOf(statusText) >= 0, statusText);
        ok($('.error').text().indexOf(responseText) >= 0, responseText);
        equal(e.status, status);
    }

    $.ajax = ajax;
});

test("lookup_result", function() {
    expect(7);

    var caught = false;
    var what = 'WHAT';
    var error_regexp = /ERR_(.*)_OR/;
    var value = 'VALUE';
    var success_regexp = /SUC_(.*)_ESS/;

    // error
    try {
        $.bug.lookup_result('ERR_' + what + '_OR', [error_regexp], success_regexp);
    } catch(e) {
        equal(e[1], what);
        equal($('.error').text(), what);
        caught = true;
    }
    ok(caught, 'caught exception');

    // output is not as expected
    var bugous = 'BUGOUS OUTPUT';
    try {
        $.bug.lookup_result(bugous, [error_regexp], success_regexp);
    } catch(ee) {
        equal(ee, bugous);
        ok($('.error').text().indexOf(success_regexp) >= 0, 'error displayed');
        caught = true;
    }
    ok(caught, 'caught exception');

    // success
    equal($.bug.lookup_result('SUC_' + value + '_ESS', [error_regexp], success_regexp), value);
});

test("state_signin", function() {
    expect(9);

    equal($('.signin').css('display'), 'none');
    var user = 'gooduser';
    var password = 'goodpassword';
    $.bug.ajax = function(type, url, data, callback) {
        var d = $.Deferred();
        if(data.Bugzilla_login == user &&
           data.Bugzilla_password == password) {
            d.resolve('Log&nbsp;out</a>' + data.Bugzilla_login + '<');
        } else {
            d.resolve('class="throw_error">ERROR<');
        }
        return d;
    };
    var state_component = $.bug.state_component;
    $.bug.state_component = function() { ok(true, 'state_component'); };
    $.bug.state_signin();
    equal($('.signin').css('display'), 'block');
    // fail to login, shows error
    equal($('.error-container').css('display'), 'none', 'no error');
    try {
        $('.signin .go').click();
    } catch(e) {
        ok(true, 'caught error');
    }
    equal($('.error-container').css('display'), 'block', 'no error');
    // successfull login
    $('.signin .user').val(user);
    $('.signin .password').val(password);
    $('.signin .go').click();
    equal($('.signin').css('display'), 'none');
    equal($('.error-container').css('display'), 'none', 'no error');
    equal($('.username').text(), user);

    $.bug.ajax = $.ajax;
    $.bug.state_component = state_component;
});

test("state_component", function() {
    expect(15);

    var state_subcomponent = $.bug.state_subcomponent;
    $.bug.state_subcomponent = function() { ok(true, 'state_subcomponent'); };

    var element = $('.state_component');
    equal(element.css('display'), 'none');
    $.bug.state_component();
    equal(element.css('display'), 'block');
    equal($('.component .chosen', element).attr('data'), undefined, 'initialy nothing selected');
    equal($('.comment.Formula_editor', element).css('display'), 'none', 'Formula_editor hidden');
    equal($('.comment.OTHER', element).css('display'), 'none', 'OTHER hidden');
    equal($('img.selected').length, 0, 'no icon selected');
    // chosing Formula editor updates the comment, selects the icon and moves to subcomponent state
    $(".component .choice[data='Formula_editor']", element).click();
    equal($('img[data="Formula_editor"].selected', element).length, 1, 'Formula editor icon selected');
    equal($('.comment.Formula_editor', element).css('display'), 'block', 'Formula_editor is visible');
    equal($('.comment.OTHER', element).css('display'), 'none', 'OTHER hidden');
    // hovering on an icon changes the comment but has no effect on the selection
    $('img[data="OTHER"]', element).mouseenter();
    equal($('.comment.Formula_editor', element).css('display'), 'none', 'Formula_editor hidden');
    equal($('.comment.OTHER', element).css('display'), 'block', 'OTHER is visible');
    equal($('.component .chosen', element).attr('data'), 'Formula_editor');
    // leaving the icon area reverts back the comment to the selected element
    $('.components_icons', element).mouseleave();
    equal($('.comment.Formula_editor', element).css('display'), 'block', 'Formula_editor is visible');
    equal($('.comment.OTHER', element).css('display'), 'none', 'OTHER hidden');

    $.bug.state_subcomponent = state_subcomponent;
});

test("state_subcomponent", function() {
    expect(6);

    var state_version = $.bug.state_version;
    $.bug.state_version = function() { ok(true, 'state_version'); };
    var refresh_related_bugs = $.bug.refresh_related_bugs;
    $.bug.refresh_related_bugs = function() { ok(true, 'refresh_related_bugs'); };

    var element = $('.state_subcomponent');
    equal(element.css('display'), 'none');
    equal($('.active_subcomponent .select', element).length, 0, 'no .select element');
    $(".component .chosen").attr('data', 'Formula_editor');
    $.bug.state_subcomponent();
    equal($('.active_subcomponent .select', element).length, 1, 'one .select element');
    equal(element.css('display'), 'block');
    $(".active_subcomponent .subcomponent .choice[data='Formula_editor']", element).click();

    $.bug.state_version = state_version;
    $.bug.refresh_related_bugs = refresh_related_bugs;
});

test("state_version", function() {
    expect(7);

    var state_description = $.bug.state_description;
    $.bug.state_description = function() { ok(true, 'state_description'); };

    var element = $('.state_version');
    equal(element.css('display'), 'none');
    ok(!element.hasClass('initialized'), 'is not initialized');
    $.bug.state_version();
    equal(element.css('display'), 'block');
    ok(element.hasClass('initialized'), 'is initialized');
    equal($('.versions .chosen', element).attr('data'), undefined, 'initialy nothing selected');
    var version = 'VERSION1';
    $(".versions .choice[data='" + version + "']", element).click();
    // the second time, the selected index is not reset
    $.bug.state_version();
    equal($('.versions .chosen', element).attr('data'), version, 'same version selected');

    $.bug.state_description = state_description;
});

test("state_description", function() {
    expect(5);

    var state_submit = $.bug.state_submit;
    $.bug.state_submit = function() { ok(true, 'state_submit'); };

    var element = $('.state_description');
    equal(element.css('display'), 'none');
    ok(!element.hasClass('initialized'), 'is not initialized');
    $.bug.state_description();
    equal(element.css('display'), 'block');
    ok(element.hasClass('initialized'), 'is initialized');
    $('.short', element).val('012345').change();
    $('.long', element).val('012345678901');
    $('.long', element).keyup();

    $.bug.state_submit = state_submit;
});

test("state_submit", function() {
    expect(27);

    var state_success = $.bug.state_success;
    $.bug.state_success = function() { ok(true, 'state_success'); };

    var element = $('.state_submit');
    equal(element.css('display'), 'none');
    ok(!element.hasClass('initialized'), 'is not initialized');
    $.bug.state_submit();
    equal(element.css('display'), 'block');
    ok(element.hasClass('initialized'), 'is initialized');
    $.bug.state_component();
    var component = 'Formula_editor';
    $(".state_component .choice[data='" + component + "']").click();
    var component_text = $(".state_component .chosen").text();
    var subcomponent = 'SUBCOMPONENT';
    $('.state_subcomponent .active_subcomponent .chosen').attr('data', subcomponent);
    $.bug.state_version();
    var version = 'VERSION';
    $('.state_version .chosen').attr('data', version);
    var short_desc = 'SHORT_DESC';
    $('.state_description .short').val(short_desc);
    var comment = 'LONG';
    $('.state_description .long').val(comment);

    var bug = '40763';
    var form = $('.submission_form form');

    form.submit(function() {
        ok(element.hasClass('inprogress'), 'is in progress');
        ok(form.attr('action'), '/post_bug.cgi');
        equal($('input[name="component"]', form).val(), component_text);
        equal($('input[name="version"]', form).val(), version);
        equal($('input[name="short_desc"]', form).val(), subcomponent + ': ' + short_desc);
        equal($('input[name="comment"]', form).val(), comment);
        return false; // prevent actual submission
    });
    form.submit();
    form.submit(); // noop
    
    $.bug.state_submit_element = 'div'; // because <html> can't be inserted in the dom

    $('#submissionoutput').html('<div><div><title>Bug ' + bug + ' Submitted</title></div></div>');
    $('#submissionoutput').load();
    equal($('.bug', element).text(), bug, 'bug number');
    ok(!element.hasClass('inprogress'), 'is no longer progress');

    var error = ' ERROR ';
    equal($('.error').text(), '', 'error is not set');

    $(['<div><div><table cellpadding="20">   <tr>    <td bgcolor="#ff0000">      <font size="+2">' + error + '</font>   </td>  </tr> </table></div></div>', '<div><div><div class="throw_error">' + error + '</div></div></div>']).each(function(index, str) {
        $('#submissionoutput').html(str);
        var caught = false;
        try {
            $('#submissionoutput').load();
        } catch(e) {
            equal($('.error').text(), error, 'text ' + str);
            equal(e[1], error, 'catch ' + str);
            caught = true;
        }
        ok(caught, 'caught', str);
    });
    equal($('.error').text(), error, 'error is set');

    $.bug.state_success = state_success;
});

test("state_success", function() {
    expect(5);

    var bug = '4242';
    var element = $('.state_success');
    equal(element.css('display'), 'none');
    equal($('.submission').css('display'), 'block');
    $('.state_submit .bug').text(bug);
    $.bug.state_success();
    equal(element.css('display'), 'block');
    equal($('.submission').css('display'), 'none');
    ok($('.bug', element).attr('href').indexOf(bug) > 0, 'bug found');
});

test("state_attach", function() {
    expect(2);

    var element = $('.state_attach');
    equal(element.css('display'), 'none');
    $.bug.state_attach();
    equal(element.css('display'), 'block');

});

test("logged_in", function() {
    expect(2);

    $.bug.ajax = function(type, url) {
        return $.Deferred().resolve($.bug.logged_in_false);
    };
    $.bug.logged_in().done(function(status) {
        equal(status, false, 'user not logged in');
    });

    $.bug.ajax = function(type, url) {
        return $.Deferred().resolve('logged in ok');
    };
    $.bug.logged_in().done(function(status) {
        equal(status, true, 'user is logged in');
    });

    $.bug.ajax = $.ajax;
});
