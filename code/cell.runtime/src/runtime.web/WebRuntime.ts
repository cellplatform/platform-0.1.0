import { Runtime } from '../runtime';

/**
 * Runtime environment for executing bundles within a web (browser) context.
 */
export const WebRuntime = {
  module: Runtime.module(), // NB: __CELL_ENV__ used within this method.
  bundle: Runtime.bundle(), // NB: __CELL_ENV__ used within this method.
  remote: Runtime.remote,
};

export default WebRuntime;
