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
    @versions = @{$vers[$libreoffice]};
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
