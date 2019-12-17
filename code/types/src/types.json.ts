/**
 * JSON (Javascript Object Notation).
 *  - https://www.json.org/json-en.html
 *  - https://devblogs.microsoft.com/typescript/announcing-typescript-3-7-beta
 */

export type Json = string | number | boolean | null | undefined | JsonMap | Json[];
export type JsonMap = { [property: string]: Json };

/**
 * TODO 🐷
 * - DELETE old types below
 */

// export type IJsonMap = {
//   [member: string]: string | number | boolean | null | undefined | IJsonArray | IJsonMap;
// };

// export interface IJsonArray
//   extends Array<string | number | boolean | null | undefined | IJsonArray | IJsonMap> {}

// export type Json = IJsonMap | IJsonArray | string | number | boolean | null;
