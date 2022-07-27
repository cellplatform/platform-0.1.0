/**
 * Ramda
 */
import { clamp, clone, equals, merge, mergeDeepRight, uniq } from 'ramda';
export const R = { equals, uniq, clamp, mergeDeepRight, clone, merge };

/**
 * @platform
 */
export { rx } from '@platform/util.value';
export { log } from '@platform/log/lib/client';
export { css, color, Color, CssValue, formatColor, Style } from '@platform/css';

export {
  Mouse,
  MeasureSize,
  useResizeObserver,
  useEventListener,
  drag,
  copyToClipboard,
  FC,
} from '@platform/react';
export { defaultValue, time, slug, deleteUndefined, value } from '@platform/util.value';
export { HttpClient } from '@platform/cell.client';
export { ObjectView } from '@platform/ui.object';

/**
 * @system
 */
export { WebRuntime } from 'sys.runtime.web';
export { Json } from 'sys.data.json';
