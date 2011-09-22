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
	#jscoverage --no-instrument=jquery-validation-1.8.1 bug bug-cover

extract:
	curl --silent http://wiki.documentfoundation.org/BugReport_Details | tidy --numeric-entities yes -asxhtml 2>/dev/null | perl -pe 's|xmlns="http://www.w3.org/1999/xhtml"||' > BugReport_Details.xhtml
	xsltproc --encoding UTF-8 --novalid component_comments.xsl BugReport_Details.xhtml > component_comments.xhtml
	xsltproc --encoding UTF-8 --novalid subcomponents.xsl BugReport_Details.xhtml > subcomponents.xhtml
	xsltproc --encoding UTF-8 --novalid components.xsl BugReport_Details.xhtml > components.xhtml
	curl --silent 'https://bugs.freedesktop.org/query.cgi?product=LibreOffice&query_format=advanced' > query.xhtml
	perl query.pl versions < query.xhtml > versions.xhtml

compose:
	xsltproc --encoding UTF-8 --novalid \
		--stringparam serial `date +%s` \
		bug.xsl bug.xhtml > bug/bug.html
