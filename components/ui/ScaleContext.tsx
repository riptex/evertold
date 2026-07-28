import { createContext, useContext, type ReactNode } from "react";

export type Scale = "standard" | "xl";

const ScaleContext = createContext<Scale>("standard");

/**
 * Sets the default scale for every design-system primitive underneath it
 * in the tree — set once per navigator, not per screen. The
 * (storyteller) root layout wraps its Stack in `<ScaleProvider scale="xl">`;
 * (organizer) and (auth) don't need one, since "standard" is the default.
 *
 * Every primitive also accepts an explicit `scale` prop that overrides
 * this context, for the rare case a screen needs to mix scales (there
 * isn't one yet — Storyteller mode is XL end-to-end, everything else is
 * standard end-to-end, per CLAUDE.md's "never share screens" rule).
 */
export function ScaleProvider({
  scale,
  children,
}: {
  scale: Scale;
  children: ReactNode;
}) {
  return (
    <ScaleContext.Provider value={scale}>{children}</ScaleContext.Provider>
  );
}

export function useScale(explicit?: Scale): Scale {
  const contextScale = useContext(ScaleContext);
  return explicit ?? contextScale;
}
