import { t, util, formula, coord, R } from '../../common';

/**
 * Calculate outgoing refs for given cell.
 */
export async function outgoing(args: {
  key: string;
  ctx: t.IRefContext;
  path?: string;
}): Promise<t.IRefOut[]> {
  const { ctx } = args;
  const cell = await getCell(args);
  const value = cell.value;
  let error: t.RefError | undefined;

  if (typeof value !== 'string' || !formula.isFormula(cell.value)) {
    return [];
  }

  let path = args.path ? `${args.path}` : args.key;
  const tree = coord.ast.toTree(value);

  const isCell = (node: coord.ast.Node) => node.type === 'cell' && coord.cell.isCell(node.key);

  /**
   * Cell
   */
  if (tree.type === 'cell' && isCell(tree)) {
    const targetKey = coord.cell.toRelative(tree.key);
    const targetCell = await getCell({ ctx, key: targetKey });

    const isCircular = path.split('/').includes(targetKey);
    if (isCircular && !error) {
      error = 'CIRCULAR';
    }

    let target: t.RefTarget = 'VALUE';
    path = `${path}/${targetKey}`;

    // Process the forumla (if it is one).
    if (!isCircular && formula.isFormula(targetCell && targetCell.value)) {
      const res = await outgoing({ ctx, key: targetKey, path }); // <== RECURSION 🌳
      if (res.length > 0) {
        path = res[0].path;
        target = res[0].target;
      } else {
        target = 'FUNC';
      }
      if (res.some(item => item.error === 'CIRCULAR')) {
        error = 'CIRCULAR';
      }
    }

    // Prepare reference.
    const ref: t.IRefOut = error ? { target, path, error } : { target, path };
    return [ref];
  }

  /**
   * Function
   */
  if (tree.type === 'function') {
    const wait = tree.arguments.map(async (arg, i) => {
      if (isValueNode(arg)) {
        return undefined; // An actual value, not a reference!
      }

      if (arg.type === 'cell-range') {
        // TEMP 🐷 Check for circular error in range.

        const cell = arg as coord.ast.CellRangeNode;
        const left = cell.left.key;
        const right = cell.right.key;
        const range = `${left}:${right}`;
        const argPath = `${path}/${range}`;

        const parts = path.split('/');
        const isCircular = parts.includes(left) || parts.includes(right);
        if (isCircular && !error) {
          error = 'CIRCULAR';
        }
        // TEMP 🐷 Do something with the circular error

        const ref: t.IRefOut = { target: 'RANGE', path: argPath, param: i };
        return ref;
      }
      const cell = arg as coord.ast.CellNode;

      const argPath = `${path}/${cell.key}`;
      const targetKey = coord.cell.toRelative(cell.key);
      const targetCell = await getCell({ ctx, key: targetKey });
      const targetValue = typeof targetCell.value === 'string' ? targetCell.value : undefined;
      const targetTree = coord.ast.toTree(targetValue);

      const isCircular = path.split('/').includes(targetKey);
      if (isCircular && !error) {
        error = 'CIRCULAR';
      }

      // TEMP 🐷 Do something with the circular error

      if (targetTree.type === 'function' || targetTree.type === 'binary-expression') {
        const ref: t.IRefOut = { target: 'FUNC', path: argPath, param: i };
        return ref;
      }

      const res = await outgoing({ ctx, key: targetKey, path }); // <== RECURSION 🌳
      if (res.length === 0) {
        const ref: t.IRefOut = { target: 'VALUE', path: argPath, param: i };
        return ref;
      } else {
        const parts = res[0].path.split('/');
        const end = parts[parts.length - 1];
        return { ...res[0], path: `${argPath}/${end}`, param: i };
      }
    });

    const refs = (await Promise.all(wait)).filter(e => e !== undefined) as t.IRefOut[];
    return refs;
  }

  /**
   * Binary expression (eg "=A1 + 5").
   */
  if (tree.type === 'binary-expression') {
    console.log('BINARY');

    // console.log('tree', tree);

    let ref: t.IRefOut = { target: 'FUNC', path };
    ref = error ? { ...ref, error } : ref;
    return [ref];
  }

  /**
   * Range (eg "A1:B9")
   */
  if (tree.type === 'cell-range') {
    const range = coord.range.fromKey(value);
    const ref: t.IRefOut = { target: 'RANGE', path: `${path}/${range.key}` };
    return [ref];
  }

  // No match.
  return [];
}

/**
 * [Helpers]
 */

async function getCell(args: { key: string; ctx: t.IRefContext }) {
  const { key, ctx } = args;
  let cell = await ctx.getCell(args.key);
  cell = cell.hash ? cell : { ...cell, hash: util.cellHash(key, cell) };
  return cell;
}

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
const VALUE_TYPES: Array<coord.ast.Node['type']> = [
  'number',
  'text',
  'logical',
  'unary-expression',
];
function isValueNode(node: coord.ast.Node) {
  return VALUE_TYPES.includes(node.type);
}
