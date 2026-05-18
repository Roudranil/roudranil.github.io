#!/bin/bash

# Default category to "posts"
category="posts"

# Parse arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --category|-c) category="$2"; shift ;;
        *) name="$1" ;;
    esac
    shift
done

# Check if name is provided
if [[ -z "$name" ]]; then
    echo "Usage: npm run create -- -c <page/posts/projects/stuff> <name-of-page>"
    exit 1
fi

# Determine the target directory
base_dir="./src/content"
if [[ "$category" == "posts" || "$category" == "projects" || "$category" == "stuff" ]]; then
    target_dir="$base_dir/$category"
else
    target_dir="$base_dir"
fi

# Create the target directory if it doesn't exist
mkdir -p "$target_dir"

# Generate the filename and short title
file_name="$name.mdx"
short_title="$name.md"

# Get the current date in ISO 8601 format
current_date=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Define the content template
content="---
title: \"$name\"
description: \"$name\"
date: $current_date
draft: False 
activeNav: $category
shortTitle: \"$short_title\"
# headings:
# github:
---"

# Create the .mdx file with the template content
file_path="$target_dir/$file_name"
echo "$content" > "$file_path"

echo "Created $file_path"
