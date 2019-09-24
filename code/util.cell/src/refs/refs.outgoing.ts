import { R, t } from '../common';
import { formula } from '../formula';
import { ast } from '../ast';
import { cell } from '../cell';
import { range } from '../range';

/**
 * TODO 🐷
 * - source (type)
 * - memory `cache` passed through `ctx`
 */

/**
 * Calculate outgoing refs for given cell.
 */
export async function outgoing(args: {
  key: string;
  getValue: t.RefGetValue;
  path?: string;
}): Promise<t.IRefOut[]> {
  const done = (refs: t.IRefOut[]) => {
    refs = deleteUndefined('error', refs);
    return refs;
  };

  const getValue: t.RefGetValue = async key => {
    const res = await args.getValue(cell.toRelative(key));
    return typeof res === 'string' ? res : undefined;
  };
  const value = await getValue(args.key);

  if (typeof value !== 'string' || !formula.isFormula(value)) {
    return [];
  }

  const path = args.path ? `${args.path}` : args.key;
  const node = ast.toTree(value);

  /**
   * Cell (eg "=A1").
   */
  if (node.type === 'cell') {
    return done(await outgoingCell({ node, path, getValue }));
  }

  /**
   * Range (eg "=A1:B9").
   */
  if (node.type === 'cell-range') {
    return done(await outgoingRange({ node: node as ast.CellRangeNode, path, getValue }));
  }

  /**
   * Function (eg "=SUM(999, A1)").
   */
  if (node.type === 'function') {
    return done(await outgoingFunc({ node, path, getValue }));
  }

  if (node.type === 'binary-expression') {
    return done(await outgoingBinaryExpression({ node, path, getValue }));
  }

  // No match.
  return [];
}

/**
 * Process an outgoing cell reference (eg: "=A1")
 */
async function outgoingCell(args: {
  node: ast.CellNode;
  getValue: t.RefGetValue;
  path: string;
}): Promise<t.IRefOut[]> {
  const { node, getValue } = args;

  let path = args.path;
  let error: t.IRefError | undefined;
  let target: t.RefTarget = 'VALUE';
  const key = cell.toRelative(node.key);

  if (path.split('/').includes(key)) {
    error = {
      type: 'CIRCULAR',
      message: `Cell reference leads back to itself (${path}).`,
    };
  }

  if (!error && !cell.isCell(key)) {
    target = 'UNKNOWN';
    error = {
      type: 'NAME',
      message: `Unknown range: ${key}`,
    };
  }

  path = `${path}/${key}`;
  const value = !error ? await getValue(key) : undefined;

  // Process the forumla (if it is one).
  if (!error && value && formula.isFormula(value)) {
    const res = await outgoing({ getValue, key, path }); // <== RECURSION 🌳
    if (res.length > 0) {
      path = res[0].path;
      target = res[0].target;
    } else {
      target = 'FUNC';
    }
    const firstProblem = res.find(item => item.error);
    if (firstProblem) {
      error = firstProblem.error;
    }
  }

  // Prepare resulting reference.
  const ref: t.IRefOut = { target, path, error };
  return [ref];
}

/**
 * Process an outgoing cell reference (eg: "=A1:B9")
 */
async function outgoingRange(args: {
  node: ast.CellRangeNode;
  getValue: t.RefGetValue;
  path: string;
}): Promise<t.IRefOut[]> {
  const { node } = args;
  const cells = range.fromCells(node.left.key, node.right.key);
  const path = `${args.path}/${cells.key}`;
  const ref: t.IRefOut = { target: 'RANGE', path };

  // Check for circular-reference error.
  const parts = args.path.split('/');
  const isCircular = parts.some(key => cells.contains(key));
  if (isCircular) {
    ref.error = {
      type: 'CIRCULAR',
      message: `Range contains a cell that leads back to itself. (${path})`,
    };
  }

  // Finish up.
  return [ref];
}

/**
 * Process an outgoing function (eg: "=SUM(999, A1)")
 */
async function outgoingFunc(args: {
  node: ast.FunctionNode;
  getValue: t.RefGetValue;
  path: string;
}): Promise<t.IRefOut[]> {
  const { node, getValue } = args;
  let error: t.IRefError | undefined;

  const wait = node.arguments.map(async (param, i) => {
    if (isValueNode(param)) {
      return undefined; // An actual value, not a reference!
    }

    // Argument points to a range (eg: "A1:B9").
    if (param.type === 'cell-range') {
      const cell = param as ast.CellRangeNode;
      const left = cell.left.key;
      const right = cell.right.key;
      const path = `${args.path}/${left}:${right}`;

      const parts = args.path.split('/');
      const isCircular = parts.includes(left) || parts.includes(right);
      if (isCircular && !error) {
        error = {
          type: 'CIRCULAR',
          message: `Range contains a cell that leads back to itself. (${path})`,
        };
      }
      const ref: t.IRefOut = { target: 'RANGE', path, param: i, error };
      return ref;
    }

    // Lookup the reference the parameter points to.
    const cellNode = param as ast.CellNode;
    const path = `${args.path}/${cellNode.key}`;
    const targetKey = cell.toRelative(cellNode.key);
    const targetValue = await getValue(cellNode.key);
    const targetTree = ast.toTree(targetValue);

    const isCircular = args.path.split('/').includes(targetKey);
    if (isCircular && !error) {
      error = {
        type: 'CIRCULAR',
        message: `Function parameter ${i} contains a reference that leads back to itself. (${path})`,
      };
    }

    // TEMP 🐷 Do something with the circular error

    if (targetTree.type === 'function' || targetTree.type === 'binary-expression') {
      const ref: t.IRefOut = { target: 'FUNC', path, param: i };
      return ref;
    }

    const res = await outgoing({ key: targetKey, getValue, path }); // <== RECURSION 🌳
    if (res.length === 0) {
      const ref: t.IRefOut = { target: 'VALUE', path, param: i };
      return ref;
    } else {
      const parts = res[0].path.split('/');
      const end = parts[parts.length - 1];
      return { ...res[0], path: `${path}/${end}`, param: i };
    }
  });

  // Finish up.
  const refs = await Promise.all(wait);
  return refs.filter(e => e !== undefined) as t.IRefOut[];
}

/**
 * Process an outgoing binary-expression (eg: "=A1+5")
 */
async function outgoingBinaryExpression(args: {
  node: ast.BinaryExpressionNode;
  getValue: t.RefGetValue;
  path: string;
}): Promise<t.IRefOut[]> {
  const { getValue, path } = args;

  let index = 0;
  const toParts = async (expr: ast.BinaryExpressionNode, path: string) => {
    let parts: t.IRefOut[] = [];
    const parseEdge = async (node: ast.Node, path: string) => {
      if (node.type === 'binary-expression') {
        parts = [...parts, ...(await toParts(node, path))]; // <== RECURSION 🌳
      } else {
        if (node.type === 'cell') {
          const res = await outgoingCell({ getValue, node, path });
          parts = res.length > 0 ? [...parts, { ...res[0], param: index }] : parts;
        } else if (node.type === 'cell-range') {
          const res = await outgoingRange({ getValue, node: node as ast.CellRangeNode, path });
          parts = res.length > 0 ? [...parts, { ...res[0], param: index }] : parts;
        }
        index++;
      }
    };
    await parseEdge(expr.left, path);
    await parseEdge(expr.right, path);
    return parts;
  };

  return toParts(args.node, path);
}

/**
 * [Helpers]
 */

/**
 *  binary-expression    1+2
 *  cell                 =A1
 *  cell-range           A1:B9
 *  function             =SUM(1,2,3)
 *  logical              TRUE/FALSE
 *  number               123
 *  text                 "hello"
 *  unary-expression     -TRUE
 */
const VALUE_TYPES: Array<ast.Node['type']> = ['number', 'text', 'logical', 'unary-expression'];
function isValueNode(node: ast.Node) {
  return VALUE_TYPES.includes(node.type);
}

function deleteUndefined<T>(field: keyof T, items: T[]) {
  items.forEach(ref => {
    if (ref[field] === undefined) {
      delete ref[field];
    }
  });
  return items;
}
