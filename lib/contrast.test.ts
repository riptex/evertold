import { AAA_LARGE_TEXT, AAA_NORMAL_TEXT, contrastRatio } from "@/lib/contrast";
import { colors } from "@/lib/theme";

// Verifies real WCAG numbers rather than the eyeballed estimates that were
// in lib/theme.ts's comments before this test existed (see task 05 —
// several were close but not exact; textSecondary and danger in
// particular were off by a few tenths). This is the source of truth now,
// not the comments.

describe("theme color contrast (WCAG 2.1 AAA)", () => {
  it("textPrimary on background clears AAA for normal-size text (7:1)", () => {
    expect(
      contrastRatio(colors.textPrimary, colors.background),
    ).toBeGreaterThanOrEqual(AAA_NORMAL_TEXT);
  });

  it("textSecondary on background clears AAA for normal-size text (7:1)", () => {
    expect(
      contrastRatio(colors.textSecondary, colors.background),
    ).toBeGreaterThanOrEqual(AAA_NORMAL_TEXT);
  });

  // accent, danger, and success are used as UI/large-text accents (button
  // fills paired with large bold labels, status colors), never as small
  // body text — AAA-large (4.5:1) is the correct bar for how they're
  // actually used. See components/ui/Button.tsx for how the "primary"
  // variant enforces a large-text-qualifying label size specifically so
  // this pairing stays AAA-compliant regardless of scale.
  it("accent on background clears AAA for large text / UI (4.5:1)", () => {
    expect(
      contrastRatio(colors.accent, colors.background),
    ).toBeGreaterThanOrEqual(AAA_LARGE_TEXT);
  });

  it("background (as button label) on accent (as button fill) clears AAA for large text (4.5:1)", () => {
    expect(
      contrastRatio(colors.background, colors.accent),
    ).toBeGreaterThanOrEqual(AAA_LARGE_TEXT);
  });

  it("danger on background clears AAA for large text (4.5:1)", () => {
    expect(
      contrastRatio(colors.danger, colors.background),
    ).toBeGreaterThanOrEqual(AAA_LARGE_TEXT);
  });

  it("success on background clears AAA for large text (4.5:1)", () => {
    expect(
      contrastRatio(colors.success, colors.background),
    ).toBeGreaterThanOrEqual(AAA_LARGE_TEXT);
  });

  it("textPrimary on backgroundElevated (Card surface) clears AAA for normal-size text (7:1)", () => {
    expect(
      contrastRatio(colors.textPrimary, colors.backgroundElevated),
    ).toBeGreaterThanOrEqual(AAA_NORMAL_TEXT);
  });
});
