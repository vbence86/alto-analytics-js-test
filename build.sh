#!/bin/bash

set -e

DIST=dist

if [ -d "$DIST" ]; then rm -Rf $DIST; fi

npm run lint
webpack -p --bail

echo "----------------------------------------------";
echo "             Build is successful!";
echo "----------------------------------------------";
