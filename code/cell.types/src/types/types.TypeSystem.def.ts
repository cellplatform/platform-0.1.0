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
 * Type Definitions.
 */
export type ITypeDef = {
  column: string;
  prop: string;
  type: string | IType; // use [IType] TEMP 🐷- remove [string]
  target?: t.CellTypeTarget;
  error?: t.IError;
};

export type IType = ITypeUnion | ITypeRef | ITypeValue | ITypeEnum | ITypeUnknown;

export type ITypeUnion = {
  kind: 'UNION';
  typename: string;
  types: IType[];
};

export type ITypeRef = {
  kind: 'REF';
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
