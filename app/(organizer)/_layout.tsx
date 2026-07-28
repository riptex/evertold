import { Stack } from "expo-router";

import { colors } from "@/lib/theme";

/**
 * Organizer/Member root navigator — standard type scale. Tab bar and full
 * navigation chrome (circles, invites, settings — PLAN.md §3.1) land in a
 * later task; this is the stub shell.
 */
export default function OrganizerLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.backgroundElevated },
        headerTintColor: colors.textPrimary,
      }}
    />
  );
}
