#
#     Copyright (C) 2011 Loic Dachary <loic@dachary.org>
#
#     This program is free software: you can redistribute it and/or modify
#     it under the terms of the GNU General Public License as published by
#     the Free Software Foundation, either version 3 of the License, or
#     (at your option) any later version.
#
#     This program is distributed in the hope that it will be useful,
#     but WITHOUT ANY WARRANTY; without even the implied warranty of
#     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#     GNU General Public License for more details.
#
#     You should have received a copy of the GNU General Public License
#     along with this program.  If not, see <http:www.gnu.org/licenses/>.
#
while(<STDIN>) {
    eval $_ if(s/(cpts|vers)\[(\d+)\]\s+=/\$$1\[$2\]=/);
    if(/<select\s+name="product"/../<\/select/) {
        if(/libreoffice/i) {
            $libreoffice = $count;
        }
	if(/<select\s+name="product"/) {
	    $count = 0;
	} elsif(/<option/) {
	    $count++;
	}
    }
}

print "<?xml version='1.0' encoding='ISO-8859-1'?>\n";

if($ARGV[0] eq 'versions') {
    @versions = sort(@{$vers[$libreoffice]});
    print <<EOF;
	  <div class="versions select">
            <div class="select-header">
              <div class="chosen">(chose one)</div>
            </div>
            <div class="choices">
              <div class="select-top">
                <div class="select-left">
                  <div class="select-bottom">
                    <div class="select-right">
                      <div class="top-left"></div>
                      <div class="top-right"></div>
                      <div class="bottom-left"></div>
                      <div class="bottom-right"></div>
                      <div class="center">
                        <ul>
EOF
    for($count = 0; $count < @versions; $count++) {
        print " <li class='choice' data='$versions[$count]'>$versions[$count]</li>\n";
    }
    print <<EOF;
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
	  </div>
EOF
}
