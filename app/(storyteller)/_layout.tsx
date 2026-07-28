import { Stack } from "expo-router";

/**
 * Storyteller root navigator. Deliberately a bare Stack with headers off —
 * no tab bar, no settings entry point, no navigation chrome of any kind.
 * PLAN.md §5: "Storyteller mode = separate root navigator: giant record
 * button, prompt card, playback. No tabs, no settings."
 *
 * Do not add a tab bar, header, or drawer here. If a future task needs
 * navigation within Storyteller mode (e.g. prompt card → playback), it
 * should be plain Stack pushes, never chrome the elder has to parse.
 */
export default function StorytellerLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
