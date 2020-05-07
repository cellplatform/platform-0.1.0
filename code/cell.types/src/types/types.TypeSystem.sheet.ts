import { t } from '../common';

type R<T> = ITypedSheetRow<T>;

export type ITypedSheet<T = {}> = {
  readonly ok: boolean;
  readonly uri: t.INsUri;
  readonly implements: t.INsUri;
  readonly types: { typename: string; columns: t.IColumnTypeDef[] }[];
  readonly state: t.ITypedSheetState;
  readonly event$: t.Observable<t.TypedSheetEvent>;
  readonly dispose$: t.Observable<{}>;
  readonly isDisposed: boolean;
  readonly errors: t.ITypeError[];
  dispose(): void;
  info<P extends t.INsProps = t.INsProps>(): Promise<ITypedSheetInfo<P>>;
  data<D = T>(args: string | ITypedSheetDataArgs): ITypedSheetData<D>;
  toString(): string;
};

export type ITypedSheetInfo<P extends t.INsProps = t.INsProps> = { exists: boolean; ns: P };

export type ITypedSheetDataOptions = { range?: string };
export type ITypedSheetDataArgs = { typename: string } & ITypedSheetDataOptions;

/**
 * A cursor into a subset of sheet data.
 */
export type ITypedSheetData<T> = {
  readonly uri: t.INsUri;
  readonly typename: string;
  readonly types: t.IColumnTypeDef[];
  readonly rows: ITypedSheetRow<T>[];
  readonly range: string;
  readonly total: number; // Total rows.
  readonly status: 'INIT' | 'LOADING' | 'LOADED';
  readonly isLoaded: boolean;
  exists(index: number): boolean;
  row(index: number): ITypedSheetRow<T>;
  load(options?: string | ITypedSheetDataOptions): Promise<ITypedSheetData<T>>;

  // Functional methods.
  forEach(fn: (row: t.ITypedSheetRowProps<T>, index: number) => void): void;
  map<U>(fn: (row: t.ITypedSheetRowProps<T>, index: number) => U): U[];
  filter(fn: (row: t.ITypedSheetRowProps<T>, index: number) => boolean): R<T>[];
  find(fn: (row: t.ITypedSheetRowProps<T>, index: number) => boolean): R<T> | undefined;
};

/**
 * A single row within a sheet.
 */
export type ITypedSheetRow<T> = {
  readonly typename: string;
  readonly uri: t.IRowUri;
  readonly index: number;
  readonly props: ITypedSheetRowProps<T>;
  readonly types: ITypedSheetRowTypes<T>;
  readonly status: 'INIT' | 'LOADING' | 'LOADED';
  readonly isLoaded: boolean;
  load(options?: { props?: (keyof T)[]; force?: boolean }): Promise<ITypedSheetRow<T>>;
  toObject(): T;
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
