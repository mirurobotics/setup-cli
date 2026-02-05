#!/bin/sh
set -e

NODE_OPTIONS=--experimental-vm-modules NODE_NO_WARNINGS=1 npx jest "$@"

