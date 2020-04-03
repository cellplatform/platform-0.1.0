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
  cursor(args?: ITypedSheetCursorArgs): Promise<ITypedSheetCursor<T>>;
};

/**
 * A cursor into a subset of sheet data.
 */
export type ITypedSheetCursorArgs = { index?: number; take?: number };
export type ITypedSheetCursor<T> = {
  readonly uri: t.INsUri;
  readonly index: number;
  readonly take?: number;
  readonly total: number;
  readonly rows: ITypedSheetRow<T>[];
  exists(rowIndex: number): boolean;
  row(rowIndex: number): ITypedSheetRow<T>;
};

/**
 * A single row within a sheet.
 */
export type ITypedSheetRow<T> = {
  readonly uri: t.IRowUri;
  readonly index: number;
  readonly props: ITypedSheetRowProps<T>;
  readonly types: ITypedSheetRowTypes<T>;
  load(): Promise<ITypedSheetRow<T>>;
  prop<K extends keyof T>(name: K): ITypedSheetRowProp<T, K>;
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
};

/**
 * Read/write methods for the properties of a single row.
 */
export type ITypedSheetRowProp<T, K extends keyof T> = {
  get(): T[K];
  set(value: T[K]): ITypedSheetRow<T>;
  clear(): ITypedSheetRow<T>;
};

/**
 * The pure "strongly typed" READ/WRITE data-properties of the cells for a row.
 */
export type ITypedSheetRowProps<T> = {
  readonly [K in keyof T]: T[K];
};

/**
 * The type definitions for the cells/columns in a row.
 */
export type ITypedSheetRowTypes<T> = {
  list: t.IColumnTypeDef[];
  map: { [P in keyof Required<T>]: t.IColumnTypeDef };
};
