import { css, color, CssValue } from '@platform/css';
export { css, color, CssValue };
export const formatColor = color.format;

import { equals, clone } from 'ramda';
export const R = { equals, clone };

export { rx, time, defaultValue, id, dispose } from '@platform/util.value';
export { StateObject } from '@platform/state';
export { Builder } from '@platform/cell.module';
