import * as t from '../../common/types';

export type IButtonTheme = {
  color: { enabled: number | string; disabled?: number | string };
  backgroundColor: { enabled?: number | string; disabled?: number | string };
  disabledOpacity: number;
  border: IButtonThemeBorder;
};

export type IButtonThemeBorder = {
  isVisible: boolean;
  thickness: number;
  radius: number;
  padding: t.Spacing;
  color: number | string;
};
