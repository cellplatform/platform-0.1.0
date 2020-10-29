export { log } from '@platform/log/lib/client';

export { css, color, CssValue, formatColor } from '@platform/css';

import { WebRuntime } from '@platform/cell.compiler/lib/runtime.web';
export { WebRuntime };
export const bundle = WebRuntime.bundle;
