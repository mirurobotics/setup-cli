#!/bin/sh

set -e

docker run --rm \
  -e RUN_LOCAL=true \
  -e DEFAULT_BRANCH=main \
  -e FILTER_REGEX_EXCLUDE='dist/**/*' \
  -e LINTER_RULES_PATH='.' \
  -e VALIDATE_ALL_CODEBASE=true \
  -e VALIDATE_BIOME_FORMAT=false \
  -e VALIDATE_BIOME_LINT=false \
  -e VALIDATE_GITHUB_ACTIONS_ZIZMOR=false \
  -e VALIDATE_JAVASCRIPT_ES=false \
  -e VALIDATE_JSCPD=false \
  -e VALIDATE_TYPESCRIPT_ES=false \
  -e VALIDATE_JSON=false \
  -v "$(pwd)":/tmp/lint \
  ghcr.io/super-linter/super-linter:slim-latest