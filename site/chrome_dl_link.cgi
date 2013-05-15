#!/bin/bash

echo "Content-Type: text/html"
echo ""

#VER=`readlink omnibug-current.xpi  | sed 's/omnibug-//g' | sed 's/\.xpi//g'`
FILE=`ls -1tr *.crx | grep -v current | tail -1`
#MOD=`stat -c "%y" $FILE | awk -F"." '{ print $1 }'`
MOD=`stat -c "%Y" $FILE | perl -MDate::Format -le'print time2str( "%C", (<>) )'`

echo "<a href='$FILE'>$FILE</a> (released $MOD)"
