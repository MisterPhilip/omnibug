#!/bin/bash

echo "Content-Type: text/html"
echo ""

#VER=`readlink omnibug-current.xpi  | sed 's/omnibug-//g' | sed 's/\.xpi//g'`
CUR=`readlink omnibug-current.xpi`
#FILE=`ls -1tr *.xpi | grep -v current | tail -5`
FILE=`ls -1t *.xpi | grep -v current | grep -v $CUR | head -3`

echo "<ul>"
for f in $FILE; do
    #MOD=`stat -c "%y" $f | awk -F"." '{ print $1 }'`
    MOD=`stat -c "%Y" $f | perl -MDate::Format -le'print time2str( "%C", (<>) )'`
    echo "<li><a href='$f'>$f</a>, released $MOD</li>"
done
echo "</ul>"

