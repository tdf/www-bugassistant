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
    $.fn.select = function(options) {
        var opts = $.extend({}, $.fn.select.defaults , options);

        return this.each(function(){
            var element = $(this);
            var position = $('.choices', element).position();
            $('.choices', element).hide();
            $('.choices', element).css({
                position: 'absolute',
                top: '37px', // position.y
                left: position.x
            });
            $('.chosen', this).mouseenter(function() {
                $('.choices', element).show();
            });
            element.mouseleave(function() {
                $('.choices', element).hide();
            });
            $('li', this).click(function() {
                $('.chosen', element).
                    attr('data', $(this).attr('data')).
                    text($(this).text());
                $('.choices', element).hide();
            });
        });
    };

    $.fn.select.defaults = {
    };

})(jQuery);
