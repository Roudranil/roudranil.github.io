import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Astro's build copies this module into dist/.prerender during SSR
// prerendering, so import.meta.url no longer points at the source tree —
// process.cwd() (the project root, since npm scripts always run from there)
// is the only reliable anchor for locating the repo and the cache file.
const REPO_ROOT = process.cwd();
const CACHE_PATH = join(REPO_ROOT, "src/data/last-edited-cache.json");

let gitAvailable: boolean | undefined;
let cache: Record<string, string> | undefined;

function readCache(): Record<string, string> {
    if (cache) return cache;
    if (!existsSync(CACHE_PATH)) {
        cache = {};
        return cache;
    }
    cache = JSON.parse(readFileSync(CACHE_PATH, "utf-8"));
    return cache as Record<string, string>;
}

function writeCache(next: Record<string, string>): void {
    cache = next;
    const sorted = Object.fromEntries(Object.entries(next).sort(([a], [b]) => a.localeCompare(b)));
    writeFileSync(CACHE_PATH, `${JSON.stringify(sorted, null, 4)}\n`);
}

/** Memoized check for whether `git` is usable against this checkout at all. */
export function isGitAvailable(): boolean {
    if (gitAvailable !== undefined) return gitAvailable;
    try {
        execSync("git rev-parse --short HEAD", { cwd: REPO_ROOT, stdio: ["ignore", "pipe", "ignore"] });
        gitAvailable = true;
    } catch {
        gitAvailable = false;
    }
    return gitAvailable;
}

/** Short hash of the currently checked-out `HEAD`, or `null` if git is unavailable. */
export function getCommitHash(): string | null {
    if (!isGitAvailable()) return null;
    return execSync("git rev-parse --short HEAD", { cwd: REPO_ROOT }).toString().trim();
}

/** Current branch name, or `null` if git is unavailable or `HEAD` is detached. */
export function getBranchName(): string | null {
    if (!isGitAvailable()) return null;
    const branch = execSync("git rev-parse --abbrev-ref HEAD", { cwd: REPO_ROOT })
        .toString()
        .trim();
    return branch === "HEAD" ? null : branch;
}

/**
 * Commit date of the latest commit reachable from `HEAD` that touched `filePath`
 * (project-root-relative). Falls back to `src/data/last-edited-cache.json` when
 * `git log` returns nothing (untracked file, lost history) and self-heals that
 * cache whenever a real lookup succeeds. Assumes the caller already checked
 * `isGitAvailable()`.
 */
export function getLastEditedDate(filePath: string): Date | null {
    let output = "";
    try {
        output = execSync(`git log -1 --format=%cI -- ${JSON.stringify(filePath)}`, {
            cwd: REPO_ROOT,
        })
            .toString()
            .trim();
    } catch {
        output = "";
    }

    if (output) {
        const entries = readCache();
        if (entries[filePath] !== output) {
            writeCache({ ...entries, [filePath]: output });
        }
        return new Date(output);
    }

    const cached = readCache()[filePath];
    return cached ? new Date(cached) : null;
}
