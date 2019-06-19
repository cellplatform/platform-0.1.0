import * as t from '../../common/types';

export type SwitchThemeName = 'LIGHT' | 'DARK';

export type ISwitchTheme = {
  trackColor: { on: number | string; off: number | string; disabled: number | string };
  thumbColor: { on: number | string; off: number | string; disabled: number | string };
  shadowColor: number | string;
  disabledOpacity: number;
};

export type ISwitchTrack = {
  widthOffset: number;
  heightOffset: number;
  color: { on: number | string; off: number | string; disabled: number | string };
  borderRadius: number;
  borderWidth: { on?: number; off?: number };
};

export type ISwitchThumb = {
  width: number;
  height: number;
  xOffset: number;
  yOffset: number;
  borderRadius: number;
  color: { on: number | string; off: number | string; disabled: number | string };
  shadow: t.IShadow;
};
