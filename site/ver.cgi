#!/bin/bash

echo "Content-Type: text/html"
echo ""

ls -1tr *.xpi | grep -v current | tail -1 | sed 's/omnibug-//' | sed 's/\.xpi//'
