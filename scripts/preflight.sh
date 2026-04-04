#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT=$(git rev-parse --show-toplevel)
cd "$REPO_ROOT"

echo "=== Format Check ==="
npm run format:check
echo ""

echo "=== Lint ==="
npm run lint
echo ""

echo "=== Test ==="
npm run ci-test
