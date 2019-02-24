export * from '../types';

/**
 * Start the HyperDB IPC handler's listening on the [main] process.
 */
export { listen } from './main.ipc';

/**
 * Create a new network connected HyperDB on the `main` process.
 */
export { create, Db, Swarm } from '@platform/hyperdb';
