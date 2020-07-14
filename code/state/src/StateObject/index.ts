export * from './types';

/**
 * Export entry API as constrained interface.
 */
import * as t from './types';
import { StateObject as StateObjectClass } from './StateObject';
export const StateObject = StateObjectClass as t.StateObject;
