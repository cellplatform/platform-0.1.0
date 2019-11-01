import { ast } from '../ast';
import { cell } from '../cell';
import { R, t } from '../common';
import { CellRange } from '../range/CellRange';
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

  if (typeof value !== 'string' || !util.isFormula(value)) {
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

  const isCircular = util.path(path).includes(key);
  path = `${path}/${key}`;

  if (isCircular) {
    const refError: t.IRefErrorCircular = {
      type: 'REF/circular',
      message: `The cell ${cell} contains a circular reference (${path}).`,
      path,
    };
    error = refError;
  }

  const value = await getValue(key);
  let target = util.toRefTarget(value, 'VALUE');

  if (!error && !cell.isCell(key)) {
    target = 'UNKNOWN';
    const refError: t.IRefErrorName = {
      type: 'REF/name',
      message: `Unknown range: ${key}`,
      path,
    };
    error = refError;
  }

  // Process the forumla (if it is one).
  if (!isCircular && value && util.isFormula(value)) {
    const res = await find({ key, path, getValue }); // <== RECURSION 🌳
    if (!util.isFunc(value) && res.length > 0) {
      path = res[0].path;
      target = res[0].target;
    }
    const first = res.find(item => item.error);
    if (first) {
      error = first.error;
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
  param?: string;
}): Promise<t.IRefOut[]> {
  const { node, param, getValue } = args;
  const range = CellRange.fromCells(node.left.key, node.right.key);
  const path = `${args.path}/${range.key}`;
  let error: t.IRefError | undefined;

  // Check for circular-reference error.
  const isCircular = await isRangeCircular({ range, path, getValue });
  if (isCircular) {
    const refError: t.IRefErrorCircular = {
      type: 'REF/circular',
      message: `Range contains a circular reference (${path})`,
      path,
    };
    error = refError;
  }

  // Construct reference.
  let ref: t.IRefOut = { target: 'RANGE', path };
  ref = error ? { ...ref, error } : ref;
  ref = param ? { ...ref, param } : ref;

  // Finish up.
  return [ref];
}

/**
 * Determine if the given range contains a circular reference to itself.
 */
async function isRangeCircular(args: { path: string; range: CellRange; getValue: t.RefGetValue }) {
  const { path, getValue } = args;

  const isKeyContained = (range: CellRange, keys: string[]) => {
    return keys.some(key => range.contains(key));
  };

  // Check for immediate self-reference within range.
  if (isKeyContained(args.range, util.path(args.path).parts)) {
    return true;
  }

  const getValues = async (range: CellRange) => {
    const wait = range.keys.map(async key => {
      const value = (await args.getValue(key)) as string;
      return { key, value };
    });
    return (await Promise.all(wait)).filter(({ value }) => typeof value === 'string');
  };

  // Lookup values in the range.
  const values = (await getValues(args.range))
    .filter(({ value }) => value !== undefined)
    .filter(({ value }) => util.isFormula(value));

  // Check if referenced REF's exist within the range.
  const refValues = values.filter(({ value }) => util.isRef(value));
  if (isKeyContained(args.range, refValues.map(({ key }) => key))) {
    return true;
  }

  // Check if referenced RANGE's refer back to this range.
  const rangeValues = values.filter(({ value }) => util.isRange(value));
  for (const item of rangeValues) {
    if (item.key !== args.range.key) {
      const range = CellRange.fromKey(item.value);
      const isChildRangeContained = await isRangeCircular({ range, path, getValue }); // <== RECURSION 🌳
      if (isChildRangeContained) {
        return true;
      }
    }
  }

  // Not circular.
  return false;
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
    const refError: t.IRefErrorCircular = {
      type: 'REF/circular',
      message: `Function parameter ${index} contains a circular reference (${path})`,
      path,
    };
    error = refError;
  };

  const wait = node.arguments.map(async (paramNode, i) => {
    const param = i.toString();

    if (ast.isValueNode(paramNode)) {
      return undefined; // An actual value, not a reference!
    }

    // Argument points to a range (eg: "A1:B9").
    if (paramNode.type === 'cell-range') {
      const rangeNode = paramNode as ast.CellRangeNode;
      const res = await outgoingRange({ node: rangeNode, getValue, path: args.path, param });
      return res[0];
    }

    // Argument is an embedded expression (eg "1+A1").
    if (paramNode.type === 'binary-expression') {
      const path = args.path;
      const res = await outgoingBinaryExpression({ node: paramNode, getValue, path });
      return res.map(ref => ({
        ...ref,
        param: `${param}/${ref.param || 0}`,
      }));
    }

    // Argument is an embedded function (eg "SUM(1,2)").
    if (paramNode.type === 'function') {
      const path = args.path;
      const res = await outgoingFunc({ node: paramNode, getValue, path });
      return res.map(ref => ({
        ...ref,
        param: `${param}/${ref.param || 0}`,
      }));
    }

    // Lookup the reference the parameter points to.
    const cellNode = paramNode as ast.CellNode;
    const key = cellNode.key;
    const path = `${args.path}/${key}`;
    const targetKey = cell.toRelative(key);
    const targetValue = await getValue(key);
    const targetNode = ast.toTree(targetValue);

    // Check for circular reference loop.
    let isCircular = util.path(args.path).includes(targetKey);
    if (isCircular && !error) {
      setCircularError(i, path);
    }

    // Check that the referenced function does not loop back to this cell.
    if (!isCircular && !error && targetNode.type === 'function') {
      const res = await outgoingFunc({ node: targetNode, getValue, path });
      const err = res
        .filter(ref => ref.error && ref.error.type === 'REF/circular')
        .map(ref => ref.error as t.IRefError)
        .find(err => util.path(err.path).includes(targetKey));
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
      const ref: t.IRefOut = { target, path, error, param };
      return ref;
    } else {
      const ref = res[0];
      const end = util.path(ref.path).last;
      return {
        ...ref,
        param,
        path: `${path}/${end}`,
        error: ref.error || error,
      };
    }
  });

  // Finish up.
  const refs = (await Promise.all(wait)) as t.IRefOut[];
  return R.flatten(refs).filter(e => e !== undefined);
}

/**
 * Process an outgoing binary-expression (eg: "=A1+5").
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
    if (ref.error && ref.error.type === 'REF/circular') {
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
