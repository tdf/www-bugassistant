<xsl:stylesheet version="1.0"
		xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output indent="yes" encoding="UTF-8" method="xml" omit-xml-declaration="yes"/>

    <xsl:template match="/">
	  <xsl:copy-of select="//*[@class='component']"/>
    </xsl:template>
</xsl:stylesheet>
