/**
 * Builds a CSS `color-mix()` expression for a Catppuccin ctp-* color variable.
 *
 * Tailwind can't generate a utility class for a dynamically composed class
 * name — its scanner only picks up literal strings in source files. Returning
 * a raw CSS value for use in an inline `style` attribute sidesteps that.
 */
export function mixCtpColor(
    colorVar: string,
    weight: number,
    towards: "black" | "white" = "black",
): string {
    return `color-mix(in srgb, var(--color-ctp-${colorVar}) ${weight}%, ${towards})`;
}
