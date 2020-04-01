import { t } from '../common';

export type ITypedSheet<T> = {
  readonly ok: boolean;
  readonly uri: string;
  readonly types: t.IColumnTypeDef[];
  readonly events$: t.Observable<t.TypedSheetEvent>;
  readonly dispose$: t.Observable<{}>;
  readonly isDisposed: boolean;
  readonly errors: t.ITypeError[];
  dispose(): void;
  cursor(args?: ITypedSheetCursorArgs): Promise<ITypedSheetCursor<T>>;
};

export type ITypedSheetCursorArgs = { index?: number; take?: number };

/**
 * A cursor into a subset of sheet data.
 */
export type ITypedSheetCursor<T> = {
  readonly uri: string;
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
  readonly index: number;
  readonly uri: string;
  readonly props: ITypedSheetRowProps<T>;
  readonly types: ITypedSheetRowTypes<T>;
  toObject(): Promise<T>;
  prop<K extends keyof T>(key: K): ITypedSheetRowProp<T, K>;
};

/**
 * Read/write methods for the properties of a single row.
 */
export type ITypedSheetRowProp<T, K extends keyof T> = {
  get(): Promise<T[K]>;
  set(value: T[K]): Promise<{}>;
  clear(): Promise<{}>;
};

/**
 * The pure "strongly typed" READ/WRITE data-properties of the cells for a row.
 */
export type ITypedSheetRowProps<T> = {
  readonly [K in keyof T]: Promise<T[K]>;
};

/**
 * The type definitions for the cells/columns in a row.
 */
export type ITypedSheetRowTypes<T> = {
  list: t.IColumnTypeDef[];
  map: { [P in keyof Required<T>]: t.IColumnTypeDef };
};
