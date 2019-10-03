import { ast } from '../ast';
import { cell } from '../cell';
import { R, t } from '../common';
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
    let res: any = await args.getValue(cell.toRelative(key));
    res = typeof res === 'number' ? res.toString() : res;
    res = typeof res === 'string' ? res : undefined;
    return res;
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
    return done(await outgoingCellRef({ node, path, getValue }));
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

  /**
   * Binary expression (eg "=1+A1").
   */
  if (node.type === 'binary-expression') {
    return done(await outgoingBinaryExpression({ node, path, getValue }));
  }

  // No match.
  return [];
}

/**
 * Process an outgoing cell reference (eg: "=A1").
 */
async function outgoingCellRef(args: {
  node: ast.CellNode;
  getValue: t.RefGetValue;
  path: string;
}): Promise<t.IRefOut[]> {
  const { node, getValue } = args;

  let path = args.path;
  let error: t.IRefError | undefined;
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

  const value = await getValue(key);
  let target = util.toRefTarget(value, 'VALUE');

  if (!error && !cell.isCell(key)) {
    target = 'UNKNOWN';
    error = {
      type: 'NAME',
      message: `Unknown range: ${key}`,
      path,
    };
  }

  // Process the forumla (if it is one).
  if (!isCircular && value && func.isFormula(value)) {
    const res = await find({ key, path, getValue }); // <== RECURSION 🌳
    if (!util.isFunc(value) && res.length > 0) {
      path = res[0].path;
      target = res[0].target;
    }

    const firstError = res.find(item => item.error);
    if (firstError) {
      error = firstError.error;
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

  const wait = node.arguments.map(async (paramNode, i) => {
    const param = i.toString();

    if (ast.isValueNode(paramNode)) {
      return undefined; // An actual value, not a reference!
    }

    // Argument points to a range (eg: "A1:B9").
    if (paramNode.type === 'cell-range') {
      const cell = paramNode as ast.CellRangeNode;
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
      const ref: t.IRefOut = { target: 'RANGE', path, param, error };
      return ref;
    }

    // Argument is an embedded expression (eg "1+A1").
    if (paramNode.type === 'binary-expression') {
      const path = args.path;
      const res = await outgoingBinaryExpression({ node: paramNode, getValue, path });
      return res.map(ref => ({ ...ref, param: `${param}/${ref.param || 0}`, error }));
    }

    // Lookup the reference the parameter points to.
    const cellNode = paramNode as ast.CellNode;
    const key = cellNode.key;
    const path = `${args.path}/${key}`;
    const targetKey = cell.toRelative(key);
    const targetValue = await getValue(key);
    const targetNode = ast.toTree(targetValue);

    // Check for circular reference loop.
    let isCircular = util.isCircularPath(args.path, targetKey);
    if (isCircular && !error) {
      setCircularError(i, path);
    }

    // Check that the referenced function does not loop back to this cell.
    if (!isCircular && !error && targetNode.type === 'function') {
      const res = await outgoingFunc({ node: targetNode, getValue, path });
      const err = res
        .filter(ref => ref.error && ref.error.type === 'CIRCULAR')
        .map(ref => ref.error as t.IRefError)
        .find(err => util.isCircularPath(err.path, targetKey));
      if (err) {
        isCircular = true;
        setCircularError(i, err.path);
      }
    }

    // If the target is a function (eg "=SUM(...)") or binary-expression (eg "=1+A1")
    // then stop at this point and return as a FUNC reference.
    if (util.isFunc(targetNode)) {
      const ref: t.IRefOut = { target: 'FUNC', path, error, param };
      return ref;
    }

    // Lookup the reference.
    const res = isCircular ? [] : await find({ key: targetKey, getValue, path }); // <== RECURSION 🌳
    if (res.length === 0) {
      const target = util.toRefTarget(targetValue);
      const ref: t.IRefOut = { target, path, error, param: i.toString() };
      return ref;
    } else {
      const ref = res[0];
      const parts = ref.path.split('/');
      const end = parts[parts.length - 1];
      return {
        ...ref,
        path: `${path}/${end}`,
        param: i.toString(),
        error: ref.error || error,
      };
    }
  });

  // Finish up.
  const refs = (await Promise.all(wait)) as t.IRefOut[];
  return R.flatten(refs).filter(e => e !== undefined);
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

  const parseCellRef = async (args: { node: ast.CellNode; path: string; param: string }) => {
    const { node, path, param } = args;
    const res = await outgoingCellRef({ getValue, node, path });
    let ref = res[0];
    if (!ref) {
      return;
    }
    if (ref.error && ref.error.type === 'CIRCULAR') {
      const value = await getValue(node.key);
      ref = {
        ...ref,
        target: util.toRefTarget(value),
        path: ref.error.path.substring(0, ref.error.path.lastIndexOf('/')),
      };
    }
    return { ...ref, param };
  };

  let index = 0;
  const toRefs = async (expr: ast.BinaryExpressionNode, path: string, level = 0) => {
    let parts: t.IRefOut[] = [];

    const parseEdge = async (node: ast.Node, path: string) => {
      const param = index.toString();
      if (node.type === 'binary-expression') {
        parts = [
          ...parts,
          ...(await toRefs(node, path, level + 1)), // <== RECURSION 🌳
        ];
      } else {
        if (node.type === 'cell') {
          const ref = await parseCellRef({ node, path, param });
          parts = ref ? [...parts, ref] : parts;
        }
        if (node.type === 'cell-range') {
          const res = await outgoingRange({ getValue, node: node as ast.CellRangeNode, path }); // <== RECURSION 🌳
          parts = res.length > 0 ? [...parts, { ...res[0], param }] : parts;
        }
        if (node.type === 'function') {
          let res = await outgoingFunc({ getValue, node: node as ast.FunctionNode, path }); // <== RECURSION 🌳
          if (res.length > 0) {
            res = res.map(ref => ({ ...ref, param: `${param}/${ref.param || 0}` }));
            parts = [...parts, ...res];
          }
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
