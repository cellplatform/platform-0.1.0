/**
 * Generated types defined in namespace:
 * 
 *    |                
 *    |➔  ns:ckcbhh4o70003b9et88hyfjtk
 *    |➔  ns:ckcbhh4o70004b9etagsu80ot
 *    |➔  ns:ckcbhh4o70005b9et0jr9d9rd
 *    |
 *
 * By:
 *    @platform/cell.typesystem@0.0.72
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

import * as t from '@platform/cell.types';

export declare type TypeIndex = {
  App: App;
  AppWindow: AppWindow;
  AppData: AppData;
};

export declare type App = {
  name: string;
  argv: string[];
  fs: string;
  bytes: number;
  entry: string;
  devPort: number;
  devTools: boolean;
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  windows: t.ITypedSheetRefs<TypeIndex, 'AppWindow'>;
  data: t.ITypedSheetRefs<TypeIndex, 'AppData'>;
};

export declare type AppWindow = {
  app: string;
  title: string;
  width: number;
  height: number;
  x: number;
  y: number;
  isVisible: boolean;
};

export declare type AppData = {
  app: string;
  window: string;
  fs: string;
  tmp: string;
};
