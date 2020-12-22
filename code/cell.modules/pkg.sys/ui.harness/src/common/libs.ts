import { css, color, CssValue } from '@platform/css';
export { css, color, CssValue };
export const formatColor = color.format;

import { equals, clone } from 'ramda';
export const R = { equals, clone };

export { rx, time, defaultValue, id, dispose } from '@platform/util.value';
export { StateObject } from '@platform/state';

import { Builder } from '@platform/cell.module';
export { Builder };
export const format = Builder.format;
