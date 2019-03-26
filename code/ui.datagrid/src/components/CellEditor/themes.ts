import { COLORS, color } from '../../common';
import { ICellEditorTheme } from './types';

const DEFAULT: ICellEditorTheme = {
  borderColor: COLORS.BLUE,
  titleBackground: COLORS.BLUE,
  titleColor: COLORS.WHITE,
  inputBackground: COLORS.WHITE,
  inputShadow:{color:-0.2, blur:8}
};

export const THEMES = { DEFAULT };
