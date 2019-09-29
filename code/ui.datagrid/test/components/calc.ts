import { coord, t, value } from '../common';

type FuncParam = t.Json | undefined;
type FuncResponse = {};
type FuncInvoker = (args: { params: FuncParam[] }) => Promise<FuncResponse>;
type GetFunc = (args: { namespace: string; name: string }) => Promise<FuncInvoker | undefined>;

const sum: FuncInvoker = async args => {
  const params = (args.params || []).map((item, i) => {
    if (typeof item === 'string') {
      item = value.toNumber(item);
    }
    if (!(typeof item === 'number' || typeof item === 'bigint')) {
      const err = `SUM: parameter [${i}] of type '${typeof item}' is not valid. Must be a number. (${item})`;
      throw new Error(err);
    }
    return item as number;
  });

  return params.reduce((acc, next) => acc + next, 0);
};

export const getFunc: GetFunc = async args => {
  const { namespace, name } = args;
  if (namespace === 'sys' && name === 'SUM') {
    return sum;
  }
  return undefined; // Not found.
};

const getExprFunc = async (operator: coord.ast.BinaryExpressionNode['operator']) => {
  if (operator === '+') {
    return getFunc({ name: 'SUM', namespace: 'sys' });
  }

  // TEMP 🐷 TODO - all the other expressions: '>' | '<' | '=' | '>=' | '<=' | '+' | '-' | '&'

  const err = `Binary expression operator '${operator}' does not have a corresponding function.`;
  throw new Error(err);
};

const getParamValue = async (args: {
  key: string;
  index: number;
  refs: t.IRefs;
  getValue: t.RefGetValue;
}) => {
  const { key, index, refs, getValue } = args;

  const outRefs = refs.out[key] || [];
  const ref = outRefs.find(ref => ref.param === index);

  // console.log('CELL lookup', node.key);
  // console.log('refs', refs);
  // console.log('outRefs', outRefs);
  // console.log('ref', ref);
  // console.log('param', param);

  if (ref) {
    const parts = ref.path.split('/');
    const targetKey = parts[parts.length - 1];

    console.log('targetKey', targetKey);
    const res = await getValue(targetKey); // TEMP 🐷 TODO - perform FUNC calculation on value if necessary.
    console.log('f', res);
    return res;
    // const res = await calc({ key: targetKey, refs, getFunc, getValue });
    // console.log('res', res);
  }

  return undefined;
};

const toParamValue = async (args: {
  key: string;
  node: coord.ast.Node;
  index: number;
  refs: t.IRefs;
  getValue: t.RefGetValue;
}) => {
  const { node, key, refs, getValue, index } = args;

  if (coord.ast.isValueNode(node)) {
    return (node as any).value;
  }
  if (node.type === 'binary-expression') {
    return evalExpr({ key, refs, getValue, getFunc, ast: node });
  }
  if (node.type === 'cell') {
    return getParamValue({ key, refs, getValue, index });
  }
  if (node.type === 'cell-range') {
    // TEMP 🐷 TODO - look up RANGE
  }
};

const evalExpr = async (args: {
  key: string;
  ast: coord.ast.BinaryExpressionNode;
  refs: t.IRefs;
  getValue: t.RefGetValue;
  getFunc: GetFunc;
  level?: number;
}) => {
  const { key, ast, refs, getValue, getFunc, level = 0 } = args;
  const func = await getExprFunc(ast.operator);
  const toValue = async (node: coord.ast.Node, param: number) => {
    return node.type === 'binary-expression'
      ? evalExpr({ key, refs, getValue, getFunc, ast: node, level: level + 1 }) // <== RECURSION 🌳
      : toParamValue({ key, node, index: param, getValue, refs });
  };

  /**
   * - both value (eval)
   * - REF (look up)
   * - BINARY EXPRESSION (recursion)
   */

  const left = await toValue(ast.left, level + 0);
  const right = await toValue(ast.right, level + 1);
  const params = [left, right];

  // params = right !== undefined ? [...params, right] : params;
  // console.log(' >> ', level, params);

  console.group('🌳 evalExpr');
  console.log('ast', ast);
  console.log('ast.left', ast.left);
  console.log('ast.right', ast.right);

  console.log('params', params);
  console.log('left', left);
  console.log('right', right);

  const res = await func({ params });
  console.log('res', res);

  console.groupEnd();

  // const res =
  return res;
};

/**
 * Calculate.
 */
export const calc = async (args: {
  key: string;
  refs: t.IRefs;
  getValue: t.RefGetValue;
  getFunc: GetFunc;
}) => {
  const { key, refs, getValue, getFunc } = args;
  const value = await getValue(key);
  const node = coord.ast.toTree(value);
  let data: any;

  if (!(node.type === 'function' || node.type === 'binary-expression')) {
    return { ok: false, data };
  }

  if (node.type === 'binary-expression') {
    const ast = node as coord.ast.BinaryExpressionNode;
    const res = await evalExpr({ key, ast, refs, getValue, getFunc });
    data = res;
  }

  if (node.type === 'function') {
    const ast = node as coord.ast.FunctionNode;
    const name = ast.name;
    const namespace = ast.namespace || 'sys'; // TEMP 🐷 'sys'.
    const func = await getFunc({ name, namespace });
    if (func) {
      const wait = ast.arguments.map(async (node, i) => {
        return toParamValue({ key, node, index: i, getValue, refs });
      });
      const params = await Promise.all(wait);
      const res = await func({ params });
      console.log('res', res);
      data = res;
    }
  }

  // Finish up.
  return { ok: true, data };
};
