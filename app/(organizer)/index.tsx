import { StyleSheet, Text, View } from "react-native";

import { colors, spacing, typeScale } from "@/lib/theme";

/**
 * Stub. Real screen is the circle list / family feed entry point
 * (PLAN.md §3.1 "Private circle feed").
 */
export default function OrganizerHome() {
  return (
    <View style={styles.container}>
      <Text style={[typeScale.heading, styles.text]}>Your circles</Text>
      <Text style={[typeScale.body, styles.text, styles.subtitle]}>
        Circle list coming soon
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    gap: spacing.sm,
  },
  text: {
    color: colors.textPrimary,
  },
  subtitle: {
    color: colors.textSecondary,
  },
});
