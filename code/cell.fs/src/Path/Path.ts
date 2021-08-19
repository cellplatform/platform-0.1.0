import { Uri } from '../common';

type UriString = string;

export const Path = {
  /**
   * Convert the given "<file:...>" URI to an absolute path.
   */
  resolveUri(args: { dir: string; uri: UriString }) {
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

    return Path.join(dir, `ns.${file.parts.ns}`, file.parts.file);
  },

  /**
   * Join multiple parts into a single "/" delimited path.
   * NB:
   *    This is a re-implementation of the native `join` method
   *    to allow this module to have no dependencies on platform node 'fs'.
   */
  join(...input: string[]) {
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
  },

  /**
   * Trims slashes from the start (left) of a string.
   */
  trimSlashesStart(input: string) {
    return trim(input).replace(/^\/*/, '').trim();
  },

  /**
   * Trims slashes from the start (left) of a string.
   */
  trimSlashesEnd(input: string) {
    return trim(input).replace(/\/*$/, '').trim();
  },

  /**
   * Trims slashes from the start (left) of a string.
   */
  trimSlashes(input: string) {
    input = Path.trimSlashesStart(input);
    input = Path.trimSlashesEnd(input);
    return input;
  },
};

/**
 * [Helpers]
 */

function trim(input: any) {
  return typeof input === 'string' ? (input || '').trim() : '';
}
