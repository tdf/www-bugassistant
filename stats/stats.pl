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
require "../bugzilla.pl";

# Open the html template
my $template = HTML::Template->new(filename => 'stats.tmpl');
# Open connection to Bugzilla
my $bz = BzConnect();
# Find Modules
my @moduleNames = BzFindModules($bz);
# Count Unconfirmed Bugs
my @modules;
my @bugs;

foreach (@moduleNames)
{
  @bugs = BzFindUnconfirmedBugsPerModule($bz, $_);
  push(@modules, { UBModuleName => $_, UBModuleCount => scalar(@bugs) });
}

# Fill in in template
$template->param( UBModules => [ @modules ] );
# print template
print $template->output;


