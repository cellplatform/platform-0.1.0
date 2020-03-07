import * as t from './types';

/**
 * Http
 */
const HTTP_SERVER: t.IHttpErrorServer['type'] = 'HTTP/server';
const HTTP_CONFIG: t.IHttpErrorConfig['type'] = 'HTTP/config';
const HTTP_NOT_FOUND: t.IHttpErrorNotFound['type'] = 'HTTP/notFound';
const HTTP_NOT_LINKED: t.IHttpErrorNotLinked['type'] = 'HTTP/notLinked';
const HTTP_FILE: t.IHttpErrorFile['type'] = 'HTTP/file';
const HTTP_MALFORMED_URI: t.IHttpErrorMalformedUri['type'] = 'HTTP/uri/malformed';
const HTTP_HASH_MISMATCH: t.IHttpErrorHashMismatch['type'] = 'HTTP/hash/mismatch';
const HTTP_TYPE: t.IHttpErrorType['type'] = 'HTTP/type';

const HTTP = {
  SERVER: HTTP_SERVER,
  CONFIG: HTTP_CONFIG,
  NOT_FOUND: HTTP_NOT_FOUND,
  NOT_LINKED: HTTP_NOT_LINKED,
  FILE: HTTP_FILE,
  MALFORMED_URI: HTTP_MALFORMED_URI,
  HASH_MISMATCH: HTTP_HASH_MISMATCH,
  TYPE: HTTP_TYPE,
};

/**
 * TypeSystem
 */
const TYPE_DEF: t.ITypeErrorDef['type'] = 'TYPE/def';
const TYPE_DEF_INVALID: t.ITypeErrorDefInvalid['type'] = 'TYPE/def/invalid';
const TYPE_NOT_FOUND: t.ITypeErrorNotFound['type'] = 'TYPE/notFound';
const TYPE_TARGET: t.ITypeErrorTarget['type'] = 'TYPE/target';
const TYPE_REF: t.ITypeErrorRef['type'] = 'TYPE/ref';
const TYPE_REF_CIRCULAR: t.ITypeErrorCircularRef['type'] = 'TYPE/ref/circular';
const TYPE_DUPLICATE_PROP: t.ITypeErrorDuplicateProp['type'] = 'TYPE/duplicate/prop';
const TYPE_DUPLICATE_TYPENAME: t.ITypeErrorDuplicateTypename['type'] = 'TYPE/duplicate/typename';
const TYPE_SHEET: t.ITypeErrorSheet['type'] = 'TYPE/sheet';

const TYPE = {
  DEF: TYPE_DEF,
  DEF_INVALID: TYPE_DEF_INVALID,
  NOT_FOUND: TYPE_NOT_FOUND,
  TARGET: TYPE_TARGET,
  REF: TYPE_REF,
  REF_CIRCULAR: TYPE_REF_CIRCULAR,
  DUPLICATE_PROP: TYPE_DUPLICATE_PROP,
  DUPLICATE_TYPENAME: TYPE_DUPLICATE_TYPENAME,
  SHEET: TYPE_SHEET,
};

export const ERROR = {
  HTTP,
  TYPE,
};
