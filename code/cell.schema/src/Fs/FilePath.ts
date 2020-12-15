import { Uri } from '../Uri';
import { Url } from '../Url';

/**
 * Helpers for parsing a file path.
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
      // Path
      parts = parts.slice(2);
      path = parts.join('/');
      dir = parts.slice(0, parts.length - 1).join('/');
      filename = parts[parts.length - 1];
    }

    return {
      ok: !Boolean(error),
      path,
      dir,
      filename,
      error: error ? error : undefined,
      toString: () => parsed.path,
    };
  },
};
