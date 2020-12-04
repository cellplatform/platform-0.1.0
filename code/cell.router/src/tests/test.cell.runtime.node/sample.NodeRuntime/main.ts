import * as t from './types';
const params = env.entry.params as t.EntryParams;

/**
 * Dynamic import.
 * NOTE:
 *    Does not currently work with VM2.
 */
// import('./app');

/**
 * Syncronous import.
 */
import { echo } from './app';

if (typeof params.repeatDone === 'number') {
  Array.from({ length: params.repeatDone }).forEach((v, i) => env.done({ count: i + 1 }));
} else {
  if (params.delay) {
    console.log('params', params);
    setTimeout(() => env.done({ echo: echo(), process: process.env }), params.delay);
  } else {
    env.done<t.Result>({ echo: echo(), process: process.env });
  }
}
