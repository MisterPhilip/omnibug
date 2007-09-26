#!/bin/bash

#
# @TODO: no .svn files in zips
#

APP=omnibug

find . -name *.jar -exec rm {} \;
find . -name *.xpi -exec rm {} \;

buildid=$1
[[ "$buildid" == "" ]] && buildid=`date +%Y%m%d`
xpifile=${APP}-$buildid.xpi

echo "Creating chrome jar"
cd chrome
files=`find . -type f|egrep -v "(\.svn|\.jar)"`
zip ${APP}.jar $files
cd ..
echo ""

echo "Creating xpi"
zip "$xpifile" chrome/${APP}.jar install.rdf chrome.manifest
echo ""

echo -n "Created file: "
ls "$xpifile"
