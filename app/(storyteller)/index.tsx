import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, spacing, touchTargetXL, typeScaleXL } from "@/lib/theme";

/**
 * Stub for the giant record button screen. Recording itself (expo-av,
 * offline queue) is task 11 — this proves out the extra-large type scale
 * and touch-target sizing end to end, in the real navigator, from the
 * first commit.
 */
export default function StorytellerHome() {
  return (
    <View style={styles.container}>
      <Text style={[typeScaleXL.subheading, styles.text]}>
        Ready when you are
      </Text>

      <Pressable style={styles.recordButton}>
        <Text style={[typeScaleXL.heading, styles.recordButtonText]}>
          Record
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.xl,
  },
  text: {
    color: colors.textPrimary,
    textAlign: "center",
  },
  recordButton: {
    minWidth: touchTargetXL * 3,
    minHeight: touchTargetXL * 2,
    borderRadius: touchTargetXL,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  recordButtonText: {
    color: colors.background,
  },
});
