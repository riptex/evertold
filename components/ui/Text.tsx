import { Text as RNText, type TextProps as RNTextProps } from "react-native";

import { useScale, type Scale } from "@/components/ui/ScaleContext";
import { colors, typeScale, typeScaleXL } from "@/lib/theme";

type ThemeColorKey = keyof typeof colors;

type Props = Omit<RNTextProps, "style"> & {
  scale?: Scale;
  /** Constrained to theme color keys — never pass a raw hex/rgb here. */
  color?: ThemeColorKey;
  style?: RNTextProps["style"];
};

/**
 * All four variants read font size/weight/line-height from lib/theme.ts
 * only — never hardcode a pixel size in a screen. Pick the variant name
 * that matches semantic role (Heading for screen titles, not "big Body").
 */
function makeVariant(
  variantKey: "heading" | "subheading" | "body" | "caption",
) {
  return function Variant({
    scale,
    color = "textPrimary",
    style,
    ...rest
  }: Props) {
    const resolvedScale = useScale(scale);
    const variant = (resolvedScale === "xl" ? typeScaleXL : typeScale)[
      variantKey
    ];
    return (
      <RNText
        {...rest}
        style={[
          {
            fontSize: variant.fontSize,
            lineHeight: variant.lineHeight,
            fontWeight: variant.fontWeight,
            color: colors[color],
          },
          style,
        ]}
      />
    );
  };
}

export const Heading = makeVariant("heading");
export const Subheading = makeVariant("subheading");
export const Body = makeVariant("body");
export const Caption = makeVariant("caption");
