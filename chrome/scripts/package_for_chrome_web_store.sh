#!/usr/bin/env bash

set -e

VERSION=$(grep '"version"' manifest.json  | awk '{ print $2 }' | sed 's/"//g' | sed 's/,//g')

echo "Packaging version ${VERSION}"

FILES=$(find . -type f ! -path "./scripts/*" ! -path "./README.md" ! -path "./.gitignore")
ARTIFACT="../build/omnibug_chrome_web_store_${VERSION}.zip"

zip -r "${ARTIFACT}" ${FILES}

echo "Successfully created ${ARTIFACT}"

