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
    <xsl:param name="other"/>
    <xsl:param name="otherData"/>

    <xsl:template match="text()" />

    <xsl:template match="div[contains(@class,'component')]">
	<xsl:element name="div">
	  <xsl:attribute name="class"><xsl:value-of select="translate(translate(*[position()=1],' ','_'),&quot;&#10;&quot;,'_')" /></xsl:attribute>
	  <div class="subcomponent select">
            <div class="select-header">
              <div class="chosen"><xsl:value-of select="$choose"/></div>
            </div>
            <div class="choices">
              <div class="select-top">
                <div class="select-middle">
                  <div class="select-bottom">
                    <div class="center">
                      <ul>
                        <li class="choice" data='{$otherData}' idvalue=''><xsl:value-of select="$other"/></li>
                        <xsl:apply-templates select="descendant::*[contains(@class,'search')]"/>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
	  </div>
	</xsl:element>
    </xsl:template>

    <xsl:template match="*[contains(@class,'search')]">
	<xsl:if test="not(contains(*,'['))">
	 <xsl:element name="li">
	  <xsl:attribute name="data"><xsl:value-of select="*"/></xsl:attribute>
	  <xsl:attribute name="idvalue">0</xsl:attribute>
	  <xsl:attribute name="class">choice</xsl:attribute>
	  <xsl:value-of select="*"/>
	 </xsl:element>
	</xsl:if>
    </xsl:template>

</xsl:stylesheet>
