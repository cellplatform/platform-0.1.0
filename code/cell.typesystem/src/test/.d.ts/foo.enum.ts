/**
 * Generated types defined in namespace:
 * 
 *    |                
 *    |➔  ns:foo.enum
 *    |
 *
 * By:
 *    @platform/cell.typesystem@0.0.21
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
 *            import * as t from './foo.enum.ts';
 * 
 */

export declare type Enum = {
  single?: 'hello';
  union: 'red' | 'green' | 'blue'[];
  array: ('red' | 'green' | 'blue')[];
};
