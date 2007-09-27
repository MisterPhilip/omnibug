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
MINOR=4
INC=`svn info ${PLACEHOLDER} |grep ^Revision|awk '{ print $2 }'`

# update revision
echo -n "$0: incrementing version: old=$INC; "
INC=$((INC+1))
VER="${MAJOR}.${MINOR}.${INC}"
echo "new=${INC}"
echo ""
cat install.rdf | sed "s/em:version>.*</em:version>${VER}</" > install.rdf

echo "Comitting updated install.rdf"
# Commit modified install to svn
svn commit -m"[$0] Incrementing revision for build" install.rdf
echo ""

XPI=omnibug-${VER}.xpi

cat update.rdf.tpl | sed "s/XXX/${VER}/g" > update.rdf
cp omnibug.xpi $XPI

echo "Adding updated install.rdf to omnibug.xpi"
zip -u $XPI
echo ""

if [[ "x$1" == "x" ]]; then
    echo "Sending update.rdf and xpi to galactica"
    scp update.rdf $XPI rosssimpson@galactica.7mph.com:httpdocs/dev/
    echo ""

    echo "Updating symlink"
    ssh rosssimpson@galactica.7mph.com "ln -sf $XPI httpdocs/dev/omnibug-current.xpi"
fi

echo "Done."

