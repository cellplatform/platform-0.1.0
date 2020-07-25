import * as t from '../common/types';

type A = t.ArrayPatch;

export type Patch = {
  toPatchSet(forward?: A | A[], backward?: A | A[]): t.PatchSet;
};

/**
 * A set of patches that allow for forward and backward transformations on data.
 */
export type PatchSet = { prev: PatchOperation[]; next: PatchOperation[] };

/**
 * Patch
 * Standard:
 *    RFC-6902 JSON patch standard
 *    https://tools.ietf.org/html/rfc6902
 *
 *    This subset of `op` values is what the [immer] state library uses.
 *    https://github.com/immerjs/immer
 *
 */
export type PatchOperation = PatchOperationAdd | PatchOperationRemove | PatchOperationReplace;

export type PatchOperationAdd = { op: 'add'; path: string; value?: any };
export type PatchOperationRemove = { op: 'remove'; path: string };
export type PatchOperationReplace = { op: 'replace'; path: string; value?: any };

/**
 * NB: Part of the standard (RFC-6902) but not used. *
 */
// export type PatchOperationMove = { op: 'move'; path: string; from: string };
// export type PatchOperationCopy = { op: 'copy'; path: string; from: string };
// export type PatchOperationTest = { op: 'test'; path: string; value?: any };
