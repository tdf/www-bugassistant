//     This file is part of the LibreOffice BSA project
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

    $.tools = {

        window: window,
	summary: '',
	searchDuplicatesAgain: false,
	url: 'https://www.libreoffice.org/bugassistant/libreoffice/bug',

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
            if ($.tools.searchDuplicatesAgain) {
                $.tools.refresh_related_bugs();
            }
        },

        refresh_related_bugs: function() {
            $.tools.searchDuplicatesAgain = false;
            var answer = $.bugzilla.searchDuplicates($.tools.summary, $.tools.refresh_related_bugs_return /*Is a function*/);
            if (!answer) {
                $.tools.searchDuplicatesAgain = true;
            }
        },

	get_bug: function() {
          var bugs = $.bugzilla.getBug( $(".bugNumber").val() );
	  $(".bug").html('<div class="bugs"><a href="' + $.bugzilla.url + '/show_bug.cgi?id=' + bugs[0].id + '" target="_blank">' + bugs[0].summary + '</a>');
	  $.tools.summary = bugs[0].summary;
	},

	menu: function() {
	  var menu = '<h3>Menu QATeam Tools</h3>Search Tools<ul>';
	  menu+= '<li><a href="searchDuplicate.html">Search Duplicates</a></li>';
	  menu+= '</ul><br />Statistics<ul>';
	  menu+= '<li><a href="generalStats.html">General Stats</a></li>';
	  menu+= '<li><a href="unconfirmedBugsCount.html">Unconfirmed Bugs Count</a></li>';
	  menu+= '</ul>';
	  $(".menu").html(menu);
	},

        main: function() {
	  $('.button').click(function() {
              $("body").css("cursor", "progress");
	      $.tools.get_bug();
	      $.tools.refresh_related_bugs();
	  });
	  $.tools.menu();
        }
    };

})(jQuery);
