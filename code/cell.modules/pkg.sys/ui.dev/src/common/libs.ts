import { equals, clone, clamp } from 'ramda';
export const R = { equals, clone, clamp };

import { css, color, CssValue, style } from '@platform/css';
export { css, color, CssValue, style };
export const formatColor = color.format;

export { rx, time, defaultValue, id, dispose } from '@platform/util.value';
export { StateObject } from '@platform/state';

import { Builder } from '@platform/cell.module';
export { Builder };
export const format = Builder.format;
