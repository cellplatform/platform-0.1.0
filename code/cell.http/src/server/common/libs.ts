import { uniq } from 'ramda';
export const R = { uniq };

export { micro } from '@platform/micro';
export { log } from '@platform/log/lib/server';
export { fs } from '@platform/fs';
export { http } from '@platform/http';
export { value, id } from '@platform/util.value';

import * as cell from './libs.cell';
export { cell };
export const models = cell.models;
