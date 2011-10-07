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
sub parse {
    my($query_path, $components_path) = @_;
    my($key, $value) = @_;

    open(QUERY, $query_path) or die "$query_path: $!";
    while(<QUERY>) {
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
    close(QUERY);

    foreach (@{$cpts[$libreoffice]}) {
        # 
        next if($_ eq 'BugAssistantTest');
        $bugzilla2wiki{$_} = 0;
    }

    open(COMPONENTS, $components_path) or die "$components_path: $!";
    while(<COMPONENTS>) {
        if(/data="(.*?)"/) {
            $component = $1;
            $component =~ s/_/ /g;
            if(exists $bugzilla2wiki{$component}) {
                $bugzilla2wiki{$component}++;
            } else {
                $bugzilla2wiki{$component} = -1;
            }
        }
    }
    close(COMPONENTS);

    return \%bugzilla2wiki;
}

sub analyze {
    my($bugzilla2wiki, $query_path, $components_path) = @_;

    my($status) = 0;

    while ( my ($key, $value) = each(%$bugzilla2wiki) ) {
        if($value == -1) {
            print "component $key found in the wiki but not in the bugzilla\n";
            $status++;
        } elsif($value == 0) {
            print "component $key found in bugzilla but not in the wiki\n";
            $status++;
        } elsif($value > 1) {
            print "component $key found $value times in the wiki\n";
            $status++;
        }
    }
    if($status > 0) {
        print "wiki URL http://wiki.documentfoundation.org/BugReport_Details\n";
        print "components extracted with components.xsl from the wiki are in $components_path\n";
        print "bugzilla URL https://bugassistant.libreoffice.org/enter_bug.cgi?product=LibreOffice\n";
        print "bugzilla information retrieved from $query_path\n";
    }
    return $status;
}

sub tests {
    use Test::More;

    my($bugzilla2wiki) = parse('sanity-query.xhtml', 'sanity-components.xhtml');

    while ( my ($key, $value) = each(%$bugzilla2wiki) ) {
        if($key eq "BugAssistant" || $key eq "Localisation") {
            ok($value == 0, "$key $value");
        } elsif($key eq 'Localization') {
            ok($value == -1, "$key $value");
        } elsif($key eq 'Database') {
            ok($value == 2, "$key $value");
        } else {
            ok($value == 1, "$key $value");
        }
    }

    my($status) = analyze($bugzilla2wiki, 'sanity-query.xhtml', 'sanity-components.xhtml');
    ok($status == 4, "analyze $status");

    done_testing(21);
}

if($ARGV[0] eq 'TEST') {
    tests();
} else {
    exit(analyze(parse($ARGV[0], $ARGV[1]), $ARGV[0], $ARGV[1]));
}
