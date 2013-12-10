#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
# This file is part of the LibreOffice project.
#
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
#

#This digs through a pile of bugzilla's and populates the cwd with a big
#collection of bug-docs in per-filetype dirs with bug-ids as names with
#prefixes to indicate which bug-tracker, e.g.
#
#fdo-bugid-X.suffix
#rhbz-bugid-X.suffix
#moz-bugid-X.suffix
#
#where X is the n'th attachment of that type in the bug

from __future__ import print_function
import feedparser
import base64
import datetime
import glob
import re
import os, os.path
import stat
import sys
import time
try:
    from urllib.request import urlopen
except:
    from urllib import urlopen
try:
    import xmlrpc.client as xmlrpclib
except:
    import xmlrpclib
from xml.dom import minidom
from xml.sax.saxutils import escape

def urlopen_retry(url):
    maxretries = 3
    for i in range(maxretries + 1):
        try:
            return urlopen(url)
        except IOError as e:
            print("caught IOError: " + str(e))
            if maxretries == i:
                raise
            print("retrying...")

def get_from_bug_url_via_xml(url, mimetype):
    id = url.rsplit('=', 2)[1]
    print("parsing " + id)
    sock = urlopen_retry(url+"&ctype=xml")
    dom = minidom.parse(sock)
    sock.close()
    count = 0
    for attachment in dom.getElementsByTagName('attachment'):
        #print(" mimetype is", end=' ')
        for node in attachment.childNodes:
            if node.nodeName == 'type':
                #print(node.firstChild.nodeValue, end=' ')
                if node.firstChild.nodeValue.lower() != mimetype.lower():
                    #print('skipping')
                    break
                else:
                    count = count + 1
                    break
    return count

def get_through_rss_query(queryurl, mimetype):
    url = queryurl + '?query_format=advanced&f1=attachments.mimetype&v1=application%2Foctet-stream&o1=equals&product=LibreOffice&ctype=atom'
    print('url is ' + url)
    d = feedparser.parse(url)
    print(str(len(d['entries'])) + ' bugs to process')
    attachCount = 0
    for entry in d['entries']:
        try:
            attachCount = attachCount + get_from_bug_url_via_xml(entry['id'], mimetype)
        except KeyboardInterrupt:
            raise # Ctrl+C should work
        except:
            print(entry['id'] + " failed: " + str(sys.exc_info()[0]))
            pass
    print("Total count = " + attachCount)
#
    #write it to a log
    file = open("mimetypecount.csv", "a")
    file.write("\"" + time.strftime("%d/%m/%Y") + "\",\"" + str(attachCount) + "\"\n")
    file.close()


rss_bugzilla = 'http://bugs.libreoffice.org/buglist.cgi'
mimetype = 'application/octet-stream'

get_through_rss_query(rss_bugzilla, mimetype)

# vim:set shiftwidth=4 softtabstop=4 expandtab:
