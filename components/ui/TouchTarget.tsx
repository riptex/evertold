import { type ReactNode } from "react";
import { View } from "react-native";

import { useScale, type Scale } from "@/components/ui/ScaleContext";
import { touchTargetStandard, touchTargetXL } from "@/lib/theme";

type Props = {
  scale?: Scale;
  children: ReactNode;
};

/**
 * Enforces the minimum tappable size for whatever's inside it — wrap any
 * custom interactive element that isn't already going through Button.
 * 60pt+ in Storyteller/xl mode (PLAN.md §3.1), platform HIG minimum
 * (44pt) otherwise. Sizing only — doesn't add its own touch handling;
 * the child (typically a Pressable) still owns that.
 */
export function TouchTarget({ scale, children }: Props) {
  const resolvedScale = useScale(scale);
  const minSize = resolvedScale === "xl" ? touchTargetXL : touchTargetStandard;

  return (
    <View
      style={{
        minWidth: minSize,
        minHeight: minSize,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </View>
  );
}
