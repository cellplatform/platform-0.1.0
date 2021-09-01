export { Filesystem } from '../../web';
export * from '../../web/common';
export * from './libs';
export * from './colors';

import { WebRuntime } from './libs';
export const bundle = WebRuntime.bundle;
