import { fs, Schema } from './libs';

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
  return fs.join(root, `ns.${file.parts.ns}`, file.parts.file);
}
