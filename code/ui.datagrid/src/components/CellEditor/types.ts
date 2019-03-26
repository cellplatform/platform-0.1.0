export type IShadow = {
  blur: number;
  color: string | number;
};

export type ICellEditorTheme = {
  borderColor: string | number;
  titleBackground: string | number;
  titleColor: string | number;
  inputBackground: string | number;
  inputShadow: IShadow;
};
