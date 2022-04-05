import * as t from './common';

type O = Record<string, unknown>;

/**
 * Inline copy of the `immer` Patch type.
 */
export type ArrayPatch = {
  op: PatchOperation['op'];
  path: (string | number)[];
  value?: any;
};

type A = t.ArrayPatch;

export type Patch = {
  toPatchSet(forward?: A | A[], backward?: A | A[]): t.PatchSet;
  isEmpty(patches: t.PatchSet): boolean;
  change<T extends O>(from: T, fn: t.StateChanger<T> | T): t.PatchChange<T>;
  changeAsync<T extends O>(from: T, fn: t.StateChangerAsync<T>): Promise<t.PatchChange<T>>;
  apply<T extends O>(from: T, patches: t.PatchOperation[] | t.PatchSet): T;
};

export type PatchChange<T extends O> = {
  to: T;
  op: t.StateChangeOperation;
  patches: PatchSet;
};

/**
 * A set of patches that allow for forward and backward transformations on data.
 */
export type PatchSet = { prev: PatchOperation[]; next: PatchOperation[] };

/**
 * Patch
 *
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
