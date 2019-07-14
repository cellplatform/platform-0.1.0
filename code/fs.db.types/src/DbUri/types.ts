/**
 * A URI that represents the location of data within the database.
 *
 * Format:
 *
 *   - location path:
 *
 *        data:path/to/doc
 *        data:sheet/123/cell/A1
 *
 *   - object property path:
 *
 *        data:path/doc:object.prop
 *        data:sheet/123/cell/A1:value
 *        data:sheet/123/cell/A1:info.name
 *
 *   - object property filters:
 *
 *        data:sheet/123/cell/A1:info.{name=fred && count>=3}  // equal, AND, greater-then-or-equal
 *        data:sheet/123/cell/A1:info.{name=fred || count<3}   // equal, OR, less-than
 *        data:sheet/123/cell/A1:info.{name!="fred" }          // not-equal
 *        data:sheet/123/cell/A1:info.{types[=cell]}           // Types array includes ($in)
 *        data:sheet/123/cell/A1:info.{types[=!fred, bob]}     // Types array includes bob, and not fred ($nin)
 *
 */
export type IDbUri = {
  ok: boolean;
  text: string;
  scheme: string;
  path: IDbUriPath;
  object: IDbUriObject;
  errors: DbUriError[];
  toString(): string; // The raw input (same as "text").
};

export type DbUriError = 'NO_SCHEME' | 'NO_PATH';

export type IDbUriPath = {
  text: string;
  toString(): string;
};
export type IDbUriObject = {
  text: string;
  toString(): string;
};
