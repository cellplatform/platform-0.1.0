import { t } from '../common';
/**
 * A connector for a reference-pointer to a single row in another sheet.
 *
 * Generic (see [TypedSheet] for more):
 *    <T> = TypeIndex = { [TypeName]:Type }
 */
export type ITypedSheetRef<
  T,
  K extends keyof T // eslint-disable-line
> = {
  typename: string;
  typeDef: t.IColumnTypeDef<t.ITypeRef>;
};

/**
 * A connector for a reference-pointer to a set of rows in another sheet.
 *
 * Generic (see [TypedSheet] for more):
 *    <T> = TypeIndex = { [TypeName]:Type }
 */
export type ITypedSheetRefs<T, K extends keyof T> = {
  ns: t.INsUri;
  typename: string;
  typeDef: t.IColumnTypeDef<t.ITypeRef>;
  sheet: t.ITypedSheet<T>;
  isLoaded: boolean;
  parent: ITypedSheetRefParent;
  load(): Promise<ITypedSheetRefs<T, K>>;
  data(options?: t.ITypedSheetDataOptions): Promise<t.ITypedSheetData<T, K>>;
};

/**
 * Reference to the parent context context of a reference.
 */
export type ITypedSheetRefParent = { cell: t.ICellUri; sheet: t.ITypedSheet };
