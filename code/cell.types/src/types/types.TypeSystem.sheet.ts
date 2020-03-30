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
  cursor(args?: ITypedSheetRowsArgs): Promise<ITypedSheetCursor<T>>;
};

export type ITypedSheetRowsArgs = { index?: number; take?: number };

/**
 * A cursor into a sub-set of the sheet data.
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
  toObject(): T;
  get<K extends keyof T>(prop: K): Promise<T[K]>;
  set<K extends keyof T>(prop: K, value: T[K]): Promise<ITypedSheetRowSetResult<T, K>>;
};

/**
 * Response from the [row.set] method.
 */
export type ITypedSheetRowSetResult<T, K extends keyof T> = {
  prop: K;
  value: T[K];
  target: t.CellTypeTargetInfo;
  type: t.IColumnTypeDef;
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
