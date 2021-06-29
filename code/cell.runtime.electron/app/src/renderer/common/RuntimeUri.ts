import * as t from './types';
import { slug } from './libs';

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
    create(id?: t.WindowId | string) {
      return `process:window:${id ?? slug()}`;
    },

    parse(input: any, options: { throw?: boolean } = {}): t.WindowUriObject | undefined {
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
      const slug = toString(parts[2]);
      const uri: t.WindowUriObject = {
        ok: true,
        type: 'window',
        slug, // NB: A randomly generated id created for the window.
        errors: [],
      };

      const error = (message: string) => uri.errors.push(message);
      if (!slug) error(`Not a valid id (slug)`);

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
