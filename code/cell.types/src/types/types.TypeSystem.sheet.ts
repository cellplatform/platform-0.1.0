import { t } from '../common';

export type ITypedSheet<T> = {
  readonly ok: boolean;
  readonly uri: t.INsUri;
  readonly types: t.IColumnTypeDef[];
  readonly state: t.ITypedSheetState<T>;
  readonly events$: t.Observable<t.TypedSheetEvent>;
  readonly dispose$: t.Observable<{}>;
  readonly isDisposed: boolean;
  readonly errors: t.ITypeError[];
  dispose(): void;
  cursor(range?: string): ITypedSheetCursor<T>;
};

/**
 * A cursor into a subset of sheet data.
 */
export type ITypedSheetCursor<T> = {
  readonly uri: t.INsUri;
  readonly rows: ITypedSheetRow<T>[];
  readonly range: string;
  readonly total: number; // Total number of rows.
  readonly status: 'INIT' | 'LOADING' | 'LOADED';
  readonly isReady: boolean;
  exists(index: number): boolean;
  row(index: number): ITypedSheetRow<T>;
  load(args?: string | ITypedSheetCursorLoad): Promise<ITypedSheetCursor<T>>;
};

export type ITypedSheetCursorLoad = { range?: string };

/**
 * A single row within a sheet.
 */
export type ITypedSheetRow<T> = {
  readonly uri: t.IRowUri;
  readonly index: number;
  readonly props: ITypedSheetRowProps<T>;
  readonly types: ITypedSheetRowTypes<T>;
  readonly status: 'INIT' | 'LOADING' | 'LOADED';
  readonly isReady: boolean;
  load(options?: { props?: (keyof T)[]; force?: boolean }): Promise<ITypedSheetRow<T>>;
  toObject(): T;
};

/**
 * A connector for a reference-pointer to a single row in another sheet.
 */
export type ITypedSheetRef<T> = {
  typeDef: t.IColumnTypeDef<t.ITypeRef>;
};

/**
 * A connector for a reference-pointer to a set of rows in another sheet.
 */
export type ITypedSheetRefs<T> = {
  ns: t.INsUri;
  typeDef: t.IColumnTypeDef<t.ITypeRef>;
  sheet: t.ITypedSheet<T>;
  isReady: boolean;
  ready(): Promise<ITypedSheetRefs<T>>;
  cursor(range?: string): Promise<ITypedSheetCursor<T>>;
};

/**
 * The pure "strongly typed" READ/WRITE data-properties of the cells for a row.
 */
export type ITypedSheetRowProps<T> = {
  [K in keyof T]: T[K];
};

/**
 * The type definitions for the cells/columns in a row.
 */
export type ITypedSheetRowTypes<T> = {
  list: t.IColumnTypeDef[];
  map: { [P in keyof Required<T>]: t.IColumnTypeDef };
};
