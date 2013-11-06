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

use strict;
use lib qw(lib);
use Scalar::Util qw(looks_like_number);
use File::Basename qw(dirname);
use File::Spec;
use HTTP::Cookies;
use XMLRPC::Lite;

# URI Bugzilla
my $Bugzilla_uri = "https://bugs.freedesktop.org/xmlrpc.cgi";

=head2 Connect to Bugzilla

Connect to the URI in $Bugzilla_uri
The call will return a XMLRPC::Lite-object

=cut

sub BzConnect {
  my $cookie_jar = new HTTP::Cookies('file' => File::Spec->catdir(dirname($0), 'cookies.txt'), 'autosave' => 1);
  my $bz = XMLRPC::Lite->proxy($Bugzilla_uri, 'cookie_jar' => $cookie_jar);
}

=head2 Find Unconfirmed Bugs for a Module

The call requires a XMLRPC::Lite-object that has the connection-information to the bugzilla
The call requires the name for a module
The call will return a array with bugs or will fail

=cut

sub BzFindUnconfirmedBugsPerModule {
  my $soapresult = $_[0]->call('Bug.search',
			      { product => "LibreOffice",
			        status => "UNCONFIRMED",
				component => $_[1] } );
  _die_on_fault($soapresult);
  return @{$soapresult->result->{bugs}};
}

=head2 Find the modules in bugzilla for the LibreOffice Product

The call requires a XMLRPC::Lite-object that has the connection-information to the bugzilla
The call will return a array with modules or will fail

=cut

sub BzFindModules {
  return _find_values_for_field($_[0], "component", 1);
}

=head2 Find the versions in bugzilla for the LibreOffice Product

The call requires a XMLRPC::Lite-object that has the connection-information to the bugzilla
The call will return a array with versions or will fail

=cut

sub BzFindVersions {
  return _find_values_for_field($_[0], "version", 1);
}

=head2 Find the operating systems in bugzilla for the LibreOffice Product

The call requires a XMLRPC::Lite-object that has the connection-information to the bugzilla
The call will return a array with operating systems or will fail

=cut

sub BzFindOperatingSystems {
  return _find_values_for_field($_[0], "op_sys", 0);
}

=head2 Sort versions correctly

The call requires the array to sort
The call will return a array with versions or will fail

=cut
sub BzSortVersions {
  return sort {
      if (looks_like_number(substr($a, 0, 1)) == 0) {
          return 1;
      } elsif (looks_like_number(substr($b, 0, 1)) == 0) {
          return -1;
      } else {
          return lc($b) cmp lc($a);
      }
  } @_;
}

#Gets the values for LibreOffice for a field
#Input: The connection to bugzilla
#Input: The name of the field
#Input: Return only items with LibreOffice visibility
#Output: Array with the values
sub _find_values_for_field {
  my @LOValues;
  my $value;
  my $product;
  my $soapresult = $_[0]->call('Bug.fields',
			      { names => $_[1] } );
  _die_on_fault($soapresult);
  my @values = @{$soapresult->result->{fields}->[0]->{values}};
  foreach $value (@values)
  {
    $product = $value->{visibility_values}->[0];
    if ($product eq "LibreOffice" || !$_[2]) {
      push(@LOValues, $value->{name});
    }
  }
  return @LOValues;
}

#Prints the fault in the soapresult and exists
#Input: The soapresult
sub _die_on_fault {
    if ($_[0]->fault) {
        my ($package, $filename, $line) = caller;
        die "SOAP-error in $filename on line $line: ".$_[0]->faultcode." ".$_[0]->faultstring."\n";
    }
}
