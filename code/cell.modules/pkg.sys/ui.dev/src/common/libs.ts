import { equals, clone, clamp, uniq } from 'ramda';
export const R = { equals, clone, clamp, uniq };

import jpath from 'jsonpath';
export { jpath };

/**
 * @platform
 */
export { Runtime } from '@platform/cell.runtime';

export { css, color, Color, CssValue, style } from '@platform/css';
export { rx, time, is, asArray, slug, value, deleteUndefined, Dispose } from '@platform/util.value';
export { HttpClient, Uri } from '@platform/cell.client';
export { log } from '@platform/log/lib/client';
export { useClickOutside, FC } from '@platform/react';

import { StateObject } from '@platform/state';
export { StateObject };
export const toObject = StateObject.toObject;

/**
 * @system
 */
export { Markdown } from 'sys.data.markdown';
