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

  const done = (refs: t.IRefOut[]) => {
    refs.forEach(ref => {
      if (!ref.error) {
        delete ref.error;
      }
    });
    return refs;
  };

  if (typeof value !== 'string' || !formula.isFormula(cell.value)) {
    return [];
  }

  const path = args.path ? `${args.path}` : args.key;
  const node = coord.ast.toTree(value);

  /**
   * Cell (eg "=A1").
   */
  if (node.type === 'cell') {
    return done(await outgoingRef({ node, ctx, path }));
  }

  /**
   * Range (eg "=A1:B9").
   */
  if (node.type === 'cell-range') {
    return done(await outgoingRange({ node: node as coord.ast.CellRangeNode, ctx, path }));
  }

  /**
   * Function (eg "=SUM(999, A1)").
   */
  if (node.type === 'function') {
    return done(await outgoingFunc({ node, ctx, path }));
  }

  /**
   * Binary expression (eg "=A1 + 5").
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

  if (node.type === 'binary-expression') {
    return fromBinaryExpr(node, []);
  }

  // No match.
  return [];
}

/**
 * Process an outgoing cell reference (eg: "=A1")
 */
async function outgoingRef(args: {
  node: coord.ast.CellNode;
  ctx: t.IRefContext;
  path: string;
}): Promise<t.IRefOut[]> {
  const { node, ctx } = args;

  let path = args.path;
  let error: t.IRefError | undefined;
  let target: t.RefTarget = 'VALUE';
  const key = coord.cell.toRelative(node.key);

  if (path.split('/').includes(key)) {
    error = {
      type: 'CIRCULAR',
      message: `Cell reference leads back to itself (${path}).`,
    };
  }

  if (!error && !coord.cell.isCell(key)) {
    target = 'UNKNOWN';
    error = {
      type: 'NAME',
      message: `Unknown range: ${key}`,
    };
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
  const ref: t.IRefOut = { target, path, error };
  return [ref];
}

/**
 * Process an outgoing cell reference (eg: "=A1:B9")
 */
async function outgoingRange(args: {
  node: coord.ast.CellRangeNode;
  ctx: t.IRefContext;
  path: string;
}): Promise<t.IRefOut[]> {
  const { node } = args;
  const range = coord.range.fromCells(node.left.key, node.right.key);
  const path = `${args.path}/${range.key}`;
  const ref: t.IRefOut = { target: 'RANGE', path };

  // Check for circular-reference error.
  const parts = args.path.split('/');
  const isCircular = parts.some(key => range.contains(key));
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
  node: coord.ast.FunctionNode;
  ctx: t.IRefContext;
  path: string;
}): Promise<t.IRefOut[]> {
  const { node, ctx } = args;
  let error: t.IRefError | undefined;

  const wait = node.arguments.map(async (param, i) => {
    if (isValueNode(param)) {
      return undefined; // An actual value, not a reference!
    }

    // Argument points to a range (eg: "A1:B9").
    if (param.type === 'cell-range') {
      // TEMP 🐷 Check for circular error in range.

      const cell = param as coord.ast.CellRangeNode;
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
      // TEMP 🐷 Do something with the circular error

      const ref: t.IRefOut = { target: 'RANGE', path, param: i, error };
      return ref;
    }

    // Lookup the reference the parameter points to.
    const cell = param as coord.ast.CellNode;
    const path = `${args.path}/${cell.key}`;
    const targetKey = coord.cell.toRelative(cell.key);
    const targetCell = await getCell({ ctx, key: cell.key });
    const targetValue = typeof targetCell.value === 'string' ? targetCell.value : undefined;
    const targetTree = coord.ast.toTree(targetValue);

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

    const res = await outgoing({ ctx, key: targetKey, path }); // <== RECURSION 🌳
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
