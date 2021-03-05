#!/bin/bash

SOURCE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
echo $SOURCE_DIR
function finish {
  popd 1>/dev/null 2>&1
}
pushd "$SOURCE_DIR"
trap finish EXIT

set -e

./pants run run.jvm generator:bin --jvm-run-jvm-program-args="--twemojiJsRegexFile ../lib/regex.js"

echo "Formatting generated code"
yarn lint
