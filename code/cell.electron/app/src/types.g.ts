/**
 * Generated types defined in namespace:
 * 
 *    |                
 *    |➔  ns:sys.app.type
 *    |
 *
 * By:
 *    @platform/cell.typesystem@0.0.17
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
 *            import * as t from './<filename>.d.ts';
 * 
 */

import * as t from '@platform/cell.types';

export declare type CellApp = {
  title: string;
  windows: t.ITypedSheetRefs<CellAppWindow>;
};

export declare type CellAppWindow = {
  title: string;
};
