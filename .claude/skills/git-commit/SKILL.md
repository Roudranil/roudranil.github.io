---
name: git-commit
description: Enforces conventional commits, atomic commit discipline, PR title format, and co-author attribution. Use whenever creating commits or pull requests in this project.
---

# Git Commit Discipline

## 1. Conventional Commits — Format

```
<type>[(<scope>)][!]: <subject>

[optional body]

[optional footer(s)]
```

Every commit **must** conform to this structure. No exceptions.

- The `!` before the colon signals a **breaking change** (correlates with SemVer MAJOR).
- Scope is optional but encouraged when the change is domain-specific.

---

## 2. Types

| Type       | When to use                                               | SemVer |
| ---------- | --------------------------------------------------------- | ------ |
| `feat`     | A new feature or behavior visible to the user or system   | MINOR  |
| `fix`      | A bug fix — corrects incorrect behavior                   | PATCH  |
| `refactor` | A code change that neither fixes a bug nor adds a feature | —      |
| `perf`     | A code change that improves performance                   | PATCH  |
| `test`     | Adding missing tests or correcting existing tests         | —      |
| `docs`     | Documentation only changes                                | —      |
| `style`    | Formatting, whitespace, semicolons — no logic change      | —      |
| `build`    | Changes to the build system or external dependencies      | —      |
| `ci`       | Changes to CI configuration files and scripts             | —      |
| `chore`    | Tooling, deps, config — no production code change         | —      |
| `revert`   | Revert a prior commit — reference the SHA in the body     | varies |

Any type suffixed with `!` (e.g. `feat!:`, `refactor!:`) signals a **BREAKING CHANGE** → SemVer **MAJOR**.

**Never invent types.** If none fit, use the closest and note it in the body.

---

## 3. Scope

- Scope is **optional but encouraged** when the change is domain-specific.
- Use short lowercase identifiers: `api`, `auth`, `db`, `cli`, `ui`, `config`, `sync`.
- Omit scope only when the change is truly cross-cutting.

---

## 4. Subject Line Rules

These are **hard rules**, not suggestions:

- **Imperative mood**: "add", "fix", "remove" — not "added", "fixes", "removing"
- **No capital first letter** after the colon
- **No trailing period**
- **50 characters max** (hard limit — rewrite if over)
- **No filler**: avoid "just", "actually", "some", "various", "minor"
- Describe **what changes**, not why (why goes in body)

**Good:**

```
feat(auth): add OAuth2 refresh token flow
fix(api): return 404 on missing resource
test(db): cover concurrent write edge case
```

**Bad:**

```
Fixed some stuff
feat: Added new feature for the ledger thing.
update things
```

---

## 5. Body Rules

- Separate from subject with a **blank line**
- Explain **why**, not what — the diff shows what
- Wrap at **72 characters per line**
- Use bullet points for multi-point rationale
- Reference issues per project convention (e.g. `Closes #42`, `Part of #99`)
- Only include a body when the subject line is insufficient

---

## 6. Footer Rules

- `BREAKING CHANGE: <description>` — mandatory for any breaking change; triggers major version bump
- `BREAKING-CHANGE: <description>` — synonymous with above (hyphenated form)
- `Co-authored-by: Name <email>` — for attributions (see §8)
- `Refs: #42` — for non-closing issue references
- One footer entry per line
- Footer tokens use `-` in place of spaces (e.g. `Acked-by`, `Reviewed-by`)

---

## 7. Atomic Commit Principles — Non-Negotiable

An atomic commit is a single, complete, self-contained unit of change — the Single Responsibility Principle applied to version control.

**Why this matters:**

- **Revertable without side effects.** If removing a commit from history also removes unrelated changes, it was not atomic.
- **Precise bisection.** `git bisect` pinpoints the offending commit; atomic scope means you know exactly which changes caused the bug.
- **Reduced cognitive load.** Decomposing large work into atomic units makes progress visible, context-switching cheaper, and review tractable.

### Rules

- **One work item per commit. Hard stop.** If files from two different logical work items are staged together, unstage and split — no exceptions, no "they're related."
- **One logical change per commit.** One fix, one feature slice, one refactor — scoped entirely within that work item.
- **All files in a commit must belong to the same topic.** No mixing UI, DB, and tests from different features in one commit.
- **Never bundle unrelated fixes.** If you notice a separate bug while working, fix it in a separate commit under its own task.
- **Tests for a change travel with the change.** Don't commit a feature without its tests, or tests without the code they cover.
- **Do not commit broken states.** Every commit must leave the codebase compilable and tests passing.

### Size Heuristics (treat as warnings, not limits)

| Signal                     | Action                         |
| -------------------------- | ------------------------------ |
| > 10 files changed         | Break it into multiple commits |
| > 100 lines changed        | Break it into multiple commits |
| Commit message needs "and" | Split it                       |

### Splitting a large change

If a task requires 300+ lines across multiple concerns, break it into a stack:

```
feat(db): add expense_tags schema migration        <- schema only
feat(ledger): wire tag selection to posting flow   <- business logic
test(ledger): cover tag posting edge cases         <- tests
```

---

## 8. Co-Author Attribution — Mandatory

Every commit made with AI assistance **must** include the co-author footer:

```
Co-Authored-By: Claude <noreply@anthropic.com>
```

Use this exact string regardless of which Claude model is active.

### HEREDOC commit template

Always pass commit messages via HEREDOC to avoid shell escaping issues:

```bash
git commit -m "$(cat <<'EOF'
feat(auth): add OAuth2 refresh token flow

Allows silent re-authentication when access token expires.
Refresh tokens stored encrypted in the credential store.

Refs: #42
Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

---

## 9. PR Title Discipline

PR titles are the permanent record. They must be exact and scannable.

### Format

```
<type>(<scope>): <subject>
```

- Follow all subject line rules from §4
- Append issue references if applicable (e.g. `[#42]`, `[#42, #43]`)
- Never include branch name in the PR title
- Keep the full title under **72 characters**

**Good:**

```
feat(auth): add OAuth2 refresh token flow
fix(api): handle timeout on upstream service
```

**Bad:**

```
#173: settings stuff
WIP: ledger changes + router fix + some tests
feat: a bunch of stuff for this sprint
```

### PR Description is not optional

A PR title alone is not sufficient. The description must include:

- **What**: one-line summary of the change
- **Why**: motivation or context
- **Changes**: bullet list of files/components touched
- **Tests**: what was tested and how

---

## 10. Pre-Commit Checklist

Before every commit, verify:

- [ ] Type and scope are correct
- [ ] Subject is imperative, <=50 chars, no trailing period
- [ ] Body explains _why_ (if included)
- [ ] All changed files belong to the same logical topic
- [ ] Tests travel with the change they cover
- [ ] No debug prints, commented-out code, or TODOs snuck in
- [ ] Co-author footer present
- [ ] Linter / type-checker passes

---

## 11. What Never Belongs in a Commit

- Secrets, API keys, tokens — ever
- `.DS_Store` and other OS metadata files
- Generated files not tracked by project convention
- Lock file changes caused by unrelated dep drift
- Reformatting of files you didn't logically touch
- Multiple unrelated bug fixes bundled as "misc fixes"
