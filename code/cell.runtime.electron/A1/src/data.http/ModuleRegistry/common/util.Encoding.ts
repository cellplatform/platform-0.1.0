/**
 * Value encoding helpers.
 */
export const Encoding = {
  domainKey: {
    escape: (value: string) => Key.escape('domain', value),
    unescape: (value: string) => Key.unescape('domain', value),
    is: (value: string) => Key.is('domain', value),
  },

  namespaceKey: {
    escape: (value: string) => Key.escape('ns', value),
    unescape: (value: string) => Key.unescape('ns', value),
    is: (value: string) => Key.is('ns', value),
  },
};

/**
 * [Helpers]
 */

const Key = {
  escape(prefix: string, value: string) {
    value = (value || '').trim();
    value = value.replace(/\:/g, '[.]'); // NB: avoid invalid key with ":" character (eg. "domain:port").
    value = `${prefix}.${value}`;
    return value;
  },

  unescape(prefix: string, value: string) {
    value = (value || '').trim();
    value = value.replace(RegExp(`^${prefix}\.`), '');
    value = value.replace(/\[\.\]/g, ':');
    return value;
  },

  is(prefix: string, value: string) {
    return Boolean((value || '').trim().match(RegExp(`^${prefix}\.`)));
  },
};
