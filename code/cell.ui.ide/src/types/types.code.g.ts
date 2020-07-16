/**
 * Generated types defined in namespace:
 * 
 *    |                
 *    |➔  ns:ckcn02uwa000g456cmij8vaix
 *    |➔  ns:ckcmznmtm000e456cuu0hktl7
 *    |
 *
 * By:
 *    @platform/cell.typesystem@0.0.82
 * 
 * Notes: 
 * 
 *    - DO NOT manually edit this file (it will be regenerated automatically).
 *    - DO check this file into source control.
 *    - Usage
 *        Import the [.d.ts] file within the consuming module
 *        that uses a [TypedSheet] to programatically manipulate 
 *        the namespace in a strongly-typed manner, for example:
 * 
 *            import * as t from './<filename>;
 * 
 */

/**
 * Complete index of types available within the sheet.
 * Use by passing into a sheet at creation, for example:
 *
 *    const sheet = await TypedSheet.load<t.TypeIndex>({ ns, fetch });
 *
 */
export declare type TypeIndex = {
  Code: Code;
  Language: Language;
};

export declare type Code = {
  name: string;
  language: string;
  languageVersion: string;
  text: string;
};

export declare type Language = {
  name: string;
};
