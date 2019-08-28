import { Loader } from './Loader';

export * from './Loader';
export * from './types';

/**
 * Singleton.
 */
export const loader = Loader.create();
