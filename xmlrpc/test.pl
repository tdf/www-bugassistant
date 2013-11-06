#!/usr/bin/perl
# This file is part of the LibreOffice BSA project.
#
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
require "bugzilla.pl";

my $bz = BzConnect();
my @bugs = BzFindUnconfirmedBugsPerModule($bz, "Drawing");

print scalar(@bugs);

print join("\n", @bugs) . "\n";
