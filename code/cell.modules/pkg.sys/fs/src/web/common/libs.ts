import { clone, uniq, flatten } from 'ramda';
export const R = { clone, uniq, flatten };

/**
 * @platform
 */
export { HttpClient } from '@platform/cell.client';
export { Hash, Uri, Schema } from '@platform/cell.schema';
export { css, color, CssValue, formatColor } from '@platform/css';
export { WebRuntime, bundle } from '@platform/cell.runtime.web';
export { useResizeObserver } from '@platform/react';
export { rx, slug, cuid, time } from '@platform/util.value';
export { Filesystem, Stream } from '@platform/cell.fs.bus/lib/web';
export { Path, PathUri } from '@platform/cell.fs';

/**
 * @system Runtime
 */
export { IpcBus } from 'sys.runtime.electron';
export { useDragTarget } from 'sys.ui.primitives/lib/hooks/useDragTarget';
