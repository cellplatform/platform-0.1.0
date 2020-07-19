import * as t from '../common/types';
import * as g from './types.g';

/**
 * Sheet types (convenience).
 */
export type AppSheet = t.ITypedSheet<g.TypeIndex>;

export type AppCursor = t.ITypedSheetData<g.TypeIndex, 'App'>;
export type AppWindowCursor = t.ITypedSheetData<g.TypeIndex, 'AppWindow'>;
export type AppDataCursor = t.ITypedSheetData<g.TypeIndex, 'AppData'>;

export type AppRow = t.ITypedSheetRow<g.TypeIndex, 'App'>;
export type AppWindowRow = t.ITypedSheetRow<g.TypeIndex, 'AppWindow'>;
export type AppDataRow = t.ITypedSheetRow<g.TypeIndex, 'AppData'>;
