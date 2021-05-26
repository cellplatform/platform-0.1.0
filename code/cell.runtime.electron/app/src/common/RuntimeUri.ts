import * as t from './types';

/**
 * Electron application URIs.
 */
export const RuntimeUri = {
  /**
   * The main electron process.
   */
  main: 'process:main',

  /**
   * A URI that represents a unique window.
   */
  window: {
    create(id: t.ElectronWindowId) {
      return `process:window:${id}`;
    },

    parse(input: any, options: { throw?: boolean } = {}): t.ElectronWindowUriObject | undefined {
      const value = toString(input);

      const throwError = (errors: string[] = []) => {
        let msg = 'Window URI could not be parsed';
        if (errors.length > 0) msg = `${msg}\n${errors.join('\n')}`;
        throw new Error(msg);
      };

      if (!RuntimeUri.is.window(value)) {
        if (options.throw) throwError();
        return;
      }

      const parts = value.split(':').map((part) => part.trim());
      const parsedId = parseInt(parts[2], 10);
      const id = Number.isNaN(parsedId) ? -1 : parsedId;

      const uri: t.ElectronWindowUriObject = { ok: true, type: 'window', id, errors: [] };

      const error = (message: string) => uri.errors.push(message);
      if (id < 1) error(`Not a valid window id (number)`);

      uri.ok = uri.errors.length === 0;
      if (!uri.ok && options.throw) {
        throwError(uri.errors);
      }

      return uri;
    },
  },

  /**
   * Value testing flags.
   */
  is: {
    main: (input: any) => toString(input) === RuntimeUri.main,
    window: (input: any) => toString(input).startsWith('process:window:'),
  },
};

/**
 * [Helpers]
 */
function toString(input: any) {
  return (typeof input === 'string' ? input : '').trim();
}
