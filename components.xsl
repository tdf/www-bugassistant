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
    <xsl:param name="choose"/>

    <xsl:template match="node()|@*">
        <xsl:copy>
            <xsl:apply-templates select="node()|@*"/>
        </xsl:copy>
    </xsl:template>

    <xsl:template match="html">
      <div class="component select">
        <div class="select-header">
          <div class="chosen"><xsl:value-of select="$choose"/></div>
        </div>
        <div class="choices">
          <div class="select-top">
            <div class="select-left">
              <div class="select-bottom">
                <div class="select-right">
                  <div class="top-left"></div>
                  <div class="top-right"></div>
                  <div class="bottom-left"></div>
                  <div class="bottom-right"></div>
                  <div class="center">
                    <ul>
                      <xsl:apply-templates select="//*[@class='component']"/>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </xsl:template>

    <xsl:template match="div[@class='component']">
	<xsl:element name="li">
	  <xsl:attribute name="data"><xsl:value-of select="translate(translate(*[position()=1],' ','_'),&quot;&#10;&quot;,'_')" /></xsl:attribute>
	  <xsl:attribute name="idvalue">0</xsl:attribute>
	  <xsl:attribute name="class">choice</xsl:attribute>
	  <xsl:value-of select="*[position()=1]"/>
	</xsl:element>
    </xsl:template>

</xsl:stylesheet>
