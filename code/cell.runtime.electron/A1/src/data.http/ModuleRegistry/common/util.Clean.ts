/**
 * String cleaning.
 */
export const Clean = {
  domain(input: string, options: { throw?: boolean } = {}) {
    const throwError = (detail: string) => {
      throw new Error(`Invalid domain '${input}' - ${detail}`);
    };

    if (typeof input !== 'string') throwError('not a string');
    const host = (input || '')
      .trim()
      .replace(/^http:\/\//, '')
      .replace(/^https:\/\//, '')
      .replace(/:80$/, '');

    if (options.throw) {
      if (!host) throwError(`empty`);
      if (host.includes('/')) throwError(`may not include "/"`);
      if (host.startsWith(':')) throwError(`may not start with ":"`);
      if (host.endsWith(':')) throwError(`may not end with ":"`);
    }
    return host;
  },

  namespace(input: string, options: { throw?: boolean } = {}) {
    const throwError = (detail: string) => {
      throw new Error(`Invalid namespace '${input}' - ${detail}`);
    };

    if (typeof input !== 'string') throwError('not a string');
    const ns = (input || '').trim();

    if (options.throw) {
      if (!ns) throwError(`empty`);
      if (!ns.match(/^[\w\d\.]*$/)) throwError(`must only contain alpha-numeric and "."`);
    }

    return ns;
  },
};
