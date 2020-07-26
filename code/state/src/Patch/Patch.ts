import { t } from '../common';

export class Patch {
  /**
   * Applies a set of patches to an object.
   */
  public static toPatchSet: t.Patch['toPatchSet'] = (forward, backward) => {
    return {
      prev: backward ? toPatches(backward) : [],
      next: forward ? toPatches(forward) : [],
    };
  };

  public static isEmpty: t.Patch['isEmpty'] = (input) => {
    if (input === null || typeof input !== 'object') {
      return true;
    } else {
      const isEmptyArray = (input: any) => (Array.isArray(input) ? input.length === 0 : true);
      return isEmptyArray(input.prev) && isEmptyArray(input.next);
    }
  };
}

/**
 * [Helpers]
 */

const toPatch = (input: t.ArrayPatch): t.PatchOperation => {
  const hasForwardSlash = input.path.some((part) => {
    return typeof part === 'string' ? part.includes('/') : false;
  });

  if (hasForwardSlash) {
    const path = input.path
      .map((part) => (typeof part === 'string' ? `'${part}'` : part))
      .join(',');
    const err = `Property names cannot contain the "/" character. op: '${input.op}' path: [${path}]`;
    throw new Error(err);
  }

  return { ...input, path: input.path.join('/') };
};

const toPatches = (input: t.ArrayPatch | t.ArrayPatch[]): t.PatchOperation[] => {
  const patches = Array.isArray(input) ? input : [input];
  return patches.filter((p) => Boolean(p)).map((p) => toPatch(p));
};
