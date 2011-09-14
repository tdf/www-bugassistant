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
    print "<select name='version' class='versions'>\n";
    print " <option value=''>(chose a version)</option>\n";
    print " <option value='?'>(Version unspecified)</option>\n";
    for($count = 0; $count < @versions; $count++) {
        if($versions[$count] ne 'unspecified') {
            print " <option value='$versions[$count]'>$versions[$count]</option>\n";
        }
    }
    print "</select>\n";
}
