export * from './types';

/**
 * Export entry API as constrained interface.
 */
import * as t from './types';
import { Patch as PatchClass } from './Patch';
export const Patch = PatchClass as t.Patch;
