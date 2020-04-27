import { Schema } from './libs';

/**
 * Convert the given string to an absolute path.
 */
export function resolve(args: { root: string; uri: string }) {
  const { uri = '' } = args;
  const root = (args.root || '').trim();
  const file = Schema.uri.parse(uri);
  if (!file.ok || file.error) {
    const err = file.error;
    const msg = `Invalid URI. ${err ? err.message : ''}`.trim();
    throw new Error(msg);
  }
  if (file.parts.type !== 'FILE') {
    const msg = `Invalid URI. Not of type "file:" ("${uri}").`;
    throw new Error(msg);
  }
  if (!root) {
    const msg = `Invalid root path ("${uri}").`;
    throw new Error(msg);
  }

  return join(root, `ns.${file.parts.ns}`, file.parts.file);

  // return fs.join(root, `ns.${file.parts.ns}`, file.parts.file);
}

/**
 * Join multiple parts into a single "/" delimited path.
 * NB:
 *    This is a re-implementation of the native `join` method
 *    to allow this module to have no dependencies on the node 'fs'.
 */
export function join(...parts: string[]) {
  return parts
    .map((part, i) => {
      const isFirst = i === 0;
      const isLast = i === parts.length - 1;
      part = isLast ? part : part.replace(/\/*$/, '');
      part = isFirst ? part : part.replace(/^\/*/, '');
      return part;
    })
    .join('/');
}
