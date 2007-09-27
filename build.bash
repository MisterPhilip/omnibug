#!/bin/bash

#
# Build extension .xpi
#

APP=omnibug
XPIFILE=${APP}.xpi

#find . -name "*.jar" -exec rm {} \;
find . -name "*.xpi" -exec rm {} \;

#echo "Creating chrome jar"
#cd chrome
#files=`find . -type f|egrep -v "(\.svn|\.jar)"`
#zip ${APP}.jar $files
#cd ..
#echo ""

echo "Creating xpi"
files=`find chrome -type f|grep -v \.svn`

zip "$XPIFILE" $files install.rdf chrome.manifest
echo ""

echo -n "Created file: "
ls "$XPIFILE"

