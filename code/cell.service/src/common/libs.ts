import { uniq, mergeDeepRight, prop, sortBy, clone } from 'ramda';
export const R = { uniq, mergeDeepRight, prop, sortBy, clone };

import { micro } from '@platform/micro';
export { micro };

import { log } from '@platform/log/lib/server';
export { log };

import { fs } from '@platform/fs';
export { fs };

import { http } from '@platform/http';
export { http };

import { value, id, defaultValue, time } from '@platform/util.value';
export { value, id, defaultValue, time };

import { HttpClient } from '@platform/cell.client';
export { HttpClient };

import * as cell from './libs.cell';
export { cell };
export * from './libs.cell';
