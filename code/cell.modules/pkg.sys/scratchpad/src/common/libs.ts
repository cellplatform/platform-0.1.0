export { log } from '@platform/log/lib/client';
export { css, color, CssValue, formatColor } from '@platform/css';
export { WebRuntime, bundle } from '@platform/cell.runtime.web';
export { useResizeObserver, events, drag, copyToClipboard } from '@platform/react';
export { defaultValue, time, cuid, slug, rx, value, deleteUndefined } from '@platform/util.value';
export { http } from '@platform/http';
export { StateObject } from '@platform/state';
export { queryString } from '@platform/util.string/lib/queryString';

import PeerJS from 'peerjs';
export { PeerJS };

import { equals, mergeDeepRight, uniq, clamp } from 'ramda';
export const R = { equals, mergeDeepRight, uniq, clamp };
