#!/usr/bin/env bash
# =============================================================================
# release.sh — Merge dev into main and tag the release
# =============================================================================
#
# DESCRIPTION
#   Performs a release by merging dev into main with a merge commit (--no-ff),
#   tagging with the version from ./version, and pushing. The push to main
#   triggers the existing deploy.yml GitHub Actions workflow.
#
# USAGE
#   scripts/release.sh [--dry-run]
#
# FLAGS
#   --dry-run    Print what would happen without modifying anything.
#   --help, -h   Print this help and exit.
#
# PREREQUISITES
#   - Must be on the dev branch
#   - Working tree must be clean
#   - dev must be up to date with origin/dev
#   - npm run build must succeed
#   - Tag v<version> must not already exist
#
# WHAT IT DOES
#   1. Reads ./version
#   2. Verifies prerequisites
#   3. Runs npm run build as sanity check
#   4. Checks out main, pulls latest
#   5. Merges dev into main (--no-ff)
#   6. Tags v<version>
#   7. Pushes main + tag
#   8. Checks out dev again
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
VERSION_FILE="$REPO_ROOT/version"

# ---------------------------------------------------------------------------
# Flags
# ---------------------------------------------------------------------------
dry_run=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)
      dry_run=1
      shift
      ;;
    --help|-h)
      awk 'NR==1{next} /^#/{sub(/^# ?/, ""); print; next} {exit}' "$0"
      exit 0
      ;;
    *)
      echo "Error: unknown flag '$1'" >&2
      exit 1
      ;;
  esac
done

# ---------------------------------------------------------------------------
# Pre-flight
# ---------------------------------------------------------------------------
if [[ ! -f "$VERSION_FILE" ]]; then
  echo "error: version file not found: $VERSION_FILE" >&2
  exit 1
fi

version=$(tr -d '[:space:]' < "$VERSION_FILE")
tag="v${version}"

echo "=== Release: ${tag} ==="
echo ""

# Must be on dev
current_branch=$(git -C "$REPO_ROOT" branch --show-current)
if [[ "$current_branch" != "dev" ]]; then
  echo "error: must be on dev branch (currently on: $current_branch)" >&2
  exit 1
fi
echo "  branch: dev ✓"

# Clean working tree
if [[ -n "$(git -C "$REPO_ROOT" status --porcelain)" ]]; then
  echo "error: working tree is dirty — commit or stash before releasing" >&2
  git -C "$REPO_ROOT" status --short >&2
  exit 1
fi
echo "  working tree: clean ✓"

# Dev is up to date with remote
git -C "$REPO_ROOT" fetch origin dev --quiet
local_sha=$(git -C "$REPO_ROOT" rev-parse dev)
remote_sha=$(git -C "$REPO_ROOT" rev-parse origin/dev)
if [[ "$local_sha" != "$remote_sha" ]]; then
  echo "error: dev is not in sync with origin/dev" >&2
  echo "  local:  $local_sha" >&2
  echo "  remote: $remote_sha" >&2
  echo "  run: git pull or git push" >&2
  exit 1
fi
echo "  dev in sync with remote ✓"

# Tag must not exist
if git -C "$REPO_ROOT" rev-parse "$tag" &>/dev/null; then
  echo "error: tag ${tag} already exists" >&2
  exit 1
fi
echo "  tag ${tag}: available ✓"
echo ""

# ---------------------------------------------------------------------------
# Dry-run: stop here
# ---------------------------------------------------------------------------
if [[ $dry_run -eq 1 ]]; then
  echo "[dry-run] would run: npm run build"
  echo "[dry-run] would checkout main and pull"
  echo "[dry-run] would merge dev into main (--no-ff)"
  echo "[dry-run] would tag: ${tag}"
  echo "[dry-run] would push main + tag to origin"
  echo "[dry-run] would checkout dev"
  exit 0
fi

# ---------------------------------------------------------------------------
# Build check
# ---------------------------------------------------------------------------
echo "--- build check ---"
(cd "$REPO_ROOT" && npm run build)
echo "  build: passed ✓"
echo ""

# ---------------------------------------------------------------------------
# Merge dev → main
# ---------------------------------------------------------------------------
echo "--- release ---"
git -C "$REPO_ROOT" checkout main
git -C "$REPO_ROOT" pull origin main --quiet
git -C "$REPO_ROOT" merge dev --no-ff -m "release: v${version}"
echo "  merged dev into main ✓"

# ---------------------------------------------------------------------------
# Tag
# ---------------------------------------------------------------------------
git -C "$REPO_ROOT" tag -a "$tag" -m "Release ${tag}"
echo "  tagged: ${tag} ✓"

# ---------------------------------------------------------------------------
# Push
# ---------------------------------------------------------------------------
echo ""
echo "--- pushing ---"
git -C "$REPO_ROOT" push origin main
git -C "$REPO_ROOT" push origin "$tag"
echo "  pushed main + ${tag} → origin ✓"

# ---------------------------------------------------------------------------
# Return to dev
# ---------------------------------------------------------------------------
git -C "$REPO_ROOT" checkout dev
echo ""
echo "Release ${tag} complete. Deploy will trigger automatically."
