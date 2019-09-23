import { R, coord, formula, t, util } from '../../common';

/**
 * TODO 🐷
 * - source (type)
 * - memory `cache` passed through `ctx`
 * - check out `unary-express` - make sure not missing something.
 * - `RefError` to object: => { type: '...', message: string }
 */

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
  let error: t.IRefError | undefined;

  if (typeof value !== 'string' || !formula.isFormula(cell.value)) {
    return [];
  }

  const path = args.path ? `${args.path}` : args.key;
  const tree = coord.ast.toTree(value);

  /**
   * [Cell]
   */
  if (tree.type === 'cell') {
    return outgoingRef({ key: tree.key, ctx, path });
  }

  /**
   * [Function]
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
          error = {
            type: 'CIRCULAR',
            message: `Range contains a cell that leads back to itself.`,
          };
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
        error = {
          type: 'CIRCULAR',
          message: `Function parameter ${i} contains a reference that leads back to itself (${path}).`,
        };
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
   * [Binary] expression (eg "=A1 + 5").
   */
  const fromBinaryExpr = (node: coord.ast.BinaryExpressionNode, refs: t.IRefOut[]) => {
    const addRef = (cellNode: coord.ast.CellNode) => {
      // const param = refs.length + 1;

      console.log(`\nTODO 🐷  binary-expression param on FUNC return \n`);

      let ref: t.IRefOut = { target: 'FUNC', path: `${path}/${cellNode.key}` };
      ref = error ? { ...ref, error } : ref;
      refs = [...refs, ref];
    };

    const parseEdge = (node: coord.ast.Node) => {
      if (node.type === 'cell') {
        addRef(node);
      }
      if (node.type === 'binary-expression') {
        refs = [...refs, ...fromBinaryExpr(node, refs)]; // <== RECURSION 🌳
      }
    };

    parseEdge(node.left);
    parseEdge(node.right);

    // TEMP 🐷 FIX - don't use .uniq | should not be adding double-ups.

    refs = R.uniq(refs);

    return refs;
  };

  if (tree.type === 'binary-expression') {
    return fromBinaryExpr(tree, []);
  }

  /**
   * [Range] (eg "A1:B9")
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
 * Process an outgoing cell reference (eg: "=A1").
 */
async function outgoingRef(args: { key: string; ctx: t.IRefContext; path: string }) {
  const { ctx } = args;
  let path = args.path;
  let error: t.IRefError | undefined;
  let target: t.RefTarget = 'VALUE';
  const key = coord.cell.toRelative(args.key);

  if (path.split('/').includes(key)) {
    error = {
      type: 'CIRCULAR',
      message: `Cell reference leads back to itself (${path}).`,
    };
  }

  if (!error && !coord.cell.isCell(key)) {
    error = {
      type: 'NAME',
      message: `Unknown range: ${key}`,
    };
    target = 'UNKNOWN';
  }

  path = `${path}/${key}`;
  const cell = !error ? await getCell({ ctx, key }) : undefined;

  // Process the forumla (if it is one).
  if (!error && cell && formula.isFormula(cell.value)) {
    const res = await outgoing({ ctx, key, path }); // <== RECURSION 🌳
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
  const ref: t.IRefOut = error ? { target, path, error } : { target, path };
  return [ref];
}

/**
 * [Helpers]
 */
async function getCell(args: { key: string; ctx: t.IRefContext }) {
  const { ctx } = args;
  const key = coord.cell.toRelative(args.key);
  let cell = (await ctx.getCell(key)) || {};
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
