#!/bin/bash
cd /var/www/sites/bugassistant.libreoffice.org/website/stats
perl generalStats.pl > ../bug/qateam/generalStats.html
perl unconfirmedBugsCount.pl > ../bug/qateam/unconfirmedBugsCount.html
