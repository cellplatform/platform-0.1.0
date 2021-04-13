export { rx } from '@platform/util.value';
export { log } from '@platform/log/lib/client';
export { css, color, CssValue, formatColor, style } from '@platform/css';
export { WebRuntime, bundle } from '@platform/cell.runtime.web';
export { useResizeObserver, drag } from '@platform/react';
export { defaultValue, time, slug, deleteUndefined } from '@platform/util.value';
export { HttpClient } from '@platform/cell.client';

import { equals, uniq } from 'ramda';
export const R = { equals, uniq };

export { ObjectView } from '@platform/ui.object';
