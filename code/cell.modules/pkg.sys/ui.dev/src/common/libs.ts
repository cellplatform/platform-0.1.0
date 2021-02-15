import { equals, clone, clamp, uniq } from 'ramda';
export const R = { equals, clone, clamp, uniq };

import { css, color, CssValue, style } from '@platform/css';
export { css, color, CssValue, style };
export const formatColor = color.format;

export { rx, time, defaultValue, dispose, is, asArray, slug } from '@platform/util.value';

import { StateObject } from '@platform/state';
export { StateObject };
export const toObject = StateObject.toObject;

export { Markdown } from '@platform/util.markdown';

export { HttpClient, Uri } from '@platform/cell.client';
import { Builder } from '@platform/cell.module';
export { Builder };
export const format = Builder.format;
