import { t } from '../common';

/**
 * Type Definitions
 */
export type INsTypeDef = {
  ok: boolean;
  uri: string;
  typename: string;
  columns: t.IColumnTypeDef[];
  errors: t.ITypeError[];
};

export type IColumnTypeDef<T extends IType = IType> = ITypeDef<T> & {
  column: string;
  target?: t.CellTypeTarget;
  error?: t.ITypeError;
};

export type ITypeDef<T extends IType = IType> = {
  prop: string;
  optional?: boolean;
  type: T;
};

/**
 * Types
 */
export type ITypePrimitives = {
  string: t.ITypeValue;
  number: t.ITypeValue;
  boolean: t.ITypeValue;
  undefined: t.ITypeValue;
  null: t.ITypeValue;
};

export type IType = ITypeValue | ITypeEnum | ITypeUnion | ITypeRef | ITypeUnknown;

export type ITypeUnion = {
  kind: 'UNION';
  typename: string;
  isArray?: boolean;
  types: IType[];
};

export type ITypeRef = {
  kind: 'REF';
  scope: 'NS' | 'COLUMN' | 'UNKNOWN';
  uri: string;
  typename: string;
  isArray?: boolean;
  types: ITypeDef[];
};

export type ITypeValue = {
  kind: 'VALUE';
  typename: keyof ITypePrimitives;
  isArray?: boolean;
};

export type ITypeEnum = {
  kind: 'ENUM';
  typename: string;
  isArray?: boolean;
};

export type ITypeUnknown = {
  kind: 'UNKNOWN';
  typename: string;
  isArray?: boolean;
};
