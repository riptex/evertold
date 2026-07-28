import { StyleSheet, View } from "react-native";

import { Body, Button } from "@/components/ui";
import { colors, spacing } from "@/lib/theme";

/**
 * Stub for the giant record button screen. Recording itself (expo-av,
 * offline queue) is task 11 — this proves out the design system (task 05)
 * in the flagship Storyteller screen from the first commit: Body and
 * Button both pick up the extra-large scale automatically from the
 * ScaleProvider set in this navigator's _layout.tsx.
 */
export default function StorytellerHome() {
  return (
    <View style={styles.container}>
      <Body>Ready when you are</Body>
      <Button label="Record" onPress={() => {}} variant="primary" />
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
});
