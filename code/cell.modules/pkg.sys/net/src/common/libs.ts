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
export { css, color, CssValue, formatColor, Style } from '@platform/css';
export { useResizeObserver } from '@platform/react';
export { rx, defaultValue, cuid, time, deleteUndefined, asArray, slug } from '@platform/util.value';
export { StateObject } from '@platform/state';
export { Hash } from '@platform/cell.schema';
export { NetworkBus } from '@platform/cell.runtime/lib/NetworkBus';
export { TextInput } from '@platform/ui.text/lib/components/TextInput';

/**
 * @system
 */
export { Filesystem } from 'sys.fs';
export { WebRuntime } from 'sys.runtime.web';
export { Hr } from 'sys.ui.primitives/lib/ui/Hr';
export { Button, ButtonProps } from 'sys.ui.primitives/lib/ui.ref/button/Button';
export { PropList, PropListItem } from 'sys.ui.primitives/lib/ui/PropList';
export { Card } from 'sys.ui.primitives/lib/ui/Card';
export { BulletList } from 'sys.ui.primitives/lib/ui/BulletList';
export { Text } from 'sys.ui.primitives/lib/ui/Text';

export {
  EventStack,
  useEventBusHistory,
  EventBusHistory,
} from 'sys.ui.primitives/lib/ui/Event.Stack';
export { EventPipe } from 'sys.ui.primitives/lib/ui/Event.Pipe';

/**
 * TODO 🐷
 * - do not get from Textbox
 */
export { Textbox } from 'sys.ui.dev/lib/web.ui/Textbox';
