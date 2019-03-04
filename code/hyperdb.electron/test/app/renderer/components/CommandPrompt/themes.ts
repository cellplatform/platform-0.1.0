import { ICommandPromptTheme } from './types';
import {color, COLORS } from '../../common';

const DARK: ICommandPromptTheme = {
  prefixColor: COLORS.CLI.MAGENTA,
  color: color.format(0.9),
  placeholderColor: color.format(0.2)
};

export const THEMES = { DARK };
