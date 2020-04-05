/**
 * Generated types defined in namespace:
 * 
 *    |                
 *    |➔  ns:foo.enum
 *    |
 *
 * By:
 *    @platform/cell.typesystem@0.0.10
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
 *            import * as t from './foo.enum.d.ts';
 * 
 */

import * as t from '@platform/cell.types';

export declare type Enum = {
  single?: 'hello';
  union: 'red' | 'green' | 'blue'[];
  array: ('red' | 'green' | 'blue')[];
};
