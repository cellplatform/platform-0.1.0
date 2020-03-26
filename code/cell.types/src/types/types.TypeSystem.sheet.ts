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
  readonly types: t.IColumnTypeDef[];
  readonly props: ITypedSheetRowProps<T>;
  toObject(): T;
};

/**
 * The pure "strongly typed" data-properties of the cells defined in the row.
 */
export type ITypedSheetRowProps<T> = T & { toObject: () => T };
