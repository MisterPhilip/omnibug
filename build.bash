#!/bin/bash


#
# @TODO: update install.rdf with rev version
#

APP=omnibug
REV=`svn info install.rdf |grep ^Revision|awk '{ print $2 }'`

find . -name *.jar -exec rm {} \;
find . -name *.xpi -exec rm {} \;

echo "Creating chrome jar"
cd chrome
files=`find . -type f|egrep -v "(\.svn|\.jar)"`
zip ${APP}.jar $files
cd ..
echo ""

echo "Creating xpi"
xpifile=${APP}-${REV}.xpi
zip "$xpifile" chrome/${APP}.jar install.rdf chrome.manifest
echo ""

echo -n "Created file: "
ls "$xpifile"

