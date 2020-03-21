import { t } from '../common';

/**
 * The declaration that defines a cell as a strongly typed property.
 */
export type CellTypeProp = { name: string; type: CellType; target?: CellTypeTarget };

/**
 * The type of a cell's data.
 * Either a simple [Primitive], an [Enum] or an external [Reference].
 *
 *    Primitive:
 *      - string
 *      - number
 *      - boolean
 *      - undefined
 *      - null
 *
 *    Enum (string), eg:
 *      - "red"
 *      - "red" | "green" | "blue"
 *
 *    Reference:
 *      - ns:<id>             eg: { target: "ns:foo"}      <- object
 *      - cell:<ns>:<column>  eg: { target: "cell:foo:A"}  <- object or primitive.
 *
 * Union operators ("|") can OR together several differnt types, eg:
 *
 *    type: '"red" | "blue" | boolean | cell:foo:A1 | ns:bar'
 *    type: '(string | number) | ns:foo'
 *
 */
export type CellType = string;

/**
 * The target that the typed cell's data is written to.
 *
 * Formats:
 *      - "inline"                  => { value }
 *      - "inline:<propA>           => { props: { 'propA': {...} } }
 *      - "inline:<propA>.<propB>"  => { props: { 'propA.propB1': {...} } }
 *      - "inline:<propA>:<propB>"  => { props: { 'propA:propB1': {...} } }
 *      - "ref"
 *
 *    The prefix "ref" or "inline" dictate whether the cells
 *    data is stored in a seperate/linked sheet ("ref"), or
 *    is stored locally within the cell ("inline").
 *
 *    For complex types, that is the type is a rich-object defined by
 *    referencing another namespace/sheet:
 *
 *      - a target value of "ref" would cause a {links:ref} to be setup on the cell
 *        pointing to a row in the remote namespace/sheet.
 *
 *          {
 *            ns: { type: { typename: 'MyObject' } },
 *            columns: {
 *              A: { props: { prop: { name: 'color', type: 'ns:foo' target: 'ref' } } }
 *            }
 *          }
 *
 *      - a target value of "inline" would cause the rich object to be written
 *        locally to the cell either on the value ("inline"), or at the specified
 *        props path ("inline:foo.color"):
 *
 *          {
 *            ns: { type: { typename: 'MyObject' } },
 *            columns: {
 *              A: { props: { prop: { name: 'color1', type: 'ns:foo' target: 'inline:foo.color' } } }
 *              B: { props: { prop: { name: 'color2', type: 'ns:foo' } } }  // NB: no target, default "inline".
 *            }
 *          }
 *
 */
export type CellTypeTarget = string;

/**
 * Parsed details about a [CellTypeTarget] string.
 */
export type CellTypeTargetInfo = {
  target: string;
  isValid: boolean;
  isInline: boolean;
  isRef: boolean;
  kind: 'inline' | 'ref' | 'UNKNOWN';
  path: string;
  errors: t.IError[];
  toString(): string;
};
