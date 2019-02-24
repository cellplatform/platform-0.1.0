import { Db, Swarm } from '@platform/hyperdb';

export { Db, Swarm };
export * from '../types';

/**
 * Start the HyperDB IPC handler's listening on the [main] process.
 */
export { listen } from './main.ipc';

/**
 * Create a new network connected HyperDB on the `main` process.
 */
export { create } from './main.create';
