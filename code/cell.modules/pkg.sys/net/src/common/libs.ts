/**
 * External
 */
import { uniq, equals } from 'ramda';
export const R = { uniq, equals };

import filesize from 'filesize';
export { filesize };

import PeerJS from 'peerjs';
export { PeerJS };

import UAParser from 'ua-parser-js';
export { UAParser };

/**
 * @platform
 */
export { events } from '@platform/react';
export { log } from '@platform/log/lib/client';
export { css, color, CssValue, formatColor, style } from '@platform/css';
export { useResizeObserver } from '@platform/react';
export { rx, defaultValue, cuid, time, deleteUndefined, asArray, slug } from '@platform/util.value';
export { StateObject } from '@platform/state';
export { Hash } from '@platform/cell.schema';
export { NetworkBus } from '@platform/cell.runtime/lib/NetworkBus';

/**
 * @system
 */
export { Filesystem } from 'sys.fs';
export { WebRuntime } from 'sys.runtime.web';
export { PropList, PropListItem } from 'sys.ui.primitives/lib/ui/PropList';
