import { StyleSheet, View, type ViewProps } from "react-native";

import { useScale, type Scale } from "@/components/ui/ScaleContext";
import { colors, spacing } from "@/lib/theme";

type Props = ViewProps & {
  scale?: Scale;
};

/**
 * Surface for story feed items and prompt cards. No text scale logic of
 * its own — children provide their own Heading/Body/Caption. `scale`
 * only affects padding (more breathing room in Storyteller/xl mode, to
 * match the larger touch targets and type around it).
 */
export function Card({ scale, style, children, ...rest }: Props) {
  const resolvedScale = useScale(scale);

  return (
    <View
      {...rest}
      style={[
        styles.base,
        resolvedScale === "xl" ? styles.paddingXL : styles.paddingStandard,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.backgroundElevated,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  paddingStandard: {
    padding: spacing.md,
  },
  paddingXL: {
    padding: spacing.lg,
  },
});
