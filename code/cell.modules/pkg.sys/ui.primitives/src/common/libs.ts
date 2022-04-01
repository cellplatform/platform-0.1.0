/**
 * Ramda
 */
import { equals, uniq, clamp, mergeDeepRight, clone } from 'ramda';
export const R = { equals, uniq, clamp, mergeDeepRight, clone };

/**
 * @platform
 */
export { rx } from '@platform/util.value';
export { log } from '@platform/log/lib/client';
export { css, color, CssValue, formatColor, Style } from '@platform/css';
export {
  Mouse,
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

/**
 * TODO 🐷
 * - move to [sys.json]...inline into "sys" code base.
 */
export { Patch } from '@platform/state/lib/Patch';
