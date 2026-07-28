import { StyleSheet, Text, View } from "react-native";

import { colors, spacing, typeScale } from "@/lib/theme";
import type { Database } from "@/lib/supabase/types";

// Type-only placeholder proving the generated Supabase types compile and
// integrate with real screen code. No live client call here yet — that
// needs a real Supabase project (external-account setup, same category
// as the Expo/EAS accounts flagged in docs/tasks/04-ci-eas.md), which
// doesn't exist yet. The circle-list fetch that actually uses this type
// lands with the real screen.
type Circle = Database["public"]["Tables"]["circles"]["Row"];
const placeholderCircles: Circle[] = [];

/**
 * Stub. Real screen is the circle list / family feed entry point
 * (PLAN.md §3.1 "Private circle feed").
 */
export default function OrganizerHome() {
  return (
    <View style={styles.container}>
      <Text style={[typeScale.heading, styles.text]}>Your circles</Text>
      <Text style={[typeScale.body, styles.text, styles.subtitle]}>
        Circle list coming soon ({placeholderCircles.length} circles)
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
