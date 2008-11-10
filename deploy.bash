#!/bin/bash

#
# Extension deployment script
#

# Get most current revision
PLACEHOLDER=ts
echo "Updating revision number"
echo `date` > ${PLACEHOLDER}
svn commit -m"Revision placeholder" ${PLACEHOLDER}
echo ""

APP=omnibug
MAJOR=0
MINOR=5
INC=`svn info ${PLACEHOLDER} |grep ^Revision|awk '{ print $2 }'`

extrapath=""
if [[ "$1" == "ross" ]]; then
    extrapath=ross/
    echo "Doing private deployment to ${extrapath}"
fi

./build.bash

# update revision
echo -n "$0: incrementing version: old=$INC; "
INC=$((INC+1))
VER="${MAJOR}.${MINOR}.${INC}"
echo "new=${INC}"
echo ""
cat install.rdf | sed "s/em:version=\".*\"$/em:version=\"${VER}\"/" > install.rdf.$$
mv install.rdf.$$  install.rdf

echo "Comitting updated install.rdf (as ${VER})"
# Commit modified install to svn
svn commit -m"[$0] Incrementing revision for build" install.rdf
echo ""

XPI=omnibug-${VER}.xpi
cp omnibug.xpi $XPI

echo "Adding updated install.rdf to omnibug.xpi"
zip -u $XPI
echo ""

# Don't generate hash until after adding the updated install.rdf
HASH=`shasum ${XPI} | awk '{ print $1 }'`

cat update.rdf.tpl | sed "s/TOK_VER/${VER}/g" | sed "s/TOK_HASH/${HASH}/g" > update.rdf

#
# Sign update.rdf
#
echo -n "Please sign `pwd`/update.rdf with McCoy now; press enter when done."
read foo


#
# Deploy (or not) to galactica
#
if [[ "x$1" == "x" || "$1" == "ross" ]]; then
    echo "Sending update.rdf and xpi to galactica"
    scp update.rdf $XPI rosssimpson@galactica.7mph.com:httpdocs/dev/${extrapath}
    echo ""

    echo "Updating symlink"
    ssh rosssimpson@galactica.7mph.com "ln -sf $XPI httpdocs/dev/${extrapath}omnibug-current.xpi"

    echo "Done.  URL is https://rosssimpson.com/dev/${extrapath}omnibug-current.xpi"
else
    echo "Done.  Did not deploy to galactica."
fi

