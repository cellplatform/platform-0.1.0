import { Uri } from '../Uri';
import { Url } from '../Url';

/**
 * Helpers for working with a file path.
 */
export const FilePath = {
  /**
   * Takes an input URL (with or without an origin domain)
   * and parses the file-system path details.
   */
  fromUrl(input: string) {
    input = (input || '').trim();

    const parsed = Url.parse(input);
    let parts = parsed.path.replace(/^\/*/, '').split('/');

    let path = '';
    let dir = '';
    let filename = '';
    let error = '';

    if (!Uri.is.cell(parts[0])) {
      error = 'The path does not start with a cell URI';
    }

    if (!error && parts[1] !== 'fs') {
      error = 'not a file-system path (eg "/cell:foo:A1/fs/filename")';
    }

    if (!error && parts.length > 2) {
      parts = parts.slice(2);
      path = parts.join('/');
      dir = parts.slice(0, parts.length - 1).join('/');
      filename = parts[parts.length - 1];
    }

    return {
      ok: !error,
      path,
      dir,
      filename,
      error: error ? error : undefined,
      toString: () => parsed.path,
    };
  },

  /**
   * Helpers for working with paths on a [local] file-system implementation.
   */
  Local: {
    /**
     * Convert a value to an absolute path.
     */
    toAbsolutePath(args: { path: string; root: string }) {
      const root = Clean.root(args.root);
      const path = Clean.path(args.path, root);
      return `${root}/${path}`;
    },

    /**
     * Convert a valuew to a relative path, using the home ("~") character.
     */
    toRelativePath(args: { path: string; root: string }) {
      const root = Clean.root(args.root);
      const path = Clean.path(args.path, root);
      return `~/${path}`;
    },

    /**
     * Convert a path to a location field value.
     */
    toAbsoluteLocation(args: { path: string; root: string }) {
      return `file://${FilePath.Local.toAbsolutePath(args)}`;
    },

    /**
     * Convert a path to a relative location, using the home ("~") character.
     */
    toRelativeLocation(args: { path: string; root: string }) {
      return `file://${FilePath.Local.toRelativePath(args)}`;
    },
  },
};

/**
 * [Helpers]
 */

const Clean = {
  root(path: string) {
    return (path ?? '').trim().replace(/\/*$/, '');
  },
  path(path: string, root: string) {
    return (path ?? '')
      .trim()
      .replace(/^file:\/\//, '')
      .replace(new RegExp(`^${root}`), '')
      .replace(/^~\//, '')
      .replace(/^\/*/, '');
  },
};
