export const Clean = {
  domain(input: string, options: { throw?: boolean } = {}) {
    const invalid = `Invalid domain '${input}'`;
    if (typeof input !== 'string') throw new Error(invalid);

    const host = (input || '')
      .trim()
      .replace(/^http:\/\//, '')
      .replace(/^https:\/\//, '')
      .replace(/:80$/, '');

    if (options.throw) {
      if (!host) throw new Error(`${invalid} - empty`);
      if (host.length < 5) throw new Error(`${invalid} - too short`);
      if (host.includes('/')) throw new Error(`${invalid} - may not include "/"`);
      if (host.startsWith(':')) throw new Error(`${invalid} - may not start with ":"`);
      if (host.endsWith(':')) throw new Error(`${invalid} - may not end with ":"`);
    }
    return host;
  },

  namespace(input: string, options: { throw?: boolean } = {}) {
    const invalid = `Invalid namespace '${input}'`;
    if (typeof input !== 'string') throw new Error(invalid);

    const ns = (input || '').trim();

    if (options.throw) {
      if (!ns) throw new Error(`${invalid} - empty`);
      if (!ns.match(/^[\w\d\.]*$/))
        throw new Error(`${invalid} - must only contain alpha-numeric and "."`);
    }

    return ns;
  },
};
