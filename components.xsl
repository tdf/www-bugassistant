<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output indent="yes"  encoding="UTF-8"/>
    <xsl:strip-space elements="*"/>

    <xsl:template match="node()|@*">
        <xsl:copy>
            <xsl:apply-templates select="node()|@*"/>
        </xsl:copy>
    </xsl:template>

    <xsl:template match="html">
	<select size='7' class="component" name="component">
          <option value=''>(chose a component)</option>
          <xsl:apply-templates select="//*[@class='component']"/>
	</select>
    </xsl:template>

    <xsl:template match="div[@class='component']">
	<xsl:element name="option">
	  <xsl:attribute name="value"><xsl:value-of select="translate(translate(*[position()=1],' ','_'),&quot;&#10;&quot;,'_')" /></xsl:attribute>
	  <xsl:value-of select="*[position()=1]"/>
	</xsl:element>
    </xsl:template>

</xsl:stylesheet>
