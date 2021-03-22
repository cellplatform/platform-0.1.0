export { rx } from '@platform/util.value';
export { log } from '@platform/log/lib/client';
export { css, color, CssValue, formatColor } from '@platform/css';
export { WebRuntime, bundle } from '@platform/cell.runtime.web';
export { useResizeObserver, drag, mouse } from '@platform/react';
export { defaultValue, time } from '@platform/util.value';

import { equals, uniq } from 'ramda';
export const R = { equals, uniq };
