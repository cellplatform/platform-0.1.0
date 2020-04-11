/**
 * Generated types defined in namespace:
 * 
 *    |                
 *    |➔  ns:foo.primitives
 *    |
 *
 * By:
 *    @platform/cell.typesystem@0.0.15
 * 
 * Notes: 
 * 
 *    - DO NOT manually edit this file (it will be regenerated automatically).
 *    - DO check this file into source control.
 *    - Usage
 *        Import the [.d.ts] file within the consuming module
 *        that uses a [TypedSheet] to programatically manipulate 
 *        the namespace in a strongly-typed manner. eg:
 * 
 *            import * as t from './foo.primitives.d.ts';
 * 
 */

import * as t from '@platform/cell.types';

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
