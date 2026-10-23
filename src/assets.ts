type AssetEntry = { path: string; alt: string };
type AudioEntry = { path: string };

export const ASSETS: {
  portraits: Record<string, AssetEntry>;
  backgrounds: Record<string, AssetEntry>;
  audio: Record<string, AudioEntry>;
  ui: Record<string, { path: string }>;
} = {
  portraits: {},
  backgrounds: {},
  audio: {},
  ui: {},
};
