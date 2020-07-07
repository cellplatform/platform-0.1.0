import { t } from '../common';

/**
 * A single row within a sheet.
 */
export type ITypedSheetRow<T, K extends keyof T> = {
  readonly index: number;
  readonly typename: string;
  readonly uri: t.IRowUri;
  readonly props: ITypedSheetRowProps<T[K]>;
  readonly types: ITypedSheetRowTypes<T[K]>;
  readonly status: 'INIT' | 'LOADING' | 'LOADED';
  readonly isLoaded: boolean;
  load(options?: { props?: (keyof T[K])[]; force?: boolean }): Promise<ITypedSheetRow<T, K>>;
  toObject(): T[K];
  toString(): string;
};

/**
 * The pure "strongly typed" READ/WRITE data-properties of the cells for a row.
 */
export type ITypedSheetRowProps<T> = { [K in keyof T]: T[K] };

/**
 * The type definitions for the cells/columns in a row.
 */
export type ITypedSheetRowTypes<T> = {
  list: ITypedSheetRowType[];
  map: { [P in keyof Required<T>]: ITypedSheetRowType };
};

export type ITypedSheetRowType = t.IColumnTypeDef & { uri: t.ICellUri };
