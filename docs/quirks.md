# Quirks

Things that will surprise a cold read of the codebase.

- **Site title is `"rudy"`**, not "roudranil" — `src/config.ts:7`. Shows in `<title>` and the shell-prompt-styled header branding (`[rudy ~]$`). Grepping for "roudranil" in `src/` will mostly miss branding strings.
- **`@utils` and `@config` resolve to single files**, not directories (`tsconfig.json:9-16`). `@utils` → `src/utils/utils.js`. Importing `@utils/anything-else` will not resolve.
- **Nav labels are shell-prompt styled** (`~/about`, `~/posts`, etc. in `src/config.ts` `MENU`), but `Header.astro:42-47` matches the *active* nav item by stripping to the last `/`-segment of the *path* (`menuItem.path.split("/").pop()`), not the label. The label string and the matching logic are two separate things that must stay in sync by convention, not by type.
- **`src/utils/utils.js` is the one non-TypeScript source file.** `buildTOC` has a hardcoded assumption baked into a comment (`utils.js:7`): markdown bodies are assumed to start at `h2`, because `h1` is reserved for the layout-injected page title. Changing that assumption requires editing the literal `2` in the function.
- **Dead code deliberately left in place**: `Header.astro:14-26,32,99-101` and (per earlier exploration) `Socials.astro` carry commented-out alternate implementations (unused logo SVG, cursor-blink animation, alternate title-underline gradient). These are not cleanup targets unless explicitly asked — per repo convention (`.claude/rules/common/coding-style.md`), pre-existing dead code gets flagged, not silently deleted.
- **`about.md`/`contact.md` bypass the content-collection system entirely** — they're plain `src/pages/*.md` files using `layout:` frontmatter, while `posts`/`projects`/`stuff` go through Zod-validated collections. Two coexisting authoring patterns for what look like similar "static page" needs; this is historical, not a rule to follow for new page types.
- **`TableOfContentsHeading.astro` uses raw unicode escapes** (`\251C`, `\2514`) for box-drawing tree glyphs in a CSS `content` value, rather than literal characters — copy-pasting the literal character in will not match if you edit that value directly; use the escape form.

See `build-and-deploy.md` for scripts that were intentionally deleted (`release.sh`, `version.sh`, old `sync-version.sh`) — don't resurrect references to them.
