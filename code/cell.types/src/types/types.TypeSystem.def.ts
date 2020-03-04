import { t } from '../common';

/**
 * Type Payload
 * (NB: can write directly to HTTP client )
 */
export type ITypeDefPayload = {
  ns: t.INsProps;
  columns: t.IColumnMap;
};

/**
 * Tokenizer
 */
export type ITypeToken = {
  input: string;
  kind: 'VALUE' | 'GROUP' | 'GROUP[]';
  text: string;
  next: string;
};

/**
 * Type Definitions.
 */
export type INsTypeDef = {
  ok: boolean;
  uri: string;
  typename: string;
  columns: t.IColumnTypeDef[];
  errors: t.IError[];
};

export type IColumnTypeDef = ITypeDef & {
  column: string;
  target?: t.CellTypeTarget;
  error?: t.IError;
};

export type ITypeDef = {
  prop: string;
  type: IType;
  optional?: boolean;
};

/**
 * Types
 */
export type ITypePrimitives = {
  string: t.ITypeValue;
  number: t.ITypeValue;
  boolean: t.ITypeValue;
  null: t.ITypeValue;
  undefined: t.ITypeValue;
};

export type IType = ITypeValue | ITypeEnum | ITypeUnion | ITypeRef | ITypeUnknown;

export type ITypeUnion = {
  kind: 'UNION';
  typename: string;
  types: IType[];
};

export type ITypeRef = {
  kind: 'REF';
  scope: 'NS' | 'COLUMN' | 'UNKNOWN';
  uri: string;
  typename: string;
  types: ITypeDef[];
};

export type ITypeValue = {
  kind: 'VALUE';
  typename: keyof ITypePrimitives;
};

export type ITypeEnum = {
  kind: 'ENUM';
  typename: string;
  values: string[];
};

export type ITypeUnknown = {
  kind: 'UNKNOWN';
  typename: string;
};
