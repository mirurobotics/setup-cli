#!/bin/sh

set -e

LINT_DIR="$(pwd)"

# When running inside a git submodule the .git entry is a file pointing to the
# parent repo (e.g. ../../.git/modules/<name>). Docker can't follow those
# relative paths, so we rsync into a temp dir with a real git repo.
if [ -f .git ]; then
	LINT_DIR=$(mktemp -d)
	trap 'rm -rf "$LINT_DIR"' EXIT

	rsync -a --exclude='node_modules' --exclude='.git' . "$LINT_DIR/"

	git init "$LINT_DIR" >/dev/null
	git -C "$LINT_DIR" checkout -b main >/dev/null
	git -C "$LINT_DIR" add . >/dev/null
	git -C "$LINT_DIR" commit -m "lint" --no-gpg-sign >/dev/null
fi

docker run --rm \
	-e CHECKOV_FILE_NAME=.checkov.yml \
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
	-v "${LINT_DIR}":/tmp/lint \
	ghcr.io/super-linter/super-linter:slim-latest
