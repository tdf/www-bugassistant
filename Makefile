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
all: build

build: build-en

check: check-en

clean: clean-en

build-en: extract-en compose-en

extract-en:
	mkdir -p build_en
	curl --silent https://wiki.documentfoundation.org/BugReport_Details | tidy --numeric-entities yes -asxhtml 2>/dev/null > build_en/tidyout.xhtml || echo "ignoring tidy error"
	xsltproc --encoding UTF-8 --novalid stripnamespace.xsl build_en/tidyout.xhtml > build_en/BugReport_Details.xhtml
	xsltproc --encoding UTF-8 --novalid component_comments.xsl build_en/BugReport_Details.xhtml > build_en/component_comments.xhtml
	xsltproc --encoding UTF-8 --novalid subcomponents.xsl build_en/BugReport_Details.xhtml > build_en/subcomponents.xhtml
	xsltproc --encoding UTF-8 --novalid components.xsl build_en/BugReport_Details.xhtml > build_en/components.xhtml
	curl --silent 'https://bugs.freedesktop.org/query.cgi?product=LibreOffice&query_format=advanced' > build_en/query.xhtml
	perl op_sys.pl < op_sys.txt > build_en/op_sys.xhtml
	perl query.pl < build_en/query.xhtml > build_en/versions.xhtml
	perl sanity.pl build_en/query.xhtml build_en/components.xhtml

compose-en:
	xsltproc --encoding UTF-8 --novalid --stringparam serial `date +%s` bug.xsl bug.xhtml > bug/bug.html

check-en:
	perl sanity.pl TEST

clean-en:
	rm -f build_en/BugReport_Details.xhtml build_en/tidyout.xhtml build_en/component_comments.xhtml build_en/subcomponents.xhtml build_en/components.xhtml build_en/query.xhtml build_en/versions.xhtml bug/bug.html
	rmdir build_en
