/**
 * Ramda
 */
import { equals, uniq, clamp } from 'ramda';
export const R = { equals, uniq, clamp };

/**
 * @platform
 */
export { rx } from '@platform/util.value';
export { log } from '@platform/log/lib/client';
export { css, color, CssValue, formatColor, style } from '@platform/css';
export { WebRuntime, bundle } from '@platform/cell.runtime.web';
export { Mouse, useResizeObserver, useEventListener, drag, copyToClipboard } from '@platform/react';
export { defaultValue, time, slug, deleteUndefined, value } from '@platform/util.value';
export { HttpClient } from '@platform/cell.client';
export { ObjectView } from '@platform/ui.object';
