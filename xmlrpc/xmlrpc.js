function callCalculator() {
  var request = new XmlRpcRequest("https://bugassistant.libreoffice.org/xmlrpc.cgi", "Bugzilla.version");
  request.crossDomain = true;
  var response = request.send().parseXML();
  alert(response.version);
}
