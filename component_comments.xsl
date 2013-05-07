<!--
     Copyright (C) 2011 Loic Dachary <loic@dachary.org>

     This program is free software: you can redistribute it and/or modify
     it under the terms of the GNU General Public License as published by
     the Free Software Foundation, either version 3 of the License, or
     (at your option) any later version.

     This program is distributed in the hope that it will be useful,
     but WITHOUT ANY WARRANTY; without even the implied warranty of
     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
     GNU General Public License for more details.

     You should have received a copy of the GNU General Public License
     along with this program.  If not, see <http:www.gnu.org/licenses/>.
-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output indent="yes"  encoding="UTF-8"/>
    <xsl:strip-space elements="*"/>

    <xsl:template match="node()|@*">
        <xsl:copy>
            <xsl:apply-templates select="node()|@*"/>
        </xsl:copy>
    </xsl:template>

    <xsl:template match="html">
	<div class="comments">
	 <xsl:apply-templates select="//*[@class='component']"/>
	</div>
    </xsl:template>

    <xsl:template match="div[@class='component']">
	<xsl:element name="div">
	  <xsl:attribute name="class"><xsl:value-of select="translate(translate(*[position()=1],' ','_'),&quot;&#10;&quot;,'_')" /> comment</xsl:attribute>
          <div class="comment-header">Component <xsl:value-of select="*[position()=1]" /> </div>
	  <div class="comment-text"><xsl:apply-templates select="*[position()>1]"/></div>
          <div class="comment-read-more">
            <xsl:element name="a">
              <xsl:attribute name="href">http://wiki.documentfoundation.org/QA/Bugzilla/Components/<xsl:value-of select="translate(translate(*[position()=1],' ','_'),&quot;&#10;&quot;,'_')" />/Extended_Help</xsl:attribute>
              <xsl:attribute name="target">_blank</xsl:attribute>
              Read more ... &gt;
            </xsl:element>
          </div>
	</xsl:element>
    </xsl:template>

    <xsl:template match="//*[contains(@class,'faq') or contains(@class,'submit')]"/>

    <xsl:template match="*[@class='subcomponents']"/>

</xsl:stylesheet>
