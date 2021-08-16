import { Uri } from './libs';

type FileUri = string;

/**
 * Convert the given "<file:...>" URI to an absolute path.
 */
export function resolveUri(args: { dir: string; uri: FileUri }) {
  const uri = (args.uri || '').trim();
  const dir = (args.dir || '').trim();
  const file = Uri.parse(uri);

  if (!file.ok || file.error) {
    const err = file.error;
    const msg = `Invalid URI. ${err ? err.message : ''}`.trim();
    throw new Error(msg);
  }
  if (file.parts.type !== 'FILE') {
    const msg = `Invalid URI. Not of type "file:" ("${uri}").`;
    throw new Error(msg);
  }
  if (!dir) {
    const msg = `Invalid root directory path ("${uri}").`;
    throw new Error(msg);
  }

  return join(dir, `ns.${file.parts.ns}`, file.parts.file);
}

/**
 * Join multiple parts into a single "/" delimited path.
 * NB:
 *    This is a re-implementation of the native `join` method
 *    to allow this module to have no dependencies on platform node 'fs'.
 */
export function join(...input: string[]) {
  const parts = input.map((part, i) => {
    const isFirst = i === 0;
    const isLast = i === input.length - 1;
    part = isLast ? part : part.replace(/\/*$/, '');
    part = isFirst ? part : part.replace(/^\/*/, '');
    return part;
  });

  const res: string[] = [];

  // Rebuild path observing ".." level-navigation-dots.
  for (const part of parts.join('/').split('/')) {
    const trimmed = part.trim();
    if (trimmed === '.') continue;
    if (trimmed === '..') {
      if (res.length === 0) {
        break; // NB: Exit, we have "stepped up" above the root level.
      } else {
        res.pop(); // Step up a level.
        continue;
      }
    }
    res.push(part);
  }

  return res.join('/');
}
