import * as t from './types';

export class Patch {
  /**
   * Applies a set of patches to an object.
   */
  public static apply<T>(obj: T, changes: t.PatchOperation | t.PatchOperation[]): T {
    // const patches = Array.isArray(changes) ? changes : [changes];
    throw new Error(`[Patch.apply] not implemented`);
  }
}
