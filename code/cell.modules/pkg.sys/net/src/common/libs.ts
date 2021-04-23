/**
 * External
 */
import { uniq, equals } from 'ramda';
export const R = { uniq, equals };

import PeerJS from 'peerjs';
export { PeerJS };

/**
 * Platform
 */
export { events } from '@platform/react';
export { log } from '@platform/log/lib/client';
export { css, color, CssValue, formatColor, style } from '@platform/css';
export { WebRuntime, bundle } from '@platform/cell.runtime.web';
export { useResizeObserver } from '@platform/react';
export { rx, defaultValue, cuid, time, deleteUndefined, asArray, slug } from '@platform/util.value';
export { StateObject } from '@platform/state';
