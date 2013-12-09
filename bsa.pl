#!/usr/bin/perl -s
# -*- mode: CPerl; tab-width: 2; indent-tabs-mode: nil; -*-
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

# TODO: Get these variables from an outside service such as the updater,
# MirrorBrain (http://download.documentfoundation.org/libreoffice/stable/)
# or etc..
#
# Note: For our filtering purposes, we will ASSUME that the stable
# version listed is the oldest supported release series. For example:
#   If 4.0.6 is 'stable', then oldest supported series is 4.0.
my $stable = "4.0.6";
my $versionRE = '^(\d+[.]\d+)([.]\d+)';
my $oldestSupportedVersion = ($stable =~ /$versionRE/)[0];

if ($proc eq "versions")
{
  # Open the html template
  my $template = HTML::Template->new(filename => 'versions.tmpl');
  my @versions = BzSortVersions(BzFindVersions($bz));
  my @BSAversions;
  # This hash keeps track of which supported versions have already
  # been released.
  my %releasedVersions = ();

  push(@BSAversions, { name => $none, nr => -1 } );
  my $count = -1, $foundMaster = 0, $addMe = 0;
  foreach $version (@versions)
  {
    $addVersion = 0;

    # Create version strings for later comparison.
    $version =~ /$versionRE/;
    my $majorMinor = $1;
    my $majorMinorPoint = $1 . $2;

    # Include the latest master branch.
    if (!$foundMaster &&
        ($foundMaster = $version =~ /master$/i)) {
      $addVersion = 1;
    } elsif ($majorMinor >= $oldestSupportedVersion) {
      # Include any releases that are from the oldest supported
      # release branch or newer.
      if(($version =~ /release$/) ||
         # Include the latest alpha/beta/rc from any not-yet-released
         # (but will-be-supported) release.
         (($version =~ /(rc|alpha|beta)\d*$/) &&
          !$releasedVersions{$majorMinorPoint})) {
        $releasedVersions{$majorMinorPoint} = 1;
        $addVersion = 1;
      }
    }

    if($addVersion) {
      push(@BSAversions, { name => $version, nr => $count });
    } else {
      $count++;
    }
  }

  # The term 'older versions' can be our catch-all.
  push(@BSAversions, { name => "older versions", nr => -2 });

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
