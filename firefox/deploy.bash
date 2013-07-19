#!/bin/bash

#
# Extension deployment script
#

find . -name "*.xpi" -delete

APP=omnibug
MAJOR=0
MINOR=5

# Get most current version
PLACEHOLDER=version.txt
PATCH=`cat ${PLACEHOLDER}`


# update version
echo -n "$0: incrementing version: old=$PATCH; "
PATCH=$((PATCH+1))
VER="${MAJOR}.${MINOR}.${PATCH}"
echo "new=${PATCH}"
echo ""
echo "$PATCH" > $PLACEHOLDER

# Update install manifests
sed -i.bak "s/em:version=\".*\"$/em:version=\"${VER}\"/" install.rdf.*
rm *.bak

echo "Comitting updated install manifests (as ${VER})"
# Commit modified install
git commit install.rdf.amo install.rdf.site $PLACEHOLDER -m"[$0] Incrementing version for build ($VER)" && git push
echo ""

# build for site deploy
./build.bash amo
./build.bash site

XPI=${APP}-site-${VER}.xpi

echo "Adding updated install.rdf to ${APP}.xpi"
zip -u $XPI
echo ""

# Don't generate hash until after adding the updated install.rdf.site
HASH=`openssl sha1 ${XPI} | awk '{ print $2 }'`

cat update.rdf.tpl | sed "s/TOK_VER/${VER}/g" | sed "s/TOK_HASH/${HASH}/g" > update.rdf

#
# Sign update.rdf
#
echo -n "Please sign `pwd`/update.rdf with McCoy now; press enter when done."
read foo

echo "Build complete"

