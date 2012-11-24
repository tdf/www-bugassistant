print "<?xml version='1.0' encoding='ISO-8859-1'?>\n";

print <<EOF;
	  <div class="op_sys select">
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

while(<STDIN>) {
    $op_sys = $_;
    $op_sys =~ s/\R//g;
    my($display_value, $data) = split(/::/, $op_sys, 2);
    print " <li class='choice' data='$data'>$display_value</li>\n";
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
