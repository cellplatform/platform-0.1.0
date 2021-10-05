export { expect } from '@platform/test';

export * from '../web/common';
import { fs as nodefs } from '@platform/fs';
export { nodefs };

import { rx, t } from '../web/common';

/**
 * System
 */
import { Filesystem } from 'sys.fs/lib/node';

/**
 * OS Components.
 */
const bus = rx.bus();
const store = Filesystem.Controller({ bus, fs: nodefs.resolve('tmp/test') });
const fs = store.fs();
export const TestOS = {
  bus,
  fs,
};
