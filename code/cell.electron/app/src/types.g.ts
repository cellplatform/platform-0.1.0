/**
 * Generated types defined in namespace:
 * 
 *    |                
 *    |➔  ns:sys.app.type
 *    |
 *
 * By:
 *    @platform/cell.typesystem@0.0.30
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
 *            import * as t from './types.g.ts';
 * 
 */

import * as t from '@platform/cell.types';

export declare type SysApp = {
  title: string;
  windowDefs: t.ITypedSheetRefs<SysAppWindowDef>;
  windows: t.ITypedSheetRefs<SysAppWindow>;
};

export declare type SysAppWindowDef = {
  kind: string;
  width: number;
  height: number;
};

export declare type SysAppWindow = {
  id: string;
  kind: string;
  title: string;
  width: number;
  height: number;
  x: number;
  y: number;
};
