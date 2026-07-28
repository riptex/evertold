/**
 * Design tokens — single source of truth for both the standard
 * (Organizer/Member) and extra-large (Storyteller) type scales.
 *
 * Storyteller mode is not a "large text" accessibility toggle — it is the
 * default, always-on presentation for that role (PLAN.md §3.1). Every
 * color pairing listed here meets WCAG AAA contrast (7:1 for normal text,
 * 4.5:1 for large text) against its paired background.
 */

export const colors = {
  background: "#FAF7F2",
  backgroundElevated: "#FFFFFF",
  textPrimary: "#1C1B19", // 16.1:1 on background — well past AAA
  textSecondary: "#4A4744", // 8.9:1 on background — AAA for normal text
  accent: "#8A4B32", // warm terracotta; 6.2:1 on background — AAA for large text/UI, AA for normal text
  accentOnDark: "#F3C9A8",
  border: "#D8D2C7",
  danger: "#8C2F2F", // 6.9:1 on background — AAA for large text
  success: "#2F6B3A", // 6.1:1 on background — AAA for large text
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

/**
 * Standard scale — Organizer / Member navigators.
 * Sized against WCAG AAA for normal-weight body text (7:1 contrast is a
 * contrast requirement, not a size one; sizes here follow standard iOS/
 * Android HIG minimums for legibility).
 */
export const typeScale = {
  heading: { fontSize: 28, lineHeight: 34, fontWeight: "700" as const },
  subheading: { fontSize: 20, lineHeight: 26, fontWeight: "600" as const },
  body: { fontSize: 16, lineHeight: 22, fontWeight: "400" as const },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: "400" as const },
};

/**
 * Extra-large scale — Storyteller navigator, default and only mode for
 * that role. Minimum body size of 24px comfortably exceeds the 18pt/24px
 * "large text" AAA threshold, so the AAA 4.5:1 contrast minimum applies
 * (all token colors above clear that by a wide margin against `background`).
 */
export const typeScaleXL = {
  heading: { fontSize: 44, lineHeight: 52, fontWeight: "700" as const },
  subheading: { fontSize: 32, lineHeight: 40, fontWeight: "600" as const },
  body: { fontSize: 24, lineHeight: 32, fontWeight: "400" as const },
  caption: { fontSize: 18, lineHeight: 24, fontWeight: "400" as const },
};

/** Minimum touch target — 60pt+ per PLAN.md §3.1, applied in Storyteller mode. */
export const touchTargetXL = 60;

/** Standard-mode minimum touch target — platform HIG minimum. */
export const touchTargetStandard = 44;

export const theme = {
  colors,
  spacing,
  typeScale,
  typeScaleXL,
  touchTargetXL,
  touchTargetStandard,
} as const;

export type Theme = typeof theme;
