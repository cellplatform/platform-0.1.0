/**
 * External
 */
import { uniq, equals, uniqBy, groupBy } from 'ramda';
export const R = { uniq, equals, uniqBy, groupBy };

import filesize from 'filesize';
export { filesize };

import * as PeerJS from './libs.peerjs';
export { PeerJS };

import UAParser from 'ua-parser-js';
export { UAParser };

/**
 * @platform
 */
export { events, FC } from '@platform/react';
export { log } from '@platform/log/lib/client';
export { css, color, Color, CssValue, formatColor, Style } from '@platform/css';
export { useResizeObserver } from '@platform/react';
export { rx, defaultValue, cuid, time, deleteUndefined, asArray, slug } from '@platform/util.value';
export { StateObject } from '@platform/state';
export { Hash } from '@platform/cell.schema';
export { NetworkBus } from '@platform/cell.runtime/lib/NetworkBus';
export { Is } from '@platform/util.is';

/**
 * @system
 */
export { Filesystem } from 'sys.fs';
export { WebRuntime } from 'sys.runtime.web.ui';
export { Fullscreen } from 'sys.ui.primitives/lib/ui/Fullscreen';
export { Event } from 'sys.ui.primitives/lib/ui/Event';
