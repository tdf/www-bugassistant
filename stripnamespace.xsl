<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output indent="yes"  encoding="UTF-8" method="xml" omit-xml-declaration="yes"/>

    <xsl:template match="*">
        <xsl:element name="{name()}">
            <xsl:apply-templates select="node()|@*"/>
        </xsl:element>
    </xsl:template>

    <xsl:template match="@*">
        <xsl:copy/>
    </xsl:template>
</xsl:stylesheet>
