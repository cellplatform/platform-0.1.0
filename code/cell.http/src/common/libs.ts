import { uniq, mergeDeepRight, prop, sortBy, clone } from 'ramda';
export const R = { uniq, mergeDeepRight, prop, sortBy, clone };

export { micro } from '@platform/micro';
export { Router } from '@platform/http.router';
export { log } from '@platform/log/lib/server';
export { fs } from '@platform/fs';
export { http } from '@platform/http';
export { value, id, defaultValue, time } from '@platform/util.value';
export { HttpClient } from '@platform/cell.client';

import * as cell from './libs.cell';
export { cell };
export * from './libs.cell';
