#!/usr/bin/env bash
# =============================================================================
# version.sh — Project version manager
# =============================================================================
#
# DESCRIPTION
#   Reads, bumps, and commits the project version stored in ./version (repo root).
#   That file is the single source of truth for the current semver string.
#   After bumping, syncs the version into package.json via sync-version.sh.
#
#   The version format is:  MAJOR.MINOR.PATCH[-TAG]
#
# USAGE
#   scripts/version.sh [--major] [--minor] [--patch] [--tag <string>] [--no-tag] [--dry-run]
#   scripts/version.sh --help
#
# FLAGS
#   --major          Increment MAJOR, reset MINOR and PATCH to 0.
#   --minor          Increment MINOR, reset PATCH to 0.
#   --patch          Increment PATCH.
#   --tag <string>   Set pre-release tag (e.g. --tag beta → x.y.z-beta).
#   --no-tag         Remove existing tag without changing numbers.
#   --dry-run        Print what would happen without modifying anything.
#   --help, -h       Print this help message and exit.
#
# BUMP PRECEDENCE
#   --major > --minor > --patch
#
# EXAMPLES
#   scripts/version.sh --patch              # 1.0.0 -> 1.0.1
#   scripts/version.sh --minor              # 1.0.1 -> 1.1.0
#   scripts/version.sh --major --tag rc1    # 1.1.0 -> 2.0.0-rc1
#   scripts/version.sh --patch --dry-run    # prints plan, no changes
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
VERSION_FILE="$REPO_ROOT/version"

# ---------------------------------------------------------------------------
# Help
# ---------------------------------------------------------------------------
help() {
  awk 'NR==1{next} /^#/{sub(/^# ?/, ""); print; next} {exit}' "$0"
  exit 0
}

# ---------------------------------------------------------------------------
# Pre-flight: verify version file
# ---------------------------------------------------------------------------
if [[ ! -f "$VERSION_FILE" ]]; then
  echo "Error: version file not found at $VERSION_FILE" >&2
  exit 1
fi

current="$(cat "$VERSION_FILE")"

if [[ "$current" =~ ^([0-9]+)\.([0-9]+)\.([0-9]+)(-(.+))?$ ]]; then
  major="${BASH_REMATCH[1]}"
  minor="${BASH_REMATCH[2]}"
  patch="${BASH_REMATCH[3]}"
  current_tag="${BASH_REMATCH[5]:-}"
else
  echo "Error: version file contains invalid semver: '$current'" >&2
  exit 1
fi

# ---------------------------------------------------------------------------
# Defaults
# ---------------------------------------------------------------------------
bump_major=0
bump_minor=0
bump_patch=0
new_tag=""
clear_tag=0
tag_provided=0
dry_run=0

# ---------------------------------------------------------------------------
# Usage
# ---------------------------------------------------------------------------
usage() {
  echo "Usage: $(basename "$0") [--major] [--minor] [--patch] [--tag <string>] [--no-tag] [--dry-run]" >&2
  echo "Run '$(basename "$0") --help' for full documentation." >&2
  exit 1
}

if [[ $# -eq 0 ]]; then
  usage
fi

# ---------------------------------------------------------------------------
# Argument parsing
# ---------------------------------------------------------------------------
while [[ $# -gt 0 ]]; do
  case "$1" in
    --help|-h)
      help
      ;;
    --major)
      bump_major=1
      shift
      ;;
    --minor)
      bump_minor=1
      shift
      ;;
    --patch)
      bump_patch=1
      shift
      ;;
    --tag)
      if [[ $# -lt 2 || -z "$2" ]]; then
        echo "Error: --tag requires a non-empty string value" >&2
        exit 1
      fi
      new_tag="$2"
      tag_provided=1
      shift 2
      ;;
    --no-tag)
      clear_tag=1
      shift
      ;;
    --dry-run)
      dry_run=1
      shift
      ;;
    *)
      echo "Error: unknown flag '$1'" >&2
      usage
      ;;
  esac
done

# ---------------------------------------------------------------------------
# Validation
# ---------------------------------------------------------------------------
if [[ $clear_tag -eq 1 && $tag_provided -eq 1 ]]; then
  echo "Error: --tag and --no-tag are mutually exclusive" >&2
  exit 1
fi

# ---------------------------------------------------------------------------
# Apply version bumps (precedence: major > minor > patch)
# ---------------------------------------------------------------------------
if [[ $bump_major -eq 1 ]]; then
  major=$((major + 1))
  minor=0
  patch=0
elif [[ $bump_minor -eq 1 ]]; then
  minor=$((minor + 1))
  patch=0
elif [[ $bump_patch -eq 1 ]]; then
  patch=$((patch + 1))
fi

# ---------------------------------------------------------------------------
# Determine final tag
# ---------------------------------------------------------------------------
final_tag=""
if [[ $tag_provided -eq 1 ]]; then
  final_tag="$new_tag"
elif [[ $clear_tag -eq 1 ]]; then
  final_tag=""
elif [[ $bump_major -eq 1 || $bump_minor -eq 1 || $bump_patch -eq 1 ]]; then
  final_tag=""
else
  final_tag="$current_tag"
fi

# ---------------------------------------------------------------------------
# Assemble new version
# ---------------------------------------------------------------------------
new_version="$major.$minor.$patch"
if [[ -n "$final_tag" ]]; then
  new_version="$new_version-$final_tag"
fi

if [[ "$new_version" == "$current" ]]; then
  echo "Version unchanged: $current"
  exit 0
fi

# ---------------------------------------------------------------------------
# Dry-run: print plan and exit
# ---------------------------------------------------------------------------
if [[ $dry_run -eq 1 ]]; then
  echo "[dry-run] version: $current -> $new_version"
  echo "[dry-run] would write $new_version to $VERSION_FILE"
  echo "[dry-run] would sync package.json version"
  echo "[dry-run] would stage: version, package.json"
  echo "[dry-run] would commit: chore(release): bump to v${new_version}"
  exit 0
fi

# ---------------------------------------------------------------------------
# Write version file
# ---------------------------------------------------------------------------
printf '%s' "$new_version" > "$VERSION_FILE"
echo "$current -> $new_version"

# ---------------------------------------------------------------------------
# Sync package.json
# ---------------------------------------------------------------------------
SYNC_SCRIPT="$SCRIPT_DIR/sync-version.sh"
if [[ ! -x "$SYNC_SCRIPT" ]]; then
  chmod +x "$SYNC_SCRIPT"
fi
"$SYNC_SCRIPT"

# ---------------------------------------------------------------------------
# Commit
# ---------------------------------------------------------------------------
git add "$VERSION_FILE" "$REPO_ROOT/package.json"
git commit -m "$(cat <<EOF
chore(release): bump to v${new_version}

Co-Authored-By: claude <noreply@anthropic.com>
EOF
)"
echo "committed: chore(release): bump to v${new_version}"
