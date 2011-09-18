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

  $.skin = function() {
      $('.skin').show();
      if(location.search.indexOf('skin=login') >= 0) {
          $.bug.state_signin();
      } else if(location.search.indexOf('skin=component') >= 0) {
          $.bug.state_component();
      } else if(location.search.indexOf('skin=subcomponent') >= 0) {
          $.bug.state_component();
          $('.state_component .component').prop("selectedIndex", 2);
          $('.state_component .component').change();
          $('.state_subcomponent .subcomponent').prop("selectedIndex", 2);
          $.bug.ajax = function(settings) {
              return $.Deferred().resolve('NUM,DESC\n100,"BUG 1"\n200,"BUG 2"\n');
          };
          $('.state_subcomponent .subcomponent').change();
      } else if(location.search.indexOf('skin=description') >= 0) {
          $.bug.state_component();
          $('.state_component .component').prop("selectedIndex", 2);
          $('.state_component .component').change();
          $('.state_subcomponent .subcomponent').prop("selectedIndex", 2);
          $.bug.ajax = function(settings) {
              return $.Deferred().resolve('NUM,DESC\n100,"BUG 1"\n200,"BUG 2"\n');
          };
          $('.state_subcomponent .subcomponent').change();
          $('.state_version .versions').prop("selectedIndex", 2);
          $('.state_version .versions').change();
          $('.state_description .short').val('12');
          $('.state_description .long').val('123456');
      } else if(location.search.indexOf('skin=submit') >= 0) {
          $.bug.state_component();
          $('.state_component .component').prop("selectedIndex", 2);
          $('.state_component .component').change();
          $('.state_subcomponent .subcomponent').prop("selectedIndex", 2);
          $.bug.ajax = function(settings) {
              return $.Deferred().resolve('NUM,DESC\n100,"BUG 1"\n200,"BUG 2"\n');
          };
          $('.state_subcomponent .subcomponent').change();
          $('.state_version .versions').prop("selectedIndex", 2);
          $('.state_version .versions').change();
          $('.state_description .short').val('1234567890');
          $('.state_description .long').val('12345678901');
          $('.state_description .short').change();
      } else if(location.search.indexOf('skin=complete') >= 0) {
          $.bug.state_success();
          $.bug.state_attach();
          $('.state_attach img').attr('src', 'icons/Database.png');
      }
  };

})(jQuery);
