import * as cheerio from 'cheerio';
export { cheerio };

import { uniq, mergeDeepRight, prop, sortBy, clone } from 'ramda';
export const R = { uniq, mergeDeepRight, prop, sortBy, clone };

export { Router } from '@platform/http.router';
export { log } from '@platform/log/lib/server';
export { fs } from '@platform/fs';
export { http } from '@platform/http';
export { value, id, defaultValue, time } from '@platform/util.value';
export { Client, HttpClient } from '@platform/cell.client';
export { MemoryCache } from '@platform/cache';
export { wildcard } from '@platform/util.string/lib/wildcard';

export * from './libs.cell';
import * as cell from './libs.cell';

export { cell };

export const models = cell.models;
export const Schema = cell.Schema;
