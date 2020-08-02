export * from './types';

/**
 * Export entry API as constrained interface.
 */
import * as t from './types';
import { StateObject as Class } from './StateObject';
export const StateObject = Class as t.StateObject;
