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
 * Type Definitions.
 */

export type ITypeDef = {
  prop: string;
  type: string | IType; // use [IType] TEMP 🐷- remove [string]
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
  types: IColumnTypeDef[];
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
