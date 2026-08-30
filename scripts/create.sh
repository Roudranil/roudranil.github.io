#!/bin/bash

# scaffolds a new content .mdx file under src/content/<category>/
# frontmatter fields are read from src/schemas/contentSchema.ts via
# scripts/read-schema.ts, so the template never drifts from the real schema.

set -e

usage() {
    cat <<'EOF'
Usage: npm run create -- --category <posts|projects> --name <slug>

Options:
  --category, -c   Content collection: posts, projects, post, or project
  --name, -n        File slug (no date prefix, no extension)
  --help, -h        Show this help message

Creates src/content/<category>/<YYYY-MM-DD>-<name>.mdx with frontmatter
generated from src/schemas/contentSchema.ts: required fields are filled in
(date set to now, draft to true, shortTitle to <name>.md, activeNav to
<category>), optional fields are left commented out.
EOF
}

category=""
name=""

while [[ "$#" -gt 0 ]]; do
    case "$1" in
        --help|-h) usage; exit 0 ;;
        --category|-c) category="$2"; shift 2 ;;
        --name|-n) name="$2"; shift 2 ;;
        *) echo "Unknown argument: $1" >&2; usage >&2; exit 1 ;;
    esac
done

if [[ -z "$category" || -z "$name" ]]; then
    echo "Error: --category and --name are both required." >&2
    usage >&2
    exit 1
fi

# normalize category to its plural form, matching the activeNav enum
case "$category" in
    post|posts) category="posts" ;;
    project|projects) category="projects" ;;
    *)
        echo "Error: --category must be posts, projects, post, or project (got '$category')." >&2
        exit 1
        ;;
esac

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
target_dir="$repo_root/src/content/$category"
mkdir -p "$target_dir"

current_datetime=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
current_date=$(date -u +"%Y-%m-%d")
short_title="$name.md"
file_name="$current_date-$name.mdx"
file_path="$target_dir/$file_name"

if [[ -e "$file_path" ]]; then
    echo "Error: $file_path already exists." >&2
    exit 1
fi

fields_json=$(node "$repo_root/scripts/read-schema.ts")

frontmatter=$(node --input-type=module -e "
const fields = $fields_json;
const values = {
    title: '\"$name\"',
    description: '\"$name\"',
    subtitle: '\"$name\"',
    date: '$current_datetime',
    draft: 'true',
    activeNav: '$category',
    shortTitle: '\"$short_title\"',
    seo_keywords: '[]',
    headings: '[]',
    ai_use: '[]',
    github: '\"\"',
};
const lines = fields.map(({ name, required }) => {
    const value = values[name] ?? '\"\"';
    const line = \`\${name}: \${value}\`;
    return required ? line : \`# \${line}\`;
});
console.log(lines.join('\n'));
")

{
    echo "---"
    echo "$frontmatter"
    echo "---"
    echo
} > "$file_path"

echo "Created $file_path"
echo "Category:    $category"
echo "Short title: $short_title"
echo "Draft:       true"
