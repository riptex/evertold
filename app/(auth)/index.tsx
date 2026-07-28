import { Link } from "expo-router";
import { StyleSheet, View } from "react-native";

import { Body, Heading } from "@/components/ui";
import { colors, spacing } from "@/lib/theme";

/**
 * Stub sign-in screen. Real auth (email/phone/Apple/Google) is a later
 * task — this exists so the (auth) navigator has a landing screen and the
 * other two role navigators are reachable during development.
 */
export default function SignIn() {
  return (
    <View style={styles.container}>
      <Heading>Evertold</Heading>
      <Body color="textSecondary">Sign-in coming soon</Body>

      <Link href="/(organizer)" style={styles.link}>
        Dev: enter Organizer mode
      </Link>
      <Link href="/(storyteller)" style={styles.link}>
        Dev: enter Storyteller mode
      </Link>
      {__DEV__ && (
        <Link href="/dev/components" style={styles.link}>
          Dev: view components
        </Link>
      )}
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
  link: {
    // textPrimary rather than accent — accent at this (normal, non-bold)
    // text size is AAA-large but not AAA-normal (see lib/theme.ts).
    // textPrimary clears AAA-normal at any size, and these are plain
    // links, not the large/bold-label buttons where accent is fine.
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
});
