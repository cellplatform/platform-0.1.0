import { t } from '../common';

/**
 * Type Payload
 * (NB: can write directly to HTTP client )
 */
export type ITypeDefPayload = {
  ns: t.INsProps;
  columns: t.IColumnMap;
};

export type IColumnTypeDef = ITypeDef & {
  column: string;
  target?: t.CellTypeTarget;
  error?: t.IError;
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

export type ITypeDef = {
  prop: string;
  type: IType;
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
  typename: 'string' | 'number' | 'boolean' | 'null' | 'undefined';
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
