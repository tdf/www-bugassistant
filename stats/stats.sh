#!/bin/bash
cd /var/www/sites/bugassistant.libreoffice.org/website/stats
perl stats.pl > ../bug/qateam/unconfirmedBugsCount.html
