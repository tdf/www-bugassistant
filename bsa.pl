#!/usr/bin/perl -s
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
require "bugzilla.pl";

my $bz = BzConnect();

if ($proc eq "versions")
{
  # Open the html template
  my $template = HTML::Template->new(filename => 'versions.tmpl');
  my @versions = BzSortVersions(BzFindVersions($bz));
  my @BSAversions;

  # Create a blacklist of versions that we don't want in the BSA.
  open(FILE, "version-blacklist.txt") or die ("Unable to open version blacklist.");
  %blacklist = map { chomp; $_ => 1 } ( <FILE> );
  close(FILE);

  push(@BSAversions, { name => $none, nr => -1 } );
  my $count = 0;
  foreach (@versions)
  {
    unless ( $blacklist{$_} ) {
      push(@BSAversions, { name => $_, nr => $count });
    }
    $count++;
  }

  $template->param( loop => [ @BSAversions ], choose => $choose );
  print $template->output;
}
elsif ($proc eq "systems")
{
  # Open the html template
  my $template = HTML::Template->new(filename => 'systems.tmpl');
  my @BzOpSys = BzFindOperatingSystems($bz);
  my @BSASystems;

  # Create a blacklist of versions that we don't want in the BSA.
  open(FILE, $opSysFile) or die ("Unable to open version blacklist.");
  @systems = map { chomp; $_ } (<FILE>);
  close(FILE);

  my $count = 0;
  foreach (@systems)
  {
    my($display_value, $data) = split(/::/, $_, 2);
    if (grep {$_ eq $data} @BzOpSys)
    {
      push(@BSASystems, { data => $data, count => $count, name => $display_value });
    }
    else
    {
      die "Found OS ".$data." in ".$opSysFile." but not in bugzilla";
    }
    $count++;
  }

  $template->param( loop => [ @BSASystems ], choose => $choose );
  print $template->output;
}

