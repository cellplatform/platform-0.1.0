export { log } from '@platform/log/lib/client';
export { css, color, CssValue, formatColor } from '@platform/css';
export { WebRuntime, bundle } from '@platform/cell.runtime.web';
export { useResizeObserver, events, drag, copyToClipboard } from '@platform/react';
export { defaultValue, time, cuid, slug, rx, value, deleteUndefined } from '@platform/util.value';
export { http } from '@platform/http';
export { StateObject } from '@platform/state';
export { QueryString } from '@platform/util.string/lib/QueryString';

import { equals, mergeDeepRight, uniq, clamp } from 'ramda';
export const R = { equals, mergeDeepRight, uniq, clamp };
