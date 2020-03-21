import { t } from '../common';

/**
 * Reference to a namespace that contains the type definitions for the sheet.
 */
export type INsType = {
  typename?: string; //     Name of the complex type/object this namespace defines.
  implements?: string; //   URI of another namespace containing the type definition to conform to.
};

/**
 * Type Payload
 * (NB: can write directly to HTTP client )
 */
export type ITypeDefPayload = {
  ns: t.INsProps;
  columns: t.IColumnMap;
};
