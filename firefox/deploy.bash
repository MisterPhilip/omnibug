#!/bin/bash

#
# Extension deployment script
#

APP=omnibug
MAJOR=0
MINOR=5

# Get most current version
PLACEHOLDER=version.txt
PATCH=`cat ${PLACEHOLDER}`

extrapath=""
if [[ "$1" == "ross" ]]; then
    extrapath=ross/
    echo "Doing private deployment to ${extrapath}"
fi

# build for site deploy
./build.bash site

# update version
echo -n "$0: incrementing version: old=$PATCH; "
PATCH=$((PATCH+1))
VER="${MAJOR}.${MINOR}.${PATCH}"
echo "new=${PATCH}"
echo ""

cat install.rdf | sed "s/em:version=\".*\"$/em:version=\"${VER}\"/" > install.rdf.$$
mv install.rdf.$$ install.rdf

echo "Comitting updated install.rdf (as ${VER})"
# Commit modified install
git commit install.rdf -m"[$0] Incrementing install.rdf version for build" && git push
echo ""

XPI=${APP}-${VER}.xpi
cp ${APP}.xpi $XPI

echo "Adding updated install.rdf to ${APP}.xpi"
zip -u $XPI
echo ""

# Don't generate hash until after adding the updated install.rdf
HASH=`openssl sha1 ${XPI} | awk '{ print $2 }'`

cat update.rdf.tpl | sed "s/TOK_VER/${VER}/g" | sed "s/TOK_HASH/${HASH}/g" > update.rdf

#
# Sign update.rdf
#
echo -n "Please sign `pwd`/update.rdf with McCoy now; press enter when done."
read foo


#
# Deploy (or not)
#
if [[ "x$1" == "x" || "$1" == "ross" ]]; then
    echo "Sending update.rdf and xpi"
    scp update.rdf $XPI rosssimpson.com:www/dev/${extrapath}
    echo ""

    echo "Updating symlink"
    ssh rosssimpson.com "ln -sf $XPI www/dev/${extrapath}${APP}-current.xpi"

    echo "Done.  URL is https://rosssimpson.com/dev/${extrapath}${APP}-current.xpi"
else
    echo "Done.  Did not deploy."
fi

