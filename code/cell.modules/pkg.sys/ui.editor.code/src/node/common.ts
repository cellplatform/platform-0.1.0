import * as t from '../common/types';

import { fs } from '@platform/fs';
import { log } from '@platform/log/lib/server';
import { constants } from '../common';

export { t, fs, log };
export { hash } from '@platform/cell.schema';

export const PATH = {
  ...constants.PATH,
  NODE_MODULES: fs.resolve('../../../../node_modules'),
};
