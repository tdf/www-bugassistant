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
use Scalar::Util qw(looks_like_number);
require "../bugzilla.pl";

# Open the html template
my $template = HTML::Template->new(filename => 'stats.tmpl');
# Open connection to Bugzilla
my $bz = BzConnect();
# Find Modules & Versions
my @modules = BzFindModules($bz);
my @show;
my $versionsPerMinor = DevideVersions(BzSortVersions(BzFindVersions($bz)));
# Count Unconfirmed Bugs
my @bugs;
my @bugsPerModulePerVersion;
my $totalBugsPerModule = 0;
my %totalBugsPerVersion = ();
my $totalBugs = 0;

#Build header-line in template
foreach $minorVersion (sort keys %$versionsPerMinor)
{
  push(@show, { HeaderVersionsName => $minorVersion });
  $totalBugsPerVersion{"$minorVersion"} = 0;
}
$template->param( Rows => (2 + scalar(@show)), Date => gmtime(time())." GMT +0:00", HeaderVersions => [ @show ] );

#Build module-lines in template
@show = ();
foreach $module (@modules)
{
  foreach $minorVersion (sort keys %$versionsPerMinor)
  {
    @bugs = BzFindUnconfirmedBugsPerModulePerVersion($bz, $module, @{$versionsPerMinor->{"$minorVersion"}});
    push(@perModulePerVersion, { LinesVersionsCount => scalar(@bugs) });
    $totalBugsPerModule+= scalar(@bugs);
    $totalBugsPerVersion{"$minorVersion"}+= scalar(@bugs);
  }
  push(@show, { LinesName => $module, LinesCount => $totalBugsPerModule, LinesVersions => [ @perModulePerVersion ] });
  $totalBugs+= $totalBugsPerModule;
  $totalBugsPerModule = 0;
  @perModulePerVersion = ();
}
$template->param( Lines => [ @show ] );

#Build Total-line in template
@show = ();
foreach $minorVersion (sort keys %totalBugsPerVersion)
{
  push(@show, { TotalVersionsCount => $totalBugsPerVersion{$minorVersion} });
}
$template->param( { TotalCount => $totalBugs, TotalVersions => [ @show ] });

#Print it all
print $template->output;

=head2 Devide the versions to Minor versions

The call requires an array with all the versions
The call will return a hash-table with all the versions devided in minor versions

=cut

sub DevideVersions
{
  my (@versions) = @_;
  my $cVersion = "";
  my $currentVersion = "";
  my @versionsThisMinor = ();
  my %versionsPerMinor = ();

  foreach my $version (@versions)
  {
    if ($version eq "") { next };
    $cVersion = ($version =~ qr/^\d\.\d.*/)?substr($version,0,3):"Other";
    if ($currentVersion ne $cVersion)
    {
      if (scalar(@versionsThisMinor) > 0 )
      {
	  $versionsPerMinor{"$currentVersion"} = [ @versionsThisMinor ];
      }
      $currentVersion = $cVersion;
      @versionsThisMinor = ();
    }
    push(@versionsThisMinor, $version);
  }
  if (scalar(@versionsThisMinor) > 0)
  {
    $versionsPerMinor{"$currentVersion"} = [ @versionsThisMinor ];
  }
  return \%versionsPerMinor;
}

