<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output indent="yes"  encoding="UTF-8"/>
    <xsl:strip-space elements="*"/>

    <xsl:template match="text()" />

    <xsl:template match="div[contains(@class,'component')]">
	<xsl:element name="div">
	  <xsl:attribute name="class"><xsl:value-of select="translate(translate(*[position()=1],' ','_'),&quot;&#10;&quot;,'_')" /></xsl:attribute>
	  <select class="subcomponent" name="short_desc">
            <option selected='selected' value=''>(chose one)</option>
            <option value=''>(all other problems)</option>
	    <xsl:apply-templates select="descendant::*[contains(@class,'search')]"/>
	  </select>
	</xsl:element>
    </xsl:template>

    <xsl:template match="*[contains(@class,'search')]">
	<xsl:if test="not(contains(*,'['))">
	 <xsl:element name="option">
	  <xsl:attribute name="value"><xsl:value-of select="*"/></xsl:attribute>
	  <xsl:value-of select="*"/>
	 </xsl:element>
	</xsl:if>
    </xsl:template>
    
</xsl:stylesheet>
