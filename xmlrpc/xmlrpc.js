function callCalculator() {
  var request = new XmlRpcRequest("https://bugassistant.libreoffice.org/xmlrpc.cgi", "Bug.search");
  request.addParam({id:71220});
  request.crossDomain = true;
  var response = request.send().parseXML();
  alert(response.bugs[0].priority);

  var request = new XmlRpcRequest("https://bugassistant.libreoffice.org/xmlrpc.cgi", "Bug.get");
  request.addParam({ids:[71220,71196]});
  request.crossDomain = true;
  var response = request.send().parseXML();
  alert(response.bugs[1].summary);
}

