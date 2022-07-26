import { clamp, mergeDeepRight } from 'ramda';
export const R = { clamp, mergeDeepRight };

/**
 * @platform
 */
export { log } from '@platform/log/lib/client';
export { css, Color, CssValue, formatColor, Style } from '@platform/css';
export { defaultValue, deleteUndefined, slug, cuid, rx, time, value } from '@platform/util.value';
export { Schema } from '@platform/cell.schema';
export { HttpClient } from '@platform/cell.client';
export { FC } from '@platform/react';

/**
 * @system
 */
export { MinSize } from 'sys.ui.primitives/lib/ui/MinSize';
export { Filesystem } from 'sys.fs/lib/web/ui';
