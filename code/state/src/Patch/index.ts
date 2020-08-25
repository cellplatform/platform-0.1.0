import * as t from '@platform/state.types/lib/types.Patch';

/**
 * Export entry API as constrained interface.
 */
import { Patch as PatchClass } from './Patch';
export const Patch = PatchClass as t.Patch;
