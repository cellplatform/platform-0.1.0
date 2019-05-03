import { ICommandPromptTheme } from './types';
import { color, COLORS } from '../../common';

const DARK: ICommandPromptTheme = {
  prefixColor: COLORS.CLI.MAGENTA,
  namespaceColor: COLORS.CLI.CYAN as string,
  color: color.format(0.9) as string,
  placeholderColor: color.format(0.2) as string,
};

export const THEMES = { DARK };
