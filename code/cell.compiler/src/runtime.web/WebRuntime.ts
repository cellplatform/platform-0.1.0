import { Runtime } from '../runtime';

/**
 * Runtime environment for executing bundles within a web (browser) context.
 */
export const WebRuntime = {
  module: Runtime.module(),
  bundle: Runtime.bundle(),
  remoteLoader: Runtime.remoteLoader,
};
