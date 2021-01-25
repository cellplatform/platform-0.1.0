import { equals, clone, clamp } from 'ramda';
export const R = { equals, clone, clamp };

import { css, color, CssValue, style } from '@platform/css';
export { css, color, CssValue, style };
export const formatColor = color.format;

import { id } from '@platform/util.value';
export { rx, time, defaultValue, dispose } from '@platform/util.value';
export const slug = id.shortid;

import { Builder } from '@platform/cell.module';
export { Builder };
export const format = Builder.format;

import { StateObject } from '@platform/state';
export { StateObject };
export const toObject = StateObject.toObject;
