import { statSync } from "node:fs";
import { join } from "node:path";

// Astro's build copies this module into dist/.prerender during SSR
// prerendering, so import.meta.url no longer points at the source tree —
// process.cwd() (the project root, since npm scripts always run from there)
// is the only reliable anchor for locating the repo. Same reasoning as
// src/utils/git.ts's REPO_ROOT.
const REPO_ROOT = process.cwd();

/** Size in bytes of a project-root-relative source file, or `null` if it does not exist. */
export function getFileSizeBytes(filePath: string): number | null {
    try {
        return statSync(join(REPO_ROOT, filePath)).size;
    } catch {
        return null;
    }
}

const UNITS = ["", "k", "M", "G"] as const;

/**
 * Formats a byte count the way `ls -h`/`eza -h` do: 1024-divisor, one
 * decimal place below 10 of a unit, rounded to a whole number at/above 10.
 */
export function formatFileSize(bytes: number): string {
    let value = bytes;
    let unitIndex = 0;
    while (value >= 1024 && unitIndex < UNITS.length - 1) {
        value /= 1024;
        unitIndex += 1;
    }
    if (unitIndex === 0) return `${value}`;
    return `${value < 10 ? value.toFixed(1) : Math.round(value)}${UNITS[unitIndex]}`;
}
