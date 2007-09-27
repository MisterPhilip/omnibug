#!/bin/bash


#
# @TODO: update install.rdf with rev version
#

APP=omnibug

find . -name *.jar -exec rm {} \;
find . -name *.xpi -exec rm {} \;

echo "Creating chrome jar"
cd chrome
files=`find . -type f|egrep -v "(\.svn|\.jar)"`
zip ${APP}.jar $files
cd ..
echo ""

echo "Creating xpi"
xpifile=${APP}.xpi
zip "$xpifile" chrome/${APP}.jar install.rdf chrome.manifest
echo ""

echo -n "Created file: "
ls "$xpifile"

