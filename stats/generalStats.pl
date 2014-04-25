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
use POSIX qw(strftime);
require "../bugzilla.pl";

# Open the html template
my $template = HTML::Template->new(filename => 'generalStats.tmpl');
# Open connection to Bugzilla
my $bz = BzConnect();
my @bugs;
my $date = strftime("%Y-%m-%dT%H:%M:%S", localtime( (time()-(24*60*60)) ) );
$template->param( Date => strftime("%Y-%m-%d %H:%M:%S", gmtime(time()))." GMT" );

@bugs = BzFindBugsWithWhiteboardStatus($bz, "", "id");
$template->param( { bugsTotal => scalar(@bugs) } );
@bugs = BzFindBugsCreatedWithinLastPeriod($bz, $date, "id");
$template->param( { bugsCreated => scalar(@bugs) } );
@bugs = BzFindBugsChangedWithinLastPeriod($bz, $date, "id");
$template->param( { bugsChanged => scalar(@bugs) } );
@bugs = BzFindBugsWithWhiteboardStatus($bz, "bibisect", "id");
$template->param( { bugsBibisect => scalar(@bugs) } );
@bugs = BzFindBugsWithWhiteboardStatus($bz, "BSA", "id");
$template->param( { bugsBSA => scalar(@bugs) } );
@bugs = BzFindBugsWithWhiteboardStatus($bz, "Regression", "id");
$template->param( { bugsRegression => scalar(@bugs) } );
@bugs = BzFindBugsWithWhiteboardStatus($bz, "PossibleRegression", "id");
$template->param( { bugsPossibleRegression => scalar(@bugs) } );

#Print it all
print $template->output;

