import { mergeDeepRight } from 'ramda';
export const R = { mergeDeepRight };

/**
 * @platform
 */
export { log } from '@platform/log/lib/client';
export { css, Color, CssValue, Style, formatColor } from '@platform/css';
export { useResizeObserver, FC } from '@platform/react';
export { rx, slug } from '@platform/util.value';

/**
 * @system
 */
export { Filesystem } from 'sys.fs';
export { WebRuntime } from 'sys.runtime.web';
export { PropList } from 'sys.ui.primitives/lib/ui/PropList';
export { MinSize } from 'sys.ui.primitives/lib/ui/MinSize';
