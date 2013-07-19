#!/bin/bash

#
# Build extension .xpi
#

set -e

APP=omnibug
MAJOR=0
MINOR=5

# Get most current version
PLACEHOLDER=version.txt
PATCH=`cat ${PLACEHOLDER}`

VERSION="${MAJOR}.${MINOR}.${PATCH}"


if [[ "$1" != "amo" && "$1" != "site" ]]; then
    echo "Usage: $0 <mode>, where mode is one of [ 'amo', 'site' ]"
    echo "You probably want 'site' mode."
    echo
    exit 1
fi

if [[ -e install.rdf ]]; then
    rm install.rdf
fi

if [[ "$1" == "amo" ]]; then
    echo "Building extension for AMO"
    cp install.rdf.amo install.rdf
else
    echo "Building extension for own site"
    cp install.rdf.site install.rdf
fi

# Copy common JS
cp ../common/*.js chrome/content/omnibug/


XPIFILE=${APP}-${1}-${VERSION}.xpi

echo "Creating XPI"
chrome_files=$( find -L chrome -type f | egrep -v '(\.git|\.swp)' )
defaults_files=$( find -L defaults -type f | egrep -v '(\.git|\.swp)' )

zip "$XPIFILE" $chrome_files $defaults_files install.rdf chrome.manifest
echo ""

echo -n "Created file: "
ls "$XPIFILE"


if [[ -e install.rdf ]]; then
    rm install.rdf
fi

