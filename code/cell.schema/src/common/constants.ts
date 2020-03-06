export const ERROR = {
  HTTP: {
    SERVER: 'HTTP/server',
    CONFIG: 'HTTP/config',
    NOT_FOUND: 'HTTP/notFound',
    NOT_LINKED: 'HTTP/notLinked',
    FILE: 'HTTP/file',
    MALFORMED_URI: 'HTTP/uri/malformed',
    HASH_MISMATCH: 'HTTP/hash/mismatch',
    TYPE: 'HTTP/type',
  },
  TYPE: {
    DEF: 'TYPE/def',
    DEF_NOT_FOUND: 'TYPE/def/notFound',
    TARGET: 'TYPE/target',
    REF: 'TYPE/ref',
    CIRCULAR_REF: 'TYPE/circularRef',
    SHEET: 'TYPE/sheet',
    PROP: {
      DUPLICATE_NAME: 'TYPE/prop/duplicateName',
    },
  },
};
