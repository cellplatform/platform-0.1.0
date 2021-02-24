export { log } from '@platform/log/lib/client';
export { css, color, CssValue, formatColor } from '@platform/css';
export { WebRuntime, bundle } from '@platform/cell.runtime.web';
export { useResizeObserver, events, drag } from '@platform/react';
export { defaultValue, time, cuid, slug, rx } from '@platform/util.value';
export { http } from '@platform/http';
export { StateObject } from '@platform/state';

import PeerJS from 'peerjs';
export { PeerJS };

import { equals } from 'ramda';
export const R = { equals };
