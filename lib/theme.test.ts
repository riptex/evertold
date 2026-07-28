import { theme, touchTargetXL } from "@/lib/theme";

describe("theme", () => {
  it("sizes the Storyteller (extra-large) scale strictly larger than standard, at every level", () => {
    for (const key of Object.keys(
      theme.typeScale,
    ) as (keyof typeof theme.typeScale)[]) {
      expect(theme.typeScaleXL[key].fontSize).toBeGreaterThan(
        theme.typeScale[key].fontSize,
      );
    }
  });

  it("meets the 60pt+ Storyteller touch target minimum from PLAN.md §3.1", () => {
    expect(touchTargetXL).toBeGreaterThanOrEqual(60);
  });

  it("keeps the extra-large body size above the WCAG AAA 'large text' threshold (18pt / 24px)", () => {
    expect(theme.typeScaleXL.body.fontSize).toBeGreaterThanOrEqual(24);
  });
});
