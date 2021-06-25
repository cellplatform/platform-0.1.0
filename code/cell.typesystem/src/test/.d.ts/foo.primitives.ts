/**
 * Generated types defined in namespace:
 * 
 *    |                
 *    |➔  ns:foo.primitives
 *    |
 *
 * By:
 *    @platform/cell.typesystem@0.0.195
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
  Primitives: Primitives;
};

export declare type Primitives = {
  stringValue: string;
  numberValue: number;
  booleanValue: boolean;
  nullValue: null | string | number;
  undefinedValue?: string;
  stringProp: string;
  numberProp: number;
  booleanProp: boolean;
  nullProp: null | number;
  undefinedProp?: string;
};
