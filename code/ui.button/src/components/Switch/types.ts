export type SwitchThemeName = 'LIGHT' | 'DARK';

export type ISwitchTheme = {
  trackColor: { on: number | string; off: number | string };
};

export type ISwitchTrack = {
  heightOffset: number;
  color: { on: number | string; off: number | string };
  borderRadius: number;
  borderWidth: { on?: number; off?: number };
};
