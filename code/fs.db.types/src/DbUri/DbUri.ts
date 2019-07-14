import * as t from './types';

export type IDbUriArgs = {
  scheme?: string | string[];
};

const DEFAULT = {
  SCHEMES: ['data'],
};

/**
 * A parse for URI's that represent a data-location within the database.
 * See:
 *    https://en.wikipedia.org/wiki/Uniform_Resource_Identifier
 */
export class DbUri {
  /**
   * [Static]
   */
  public static create(args: IDbUriArgs = {}) {
    return new DbUri(args);
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: IDbUriArgs) {
    if (args.scheme !== undefined) {
      const schemes = Array.isArray(args.scheme) ? args.scheme : [args.scheme];
      this._.schemes = schemes;
    }
  }

  /**
   * [Fields]
   */
  private readonly _ = {
    schemes: DEFAULT.SCHEMES,
  };

  /**
   * [Properties]
   */
  public get schemes() {
    return this._.schemes;
  }

  /**
   * [Methods]
   */
  public parse(input?: string): t.IDbUri {
    const text = (input || '').toString().trim();
    let errors: t.DbUriError[] = [];

    // Scheme.
    let chunk = text;
    const scheme = getScheme(chunk, this.schemes);
    chunk = chunk.substring(scheme.length + 1);
    if (!scheme) {
      errors = [...errors, 'NO_SCHEME'];
    }

    // Path.
    const path = scheme ? getChunk(chunk) : text;
    chunk = chunk.substring(path.length + 1);
    if (!path) {
      errors = [...errors, 'NO_PATH'];
    }

    // Object.
    const objectPath = scheme ? getChunk(chunk) : text;

    // URI data-type.
    const ok = errors.length === 0;
    return {
      ok,
      text,
      path: {
        text: path,
        toString: () => path,
      },
      object: {
        text: objectPath,
        toString: () => objectPath,
      },
      scheme,
      errors,
      toString: () => text,
    };
  }
}

/**
 * [Helpers]
 */
function getChunk(input: string) {
  const index = input.indexOf(':');
  const path = index === -1 ? input : input.substring(0, index);
  return path;
}

function getScheme(input: string, schemes: string[]) {
  const index = input.indexOf(':');
  const scheme = index === -1 ? '' : input.substring(0, index);
  return schemes.includes(scheme) ? scheme : '';
}
