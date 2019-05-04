type Spacing = string | number | Array<string | number | null>;

export type IButtonTheme = {
  enabledColor: string;
  disabledColor: string;
  disabledOpacity: number;
  border: IButtonThemeBorder;
};

export type IButtonThemeBorder = {
  isVisible: boolean;
  thickness: number;
  color: number | string;
  radius: number;
  padding: Spacing;
};
