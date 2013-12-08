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
my @stable = (4,0,6);
my @latest = (4,1,3);

if ($proc eq "versions")
{
  # Open the html template
  my $template = HTML::Template->new(filename => 'versions.tmpl');
  my @versions = BzSortVersions(BzFindVersions($bz));
  my @BSAversions;

  push(@BSAversions, { name => $none, nr => -1 } );
  my $count = -1, $master = 0, $beta = 0;
  foreach (@versions)
  {
    my @version = split(/[\. ]/, $_);
    if (($master == 0) && ($_ !~ /master/)) { push(@BSAversions, { name => $_, nr => $count }); $master = 1; next; } #master
    if (((@version[0] > @latest[0]) || ((@version[0] == @latest[0]) && (@version[0] > @latest[1]))) && ($beta == 0)) { 
	push(@BSAversions, { name => $_, nr => $count }); $beta = 1; next;
    } #1 alpha/beta of next minor
    if ((@version[0] == @latest[0]) && (@version[1] == @latest[1]) && ((@version[2] > @latest[2] || ($_ =~ /release/)) { 
        push(@BSAversions, { name => $_, nr => $count }); next;
    } #beta's newer then bugfix and releases of latest minor
    if ((@version[0] == @stable[0]) && (@version[1] == @stable[1]) && ((@version[2] > @latest[2] || ($_ =~ /release/)) {
        push(@BSAversions, { name => $_, nr => $count }); next;
    } #beta's newer then bugfix and releases of stable minor
    $count++;
  }
  push(@BSAversions, { name => "other", nr => -2 });

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
elsif ($proc eq "checkComponents")
{

  my @BzModules = BzFindModules($bz);

  open(FILE, $componentsFile) or die ("Unable to open ".$componentsFile.": ".$!);
  while(<FILE>) {
    if(/data="(.*?)"/) {
      $module =  $1;
      $module =~ s/_/ /g;
      if (!grep {$_ eq $module} @BzModules)
      {
	die "Component $module in wiki but not in bugzilla";
      }
    }
  }
  close(FILE);
}
