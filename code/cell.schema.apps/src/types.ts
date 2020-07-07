import { ITypedSheetRow } from './common/types';
import * as t from './types.g';

export { TypeIndex as AppTypeIndex, App, AppWindow, AppData } from './types.g';

export type AppRow = ITypedSheetRow<t.TypeIndex, 'App'>;
export type AppWindowRow = ITypedSheetRow<t.TypeIndex, 'AppWindow'>;
export type AppDataRow = ITypedSheetRow<t.TypeIndex, 'AppData'>;
