import * as t from './types';
import * as constants from './constants';

export { t, constants };
export * from './libs';
export * from './colors';

import { WebRuntime } from './libs';
export const bundle = WebRuntime.bundle;

const env = (window as any)[constants.ENV_KEY] as t.RuntimeDesktopEnv;
export { env };
