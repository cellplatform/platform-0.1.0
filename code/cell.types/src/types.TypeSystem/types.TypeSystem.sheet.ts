import { t } from '../common';

type R<T, K extends keyof T> = t.ITypedSheetRow<T, K>;

/**
 * A strongly typed sheet.
 *
 * Generic:
 *    <T> = TypeIndex = { [TypeName]:Type }
 *
 *    type TypeIndex = {
 *      MyFoo: MyFoo;
 *      MyBar: MyBar;
 *    }
 *
 *    A type-index is a single type that provides a key'ed reference to
 *    all the kinds of types available within the sheet.  The keys
 *    allow the `.data('<key>')` cursors to be addressed with strong-typing
 *    on the TypeName.
 *
 */
export type ITypedSheet<T = {}> = {
  readonly ok: boolean;
  readonly uri: t.INsUri;
  readonly implements: t.INsUri;
  readonly types: { typename: string; columns: t.IColumnTypeDef[] }[];
  readonly state: t.ITypedSheetState;
  readonly changes: t.ITypedSheetChanges;
  readonly event$: t.Observable<t.TypedSheetEvent>;
  readonly dispose$: t.Observable<{}>;
  readonly isDisposed: boolean;
  readonly errors: t.ITypeError[];
  readonly pool: t.ISheetPool;
  dispose(): void;
  info<P extends t.INsProps = t.INsProps>(): Promise<ITypedSheetInfo<P>>;
  data<K extends keyof T>(args: K | ITypedSheetDataArgs<T, K>): ITypedSheetData<T, K>;
  change(changes: t.ITypedSheetChanges): ITypedSheet<T>;
  toString(): string;
};

export type ITypedSheetInfo<P extends t.INsProps = t.INsProps> = { exists: boolean; ns: P };

export type ITypedSheetDataOptions = { range?: string };
export type ITypedSheetDataArgs<T, K extends keyof T> = { typename: K } & ITypedSheetDataOptions;

/**
 * A cursor into a subset of sheet data.
 */
export type ITypedSheetData<T, K extends keyof T> = {
  readonly uri: t.INsUri;
  readonly typename: string;
  readonly types: t.IColumnTypeDef[];
  readonly rows: t.ITypedSheetRow<T, K>[];
  readonly range: string;
  readonly total: number; // Total rows.
  readonly status: 'INIT' | 'LOADING' | 'LOADED';
  readonly isLoaded: boolean;
  exists(index: number): boolean;
  row(index: number): t.ITypedSheetRow<T, K>;
  load(options?: string | ITypedSheetDataOptions): Promise<ITypedSheetData<T, K>>;
  toString(): string;

  // Functional methods.
  forEach(fn: (row: t.ITypedSheetRowProps<T[K]>, index: number) => void): void;
  filter(fn: (row: t.ITypedSheetRowProps<T[K]>, index: number) => boolean): R<T, K>[];
  find(fn: (row: t.ITypedSheetRowProps<T[K]>, index: number) => boolean): R<T, K> | undefined;
  map<U>(fn: (row: t.ITypedSheetRowProps<T[K]>, index: number) => U): U[];
  reduce<U>(fn: (prev: U, next: t.ITypedSheetRowProps<T[K]>, index: number) => U, initial: U): U;
};
