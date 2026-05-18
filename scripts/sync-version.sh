#!/usr/bin/env bash
# sync-version.sh — Propagates the canonical version (./version) into package.json.
#
# Usage:
#   ./scripts/sync-version.sh
#
# Exit codes:
#   0  Success
#   1  version file or package.json not found

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

VERSION_FILE="$REPO_ROOT/version"
PACKAGE_JSON="$REPO_ROOT/package.json"

if [[ ! -f "$VERSION_FILE" ]]; then
  echo "error: version file not found: $VERSION_FILE" >&2
  exit 1
fi
if [[ ! -f "$PACKAGE_JSON" ]]; then
  echo "error: package.json not found: $PACKAGE_JSON" >&2
  exit 1
fi

version=$(tr -d '[:space:]' < "$VERSION_FILE")

node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('$PACKAGE_JSON', 'utf8'));
pkg.version = '$version';
fs.writeFileSync('$PACKAGE_JSON', JSON.stringify(pkg, null, 4) + '\n');
"

echo "synced: package.json version → ${version}"
