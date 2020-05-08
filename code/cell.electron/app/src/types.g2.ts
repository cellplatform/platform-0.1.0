/**
 * Generated types defined in namespace:
 * 
 *    |                
 *    |➔  ns:sys.app.type
 *    |
 *
 * By:
 *    @platform/cell.typesystem@0.0.33
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
 *            import * as t from './types.g2.ts';
 * 
 */

import * as t from '@platform/cell.types';

export declare type App = {
  name: string;
  backgroundColor: string;
  bundle: string;
  windows: t.ITypedSheetRefs<AppWindow>;
};

export declare type AppWindow = {
  app: string;
  title: string;
  width: number;
  height: number;
  x: number;
  y: number;
};
