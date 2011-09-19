<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output indent="yes"  encoding="UTF-8"/>
    <xsl:strip-space elements="*"/>

    <xsl:template match="node()|@*">
        <xsl:copy>
            <xsl:apply-templates select="node()|@*"/>
        </xsl:copy>
    </xsl:template>

    <xsl:template match="html">
      <div class="component select">
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
	  <xsl:attribute name="class">choice</xsl:attribute>
	  <xsl:value-of select="*[position()=1]"/>
	</xsl:element>
    </xsl:template>

</xsl:stylesheet>
