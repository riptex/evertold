import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { colors, spacing, typeScale } from "@/lib/theme";

/**
 * Stub sign-in screen. Real auth (email/phone/Apple/Google) is a later
 * task — this exists so the (auth) navigator has a landing screen and the
 * other two role navigators are reachable during development.
 */
export default function SignIn() {
  return (
    <View style={styles.container}>
      <Text style={[typeScale.heading, styles.text]}>Evertold</Text>
      <Text style={[typeScale.body, styles.text, styles.subtitle]}>
        Sign-in coming soon
      </Text>

      <Link href="/(organizer)" style={[typeScale.body, styles.link]}>
        Dev: enter Organizer mode
      </Link>
      <Link href="/(storyteller)" style={[typeScale.body, styles.link]}>
        Dev: enter Storyteller mode
      </Link>
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
    gap: spacing.md,
  },
  text: {
    color: colors.textPrimary,
  },
  subtitle: {
    color: colors.textSecondary,
  },
  link: {
    color: colors.accent,
    marginTop: spacing.sm,
  },
});
