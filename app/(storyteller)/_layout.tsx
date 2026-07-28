import { Stack } from "expo-router";

import { ScaleProvider } from "@/components/ui";

/**
 * Storyteller root navigator. Deliberately a bare Stack with headers off —
 * no tab bar, no settings entry point, no navigation chrome of any kind.
 * PLAN.md §5: "Storyteller mode = separate root navigator: giant record
 * button, prompt card, playback. No tabs, no settings."
 *
 * Do not add a tab bar, header, or drawer here. If a future task needs
 * navigation within Storyteller mode (e.g. prompt card → playback), it
 * should be plain Stack pushes, never chrome the elder has to parse.
 *
 * ScaleProvider here is what makes every design-system primitive default
 * to the extra-large scale throughout this whole navigator, without each
 * screen having to pass scale="xl" itself.
 */
export default function StorytellerLayout() {
  return (
    <ScaleProvider scale="xl">
      <Stack screenOptions={{ headerShown: false }} />
    </ScaleProvider>
  );
}
