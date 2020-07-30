/**
 * Generated types defined in namespace:
 * 
 *    |                
 *    |➔  ns:ckcck1w4m0003goetfzhn5dgc
 *    |➔  ns:ckcck1w4m0004goet0a8oavc9
 *    |➔  ns:ckcck1w4m0005goet1hqude43
 *    |
 *
 * By:
 *    @platform/cell.typesystem@0.0.86
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

/**
 * Complete index of types available within the sheet.
 * Use by passing into a sheet at creation, for example:
 *
 *    const sheet = await TypedSheet.load<t.TypeIndex>({ ns, fetch });
 *
 */
export declare type TypeIndex = {
  App: App;
  AppWindow: AppWindow;
  AppData: AppData;
};

export declare type App = {
  name: string;
  version: string;
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
  argv: string[];
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
  tmp: string;
};
