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

build: build-en build-fr

check:
	perl sanity.pl TEST

clean: clean-en clean-fr

en: build-en

build-en: start-en extract-en compose-en

start-en:
	echo "\n\n===== BSA English =====\n"

extract-en:
	mkdir -p build_en/components
# Remove the old combined file and set up a new one.
	rm -f build_en/components/combined.xhtml
	cat start.txt > build_en/components/combined.xhtml
	for file in `cat components.txt|tr ' ' _`; do echo $$file; curl --silent https://wiki.documentfoundation.org/QA/Bugzilla/Components/$$file/Help | tidy --numeric-entities yes -asxhtml -utf8 2>/dev/null | xsltproc --encoding UTF-8 --novalid combine.xsl - >> build_en/components/combined.xhtml ; done
	cat end.txt >> build_en/components/combined.xhtml
	xsltproc --encoding UTF-8 --novalid stripnamespace.xsl build_en/components/combined.xhtml > build_en/BugReport_Details.xhtml
	xsltproc --encoding UTF-8 --novalid component_comments.xsl build_en/BugReport_Details.xhtml > build_en/component_comments.xhtml
	xsltproc --stringparam choose "`cat en/choose.txt`" --stringparam other "(All other problems)" --encoding UTF-8 --novalid subcomponents.xsl build_en/BugReport_Details.xhtml > build_en/subcomponents.xhtml
	xsltproc --stringparam choose "`cat en/choose.txt`" --encoding UTF-8 --novalid components.xsl build_en/BugReport_Details.xhtml > build_en/components.xhtml
	curl --silent 'https://bugs.freedesktop.org/query.cgi?product=LibreOffice&query_format=advanced' > build_en/query.xhtml
	perl op_sys.pl "`cat en/choose.txt`" < en/op_sys.txt > build_en/op_sys.xhtml
	perl query.pl "`cat en/choose.txt`" "NONE" < build_en/query.xhtml > build_en/versions.xhtml
	perl sanity.pl build_en/query.xhtml build_en/components.xhtml

compose-en:
	xsltproc --encoding UTF-8 --novalid --stringparam serial `date +%s` bug.xsl en/bug.xhtml > bug/bug.html

clean-en:
	rm -f build_en/BugReport_Details.xhtml build_en/tidyout.xhtml build_en/component_comments.xhtml build_en/subcomponents.xhtml build_en/components.xhtml build_en/query.xhtml build_en/versions.xhtml bug/bug.html build_en/op_sys.xhtml
	rm -f build_en/components/*.html build_en/components/combined.xhtml
	rmdir build_en/components
	rmdir build_en

fr: build-fr

build-fr: start-fr extract-fr compose-fr

start-fr:
	echo "\n\n===== BSA French =====\n"

extract-fr:
	mkdir -p build_fr
	curl --silent https://wiki.documentfoundation.org/QA/BSA/BugReport_Details/fr | tidy --numeric-entities yes -asxhtml -utf8 2>/dev/null > build_fr/tidyout.xhtml || echo "ignoring tidy error"
	xsltproc --encoding UTF-8 --novalid stripnamespace.xsl build_fr/tidyout.xhtml > build_fr/BugReport_Details.xhtml
	xsltproc --encoding UTF-8 --novalid component_comments.xsl build_fr/BugReport_Details.xhtml > build_fr/component_comments.xhtml
	xsltproc --stringparam choose "`cat fr/choose.txt`" --stringparam other "(All other problems)" --encoding UTF-8 --novalid subcomponents.xsl build_fr/BugReport_Details.xhtml > build_fr/subcomponents.xhtml
	xsltproc --stringparam choose "`cat fr/choose.txt`" --encoding UTF-8 --novalid components.xsl build_fr/BugReport_Details.xhtml > build_fr/components.xhtml
	curl --silent 'https://bugs.freedesktop.org/query.cgi?product=LibreOffice&query_format=advanced' > build_fr/query.xhtml
	perl op_sys.pl "`cat fr/choose.txt`" < fr/op_sys.txt > build_fr/op_sys.xhtml
	perl query.pl "`cat fr/choose.txt`" "AUCUN" < build_fr/query.xhtml > build_fr/versions.xhtml

compose-fr:
	xsltproc --encoding UTF-8 --novalid --stringparam serial `date +%s` bug.xsl fr/bug.xhtml > bug/bug_fr.html

clean-fr:
	rm -f build_fr/BugReport_Details.xhtml build_fr/tidyout.xhtml build_fr/component_comments.xhtml build_fr/subcomponents.xhtml build_fr/components.xhtml build_fr/query.xhtml build_fr/versions.xhtml bug/bug_fr.html build_fr/op_sys.xhtml
	rmdir build_fr
