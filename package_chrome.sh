#!/bin/bash

# Fail immediately on error
set -e

VERSION=$( cat chrome/manifest.json |grep '"version"' | awk '{ print $2 }' | sed 's/[",]//g' )
ARTIFACT="omnibug-${VERSION}.crx"

echo "Packaging version ${VERSION}"

# 0) run tests?
echo "Pre-build tests"
grunt test
echo ""

# 1) bump version in manifest.json

# 2) copy in common/*.js
cp common/*.js chrome/

# 3) pacakge
crxmake --pack-extension chrome --pack-extension-key omnibug.pem --extension-output ${ARTIFACT} --ignore-file "PLACEHOLDER*"

echo "Created artifact:"
ls -al $ARTIFACT

# 4) upload


