import { type ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import {
  Body,
  Button,
  Card,
  Caption,
  Heading,
  ScaleProvider,
  Subheading,
} from "@/components/ui";
import { colors, spacing } from "@/lib/theme";

/**
 * Dev-only component preview — every primitive rendered in both scales
 * so a scale/contrast regression is visible without a manual
 * accessibility audit. NOT excluded from the production bundle by path
 * (a leading-underscore folder, e.g. app/_dev/, is excluded from Expo
 * Router's routing entirely — including in dev — so that's not usable
 * for a screen meant to be reachable). Excluded by behavior instead: it
 * renders nothing outside a dev build.
 */
export default function ComponentPreview() {
  if (!__DEV__) {
    return null;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Heading>Component preview</Heading>
      <Caption>Dev-only — not part of any real navigator.</Caption>

      <Section title="Standard scale">
        <ScaleProvider scale="standard">
          <PreviewContent />
        </ScaleProvider>
      </Section>

      <Section title="Extra-large scale (Storyteller)">
        <ScaleProvider scale="xl">
          <PreviewContent />
        </ScaleProvider>
      </Section>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Subheading>{title}</Subheading>
      {children}
    </View>
  );
}

function PreviewContent() {
  return (
    <View style={styles.stack}>
      <Heading>Heading</Heading>
      <Subheading>Subheading</Subheading>
      <Body>
        Body text — this is what a story transcript preview or prompt card
        description looks like.
      </Body>
      <Caption>Caption — timestamps, durations, metadata.</Caption>

      <Button label="Primary button" onPress={() => {}} variant="primary" />
      <Button label="Secondary button" onPress={() => {}} variant="secondary" />
      <Button label="Disabled" onPress={() => {}} disabled />

      <Card>
        <Subheading>Card title</Subheading>
        <Body>Card content — story feed items and prompt cards use this.</Body>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  section: {
    gap: spacing.md,
  },
  stack: {
    gap: spacing.md,
    alignItems: "flex-start",
  },
});
