import * as t from '../types';
import renderer from '../../../src/renderer';

export { t, renderer };
export { css, GlamorValue, color, events } from '@platform/react';
export { value, time } from '@platform/util.value';

export * from '../../../src/common';
export * from '../images';

export const COLORS = {
  DARK: '#293042', // Black with a slight blue tinge.
  CLI: {
    WHITE: '#fff',
    BLUE: '#477AF7',
    YELLOW: '#FBC72F',
    MAGENTA: '#FE0064',
    CYAN: '#67D9EF',
    LIME: '#A6E130',
    DARK_RED: '#CB352F',
    PURPLE: '#8F2298',
  },
};
