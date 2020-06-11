import { t } from '../common';
/**
 * A connector for a reference-pointer to a single row in another sheet.
 */
export type ITypedSheetRef<T> = {
  typename: string;
  typeDef: t.IColumnTypeDef<t.ITypeRef>;
};

/**
 * A connector for a reference-pointer to a set of rows in another sheet.
 */
export type ITypedSheetRefs<T> = {
  ns: t.INsUri;
  typename: string;
  typeDef: t.IColumnTypeDef<t.ITypeRef>;
  sheet: t.ITypedSheet<T>;
  isLoaded: boolean;
  parent: ITypedSheetRefParent;
  load(): Promise<ITypedSheetRefs<T>>;
  data(options?: t.ITypedSheetDataOptions): Promise<t.ITypedSheetData<T>>;
};

/**
 * Reference to the parent context context of a reference.
 */
export type ITypedSheetRefParent = { cell: t.ICellUri; sheet: t.ITypedSheet };
