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

    <xsl:template match="text()" />

    <xsl:template match="div[contains(@class,'component')]">
	<xsl:element name="div">
	  <xsl:attribute name="class"><xsl:value-of select="translate(translate(*[position()=1],' ','_'),&quot;&#10;&quot;,'_')" /></xsl:attribute>
	  <div class="subcomponent select">
            <div class="select-header">
              <div class="chosen">(chose one)</div>
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
                          <li class="choice" data=''>(all other problems)</li>
                          <xsl:apply-templates select="descendant::*[contains(@class,'search')]"/>
                        </ul>
                      </div>
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
	  <xsl:attribute name="class">choice</xsl:attribute>
	  <xsl:value-of select="*"/>
	 </xsl:element>
	</xsl:if>
    </xsl:template>
    
</xsl:stylesheet>
