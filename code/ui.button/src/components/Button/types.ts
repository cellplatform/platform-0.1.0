type Spacing = string | number | Array<string | number | null>;

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
  padding: Spacing;
  color: number | string;
};
