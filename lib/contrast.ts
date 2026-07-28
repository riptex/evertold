/**
 * WCAG 2.1 relative luminance + contrast ratio, per the spec formula
 * (https://www.w3.org/TR/WCAG21/#dfn-relative-luminance). Used to verify
 * theme token pairings for real rather than eyeballing hex codes — see
 * lib/contrast.test.ts.
 */

function linearizeChannel(channel8bit: number): number {
  const c = channel8bit / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!match) {
    throw new Error(`Expected a #RRGGBB hex color, got "${hex}"`);
  }
  const value = match[1];
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
}

export function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return (
    0.2126 * linearizeChannel(r) +
    0.7152 * linearizeChannel(g) +
    0.0722 * linearizeChannel(b)
  );
}

/** Symmetric — order of the two colors doesn't matter. */
export function contrastRatio(hexA: string, hexB: string): number {
  const lA = relativeLuminance(hexA);
  const lB = relativeLuminance(hexB);
  const lighter = Math.max(lA, lB);
  const darker = Math.min(lA, lB);
  return (lighter + 0.05) / (darker + 0.05);
}

/** WCAG AAA thresholds (2.1, SC 1.4.6). "Large" = 18pt/24px normal weight
 * or 14pt/~18.7px bold. */
export const AAA_NORMAL_TEXT = 7;
export const AAA_LARGE_TEXT = 4.5;
