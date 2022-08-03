import { equals, clone, clamp, uniq } from 'ramda';
export const R = { equals, clone, clamp, uniq };

import * as jpath from 'jsonpath';
export { jpath };

/**
 * @platform
 */
export { Runtime } from '@platform/cell.runtime';

export { css, color, Color, CssValue, style } from '@platform/css';

export { rx, time, is, asArray, slug, value, deleteUndefined } from '@platform/util.value';
export { dispose } from '@platform/util.value/lib/dispose';

import { StateObject } from '@platform/state';
export { StateObject };
export const toObject = StateObject.toObject;

export { Markdown } from '@platform/util.markdown';

export { HttpClient, Uri } from '@platform/cell.client';

export { log } from '@platform/log/lib/client';
export { useClickOutside } from '@platform/react/lib/hooks';
