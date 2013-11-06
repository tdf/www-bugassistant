/*
 * This file is part of the LibreOffice BSA project.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

function callCalculator() {
  /*var request = new XmlRpcRequest("https://bugassistant.libreoffice.org/xmlrpc.cgi", "Bug.search");
  request.addParam({id:71220});
  request.crossDomain = true;
  var response = request.send().parseXML();
  alert(response.bugs[0].priority);

  var request = new XmlRpcRequest("https://bugassistant.libreoffice.org/xmlrpc.cgi", "Bug.get");
  request.addParam({ids:[71220,71196]});
  request.crossDomain = true;
  var response = request.send().parseXML();
  alert(response.bugs[1].summary);*/
  var count = countBugsOnWhiteboard("Need_Advice");
  alert(count);
}

function countBugsOnWhiteboard(text) {
  var request = new XmlRpcRequest("https://bugassistant.libreoffice.org/xmlrpc.cgi", "Bug.search");
  request.addParam({whiteboard:text, status:["UNCONFIRMED","NEW","ASSIGNED","REOPENED"], product:"LibreOffice"});
  request.crossDomain = true;
  var response = request.send().parseXML();
  return response.bugs.length;
}
