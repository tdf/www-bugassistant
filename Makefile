#
#     Copyright (C) 2011 Loic Dachary <loic@dachary.org>
#
#     This program is free software: you can redistribute it and/or modify
#     it under the terms of the GNU General Public License as published by
#     the Free Software Foundation, either version 3 of the License, or
#     (at your option) any later version.
#
#     This program is distributed in the hope that it will be useful,
#     but WITHOUT ANY WARRANTY; without even the implied warranty of
#     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#     GNU General Public License for more details.
#
#     You should have received a copy of the GNU General Public License
#     along with this program.  If not, see <http:www.gnu.org/licenses/>.
#
all: extract compose

extract:
	mkdir -p build
	curl --silent http://wiki.documentfoundation.org/BugReport_Details | tidy --numeric-entities yes -asxhtml 2>/dev/null > build/tidyout.xhtml || echo "ignoring tidy error"
	xsltproc --encoding UTF-8 --novalid stripnamespace.xsl build/tidyout.xhtml > build/BugReport_Details.xhtml
	xsltproc --encoding UTF-8 --novalid component_comments.xsl build/BugReport_Details.xhtml > build/component_comments.xhtml
	xsltproc --encoding UTF-8 --novalid subcomponents.xsl build/BugReport_Details.xhtml > build/subcomponents.xhtml
	xsltproc --encoding UTF-8 --novalid components.xsl build/BugReport_Details.xhtml > build/components.xhtml
	curl --silent 'https://bugs.freedesktop.org/query.cgi?product=LibreOffice&query_format=advanced' > build/query.xhtml
	perl op_sys.pl < op_sys.txt > build/op_sys.xhtml
	perl query.pl < build/query.xhtml > build/versions.xhtml
	perl sanity.pl build/query.xhtml build/components.xhtml

compose:
	xsltproc --encoding UTF-8 --novalid --stringparam serial `date +%s` bug.xsl bug.xhtml > bug/bug.html

check:
	perl sanity.pl TEST

clean:
	rm -f build/BugReport_Details.xhtml build/tidyout.xhtml build/component_comments.xhtml build/subcomponents.xhtml build/components.xhtml build/query.xhtml build/versions.xhtml bug/bug.html
	rmdir build
