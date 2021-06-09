import minimist from 'minimist';
export { minimist };

import * as t from './types';
import { fs } from '@platform/fs';
export { t, fs };

export { cli } from '@platform/cli';
export { log } from '@platform/log/lib/server';
export { defaultValue, time } from '@platform/util.value';
export { http } from '@platform/http';

export * from './COMMANDS';

export { Config } from '../node/server/config';

export { PKG } from '../node/common/constants';

export const PATH = {
  CONFIG_DIR: fs.resolve('config'),
};
