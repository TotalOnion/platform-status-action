#!/bin/bash

export INPUT_PLATFORM=${1:-pantheon}
export INPUT_FAIL_ON_RED=${2:-false}
export GITHUB_STEP_SUMMARY=summary.md

rm $GITHUB_STEP_SUMMARY
touch $GITHUB_STEP_SUMMARY


# ncc build src/index.js -o dist

# npm run build
# npm run lint
# npm run format-check

node dist/index.js

echo "---- SUMMARY ----"
cat summary.md
