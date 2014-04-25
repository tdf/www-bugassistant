#!/usr/bin/perl -w
# This file is part of the LibreOffice BSA project.
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http:www.gnu.org/licenses/>.

use HTML::Template;
use Text::CSV;
use LWP::Simple;
use Scalar::Util qw(looks_like_number);
require "../bugzilla.pl";

# Open the html template
my $template = HTML::Template->new(filename => 'generalStats.tmpl');
# Open connection to Bugzilla
my $bz = BzConnect();
# Count Touched and Created Bugs
BugsCreatedPastDay();

$template->param( Date => gmtime(time())." GMT +0:00" );

sub GetCsvFileFromUrl
{
    my ($file, $url) = @_;

    getstore($url, "$file");
}

sub BugsCreatedPastDay
{
    my @bugsPastDayData;
    my %hash =  (   "bugsChanged" => "https://bugs.freedesktop.org/buglist.cgi?chfieldfrom=-1D&chfieldto=Now&list_id=372820&product=LibreOffice&query_format=advanced&ctype=csv",
                    "bugsCreated" => "https://bugs.freedesktop.org/buglist.cgi?chfield=%5BBug%20creation%5D&chfieldfrom=-1D&chfieldto=Now&list_id=372831&product=LibreOffice&query_format=advanced&ctype=csv");

    while (($file, $url) = each(%hash))
    {
        GetCsvFileFromUrl("${file}.csv", $url); #create csv files

        open my $fh, "<", "${file}.csv" or die "$file: $!";

        my $csv = Text::CSV->new ({
        binary => 1,
        auto_diag => 1,
        });
        $count = 0;
        while (my $row = $csv->getline($fh))
        {
            $count += 1;
        }
        $template->param( { $file => $count});
        close $fh;
        unlink("${file}.csv"); #delete csv files afterwards
    }
}

#Print it all
print $template->output;

