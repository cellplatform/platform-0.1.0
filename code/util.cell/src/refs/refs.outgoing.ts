import { ast } from '../ast';
import { cell } from '../cell';
import { t } from '../common';
import { func } from '../func';
import { range } from '../range';
import * as util from './util';

export type IOutgoingArgs = {
  key: string;
  getValue: t.RefGetValue;
  cache?: t.IMemoryCache;
};

const CACHE = {
  PREFIX: 'REFS/out/',
};

/**
 * Calculate outgoing refs for given cell.
 */
export async function outgoing(args: IOutgoingArgs): Promise<t.IRefOut[]> {
  const { cache } = args;
  const cacheKey = `${CACHE.PREFIX}${args.key}`;
  if (cache && cache.exists(cacheKey)) {
    return cache.get(cacheKey);
  }
  const refs = await find(args);
  if (cache) {
    cache.put(cacheKey, refs);
  }
  return refs;
}

/**
 * [Internal]
 */

async function find(args: IOutgoingArgs & { path?: string }): Promise<t.IRefOut[]> {
  const done = (refs: t.IRefOut[]) => {
    refs = util.deleteUndefined('error', refs);
    return refs;
  };

  const getValue: t.RefGetValue = async key => {
    const res = await args.getValue(cell.toRelative(key));
    return typeof res === 'string' ? res : undefined;
  };
  const value = await getValue(args.key);

  if (typeof value !== 'string' || !func.isFormula(value)) {
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

  const isCircular = util.isCircularPath(path, key);
  path = `${path}/${key}`;

  if (isCircular) {
    error = {
      type: 'CIRCULAR',
      message: `Cell reference leads back to itself (${path})`,
      path,
    };
  }

  if (!error && !cell.isCell(key)) {
    target = 'UNKNOWN';
    error = {
      type: 'NAME',
      message: `Unknown range: ${key}`,
      path,
    };
  }

  const value = await getValue(key);
  const isFormula = func.isFormula(value);
  target = isFormula ? 'FUNC' : target;

  // Process the forumla (if it is one).
  if (!error && value && isFormula) {
    const res = await find({ getValue, key, path }); // <== RECURSION 🌳
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
      message: `Range contains a cell that leads back to itself (${path})`,
      path,
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
  const setCircularError = (index: number, path: string) => {
    error = {
      type: 'CIRCULAR',
      message: `Function parameter ${index} contains a reference that leads back to itself (${path})`,
      path,
    };
  };

  const wait = node.arguments.map(async (param, i) => {
    if (ast.isValueNode(param)) {
      return undefined; // An actual value, not a reference!
    }

    // Argument points to a range (eg: "A1:B9").
    if (param.type === 'cell-range') {
      const cell = param as ast.CellRangeNode;
      const left = cell.left.key;
      const right = cell.right.key;
      const range = `${left}:${right}`;
      const path = `${args.path}/${range}`;

      const parts = args.path.split('/');
      const isCircular = parts.includes(left) || parts.includes(right);
      if (isCircular && !error) {
        error = {
          type: 'CIRCULAR',
          message: `Range contains a cell that leads back to itself (${path})`,
          path,
        };
      }
      const ref: t.IRefOut = { target: 'RANGE', path, param: i, error };
      return ref;
    }

    // Lookup the reference the parameter points to.
    const cellNode = param as ast.CellNode;
    const key = cellNode.key;
    let path = `${args.path}/${key}`;
    const targetKey = cell.toRelative(key);
    const targetValue = await getValue(key);
    const targetTree = ast.toTree(targetValue);

    // Check for circular reference loop.
    let isCircular = util.isCircularPath(args.path, targetKey);
    if (isCircular && !error) {
      setCircularError(i, path);
    }

    // Check that the referenced function does not loop back to this cell.
    if (!isCircular && !error && targetTree.type === 'function') {
      const res = await outgoingFunc({ node: targetTree, getValue, path });
      const err = res
        .filter(ref => ref.error && ref.error.type === 'CIRCULAR')
        .map(ref => ref.error as t.IRefError)
        .find(err => util.isCircularPath(err.path, targetKey));
      if (err) {
        isCircular = true;
        path = err.path;
        setCircularError(i, path);
      }
    }

    if (targetTree.type === 'function' || targetTree.type === 'binary-expression') {
      const ref: t.IRefOut = { target: 'FUNC', path, param: i, error };
      return ref;
    }

    const res = isCircular ? [] : await find({ key: targetKey, getValue, path }); // <== RECURSION 🌳
    if (res.length === 0) {
      const ref: t.IRefOut = { target: 'VALUE', path, param: i, error };
      return ref;
    } else {
      const ref = res[0];
      const parts = ref.path.split('/');
      const end = parts[parts.length - 1];
      return { ...ref, path: `${path}/${end}`, param: i, error: ref.error || error };
    }
  });

  // Finish up.
  const refs = (await Promise.all(wait)) as t.IRefOut[];
  return refs
    .filter(e => e !== undefined)
    .map(ref => {
      if (ref.error && ref.error.type === 'CIRCULAR') {
        // NB:  Circular errors will return recursively deeper paths,
        //      ensure the deeper path is used.
        return { ...ref, path: ref.error.path };
      }
      return ref;
    });
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
  const toRefs = async (expr: ast.BinaryExpressionNode, path: string) => {
    let parts: t.IRefOut[] = [];
    const parseEdge = async (node: ast.Node, path: string) => {
      if (node.type === 'binary-expression') {
        parts = [
          ...parts,
          ...(await toRefs(node, path)), // <== RECURSION 🌳
        ];
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

  return toRefs(args.node, path);
}
