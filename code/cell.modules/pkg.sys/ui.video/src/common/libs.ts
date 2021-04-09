import { clamp, mergeDeepRight } from 'ramda';
export const R = { clamp, mergeDeepRight };

export { log } from '@platform/log/lib/client';
export { css, color, CssValue, formatColor } from '@platform/css';
export { WebRuntime, bundle } from '@platform/cell.runtime.web';
export { defaultValue, deleteUndefined, slug, cuid, rx, time } from '@platform/util.value';

export { Schema } from '@platform/cell.schema';
export { HttpClient } from '@platform/cell.client';
