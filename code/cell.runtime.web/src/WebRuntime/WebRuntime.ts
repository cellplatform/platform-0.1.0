import { Runtime } from '@platform/cell.runtime';
import { remote } from './WebRuntime.remote';

/**
 * Runtime environment for executing bundles within a web (browser) context.
 */
export const WebRuntime = {
  module: Runtime.module(), // NB: __CELL__ used within this method.
  remote,
};

export default WebRuntime;
