import { t } from '../common';

/**
 * Reference to the type of a [column] or individual [cell].
 * Either:
 *
 *  - a simple primitive type: [string], [number], [boolean].
 *
 *  - or a reference to a complex type defined in another sheet via:
 *
 *      "=ref:<ns:uri>", or
 *      "=inline:<ns:uri>"
 *
 *    the prefix "ref" or "inline" dictate whether the corresponding
 *    complex object is stored in a seperate/linked sheet ("ref"), or
 *    is stored locally within the cell ("inline").
 *
 */
export type CellType = string;
export type CellPropType = { name: string; type: CellType };

/**
 * Reference to a namespace that contains the type definitions for the sheet.
 */
export type INsType = {
  typename?: string; //     Name of the complex type/object this namespace defines.
  implements?: string; //   URI of another namespace containing the type definition to conform to.
};

/**
 * TypeSystem
 */
export type ITypeSystemNs = {
  readonly ok: boolean;
  readonly uri: string;
  readonly typename: string;
  readonly errors: t.IError[];
  readonly types: ITypeDef[];
  readonly typescript: string;
};

export type ITypeDef = {
  column: string;
  prop: string;
  type: string | ITypeRef;
  error?: t.IError;
};

export type ITypeRef = {
  uri: string;
  typename: string;
  types: ITypeDef[];
};
