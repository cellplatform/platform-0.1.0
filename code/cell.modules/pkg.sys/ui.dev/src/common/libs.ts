import { equals, clone, clamp, uniq } from 'ramda';
export const R = { equals, clone, clamp, uniq };

/**
 * @platform
 */
export { Runtime } from '@platform/cell.runtime';

export { css, color, Color, CssValue, style } from '@platform/css';

export {
  rx,
  time,
  defaultValue,
  is,
  asArray,
  slug,
  value,
  deleteUndefined,
} from '@platform/util.value';

import { StateObject } from '@platform/state';
export { StateObject };
export const toObject = StateObject.toObject;

export { Markdown } from '@platform/util.markdown';

export { HttpClient, Uri } from '@platform/cell.client';
import { Builder } from '@platform/cell.module';
export { Builder };
export const format = Builder.format;

export { log } from '@platform/log/lib/client';
export { useClickOutside } from '@platform/react/lib/hooks';
