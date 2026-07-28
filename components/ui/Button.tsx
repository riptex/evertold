import {
  Pressable,
  StyleSheet,
  Text,
  type GestureResponderEvent,
} from "react-native";

import { useScale, type Scale } from "@/components/ui/ScaleContext";
import { TouchTarget } from "@/components/ui/TouchTarget";
import { colors, spacing, typeScale, typeScaleXL } from "@/lib/theme";

type Props = {
  label: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: "primary" | "secondary";
  scale?: Scale;
  disabled?: boolean;
  /** Defaults to `label` — override for a more descriptive screen-reader
   * announcement than the visible text alone conveys. */
  accessibilityLabel?: string;
  accessibilityHint?: string;
};

/**
 * "primary" (filled accent) is AAA-safe (lib/contrast.test.ts) only
 * because its label is always large-text-qualifying — see the size
 * chosen per scale below. Do not add a smaller label size to this
 * variant without re-verifying against lib/contrast.test.ts.
 *
 * "secondary" (outline) uses textPrimary-on-backgroundElevated, which
 * clears normal-text AAA (~16:1) at any size — no such constraint.
 */
export function Button({
  label,
  onPress,
  variant = "primary",
  scale,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
}: Props) {
  const resolvedScale = useScale(scale);
  const isXL = resolvedScale === "xl";

  const labelStyle =
    variant === "primary"
      ? isXL
        ? { ...typeScaleXL.heading, color: colors.background }
        : {
            ...typeScale.subheading,
            color: colors.background,
            fontWeight: "700" as const,
          }
      : isXL
        ? { ...typeScaleXL.body, color: colors.textPrimary }
        : { ...typeScale.body, color: colors.textPrimary };

  return (
    <TouchTarget scale={resolvedScale}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled }}
        style={({ pressed }) => [
          styles.base,
          isXL ? styles.paddingXL : styles.paddingStandard,
          variant === "primary" ? styles.primary : styles.secondary,
          disabled && styles.disabled,
          pressed && !disabled && styles.pressed,
        ]}
      >
        <Text style={labelStyle}>{label}</Text>
      </Pressable>
    </TouchTarget>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  paddingStandard: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  paddingXL: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  primary: {
    backgroundColor: colors.accent,
  },
  secondary: {
    backgroundColor: colors.backgroundElevated,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.4,
  },
});
