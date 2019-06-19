export type SwitchThemeName = 'LIGHT' | 'DARK';

export type ISwitchTheme = {
  track: {
    color: { on: number | string; off: number | string };
  };
};

export type ISwitchTrack = {
  heightOffset: number;
  borderRadius: number;
  color: { on: number | string; off: number | string };
};
