import { clone, uniq, flatten } from 'ramda';
export const R = { clone, uniq, flatten };

/**
 * @platform
 */
export { HttpClient } from '@platform/cell.client';
export { Hash, Uri, Schema, ManifestHash, ManifestFiles, Mime } from '@platform/cell.schema';
export { css, color, CssValue, formatColor, style as Style } from '@platform/css';
export { WebRuntime } from '@platform/cell.runtime.web';
export { useResizeObserver } from '@platform/react';
export { rx, slug, cuid, time, deleteUndefined, value } from '@platform/util.value';
export { Filesystem, Stream } from '@platform/cell.fs.bus/lib/web';
export { Path, PathUri } from '@platform/cell.fs';

/**
 * @system
 */
export { IpcBus } from 'sys.runtime.electron';
export { useDragTarget } from 'sys.ui.primitives/lib/hooks/DragTarget';
export { PropList, PropListItem } from 'sys.ui.primitives/lib/ui/PropList';
