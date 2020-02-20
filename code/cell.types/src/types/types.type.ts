/**
 * Reference to the type of a cell/row/column.
 * Either:
 *
 *  - a simple primitive type: [string], [number], [boolean]
 *
 *  - or a reference to a complex type defined in another sheet,
 *    eg. "=ns:foo" where the referenced sheet itself defines a complex type.
 *
 */
export type CellType = string;
