import { t, value } from '../common';
import { ast } from '../ast';
import { isFormula } from './util';

const getExprFunc = async (getFunc: t.GetFunc, operator: ast.BinaryExpressionNode['operator']) => {
  if (operator === '+') {
    return getFunc({ name: 'SUM', namespace: 'sys' });
  }

  // TEMP 🐷 TODO - all the other expressions: '>' | '<' | '=' | '>=' | '<=' | '+' | '-' | '&'

  return undefined;
};

const getParamRefValue = async (args: {
  key: string;
  index: number;
  refs: t.IRefs;
  getValue: t.RefGetValue;
}) => {
  const { key, index, refs, getValue } = args;
  const outRefs = refs.out[key] || [];
  const ref = outRefs.find(ref => ref.param === index);

  if (!ref) {
    return undefined;
  }

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
  node: ast.Node;
  index: number;
  refs: t.IRefs;
  getValue: t.RefGetValue;
  getFunc: t.GetFunc;
}) => {
  const { node, key, refs, getValue, getFunc, index } = args;

  if (ast.isValueNode(node)) {
    return (node as any).value;
  }
  if (node.type === 'binary-expression') {
    return evaluateExpr({ key, refs, getValue, getFunc, node: node });
  }
  if (node.type === 'cell') {
    return getParamRefValue({ key, refs, getValue, index });
  }
  if (node.type === 'cell-range') {
    // TEMP 🐷 TODO - look up RANGE
  }
};

const evaluateExpr = async (args: {
  key: string;
  node: ast.BinaryExpressionNode;
  refs: t.IRefs;
  getValue: t.RefGetValue;
  getFunc: t.GetFunc;
  level?: number;
}) => {
  const { key, node, refs, getValue, getFunc, level = 0 } = args;

  const func = await getExprFunc(getFunc, node.operator);
  if (!func) {
    const err = `Binary expression operator '${node.operator}' is not mapped to a corresponding function.`;
    throw new Error(err);
  }

  const toValue = async (node: ast.Node, param: number) => {
    return node.type === 'binary-expression'
      ? evaluateExpr({ key, refs, getValue, getFunc, node: node, level: level + 1 }) // <== RECURSION 🌳
      : toParamValue({ key, node, index: param, getValue, getFunc, refs });
  };

  // Retrieve left/right parameters.
  const left = await toValue(node.left, level + 0);
  const right = await toValue(node.right, level + 1);
  const params = [left, right];

  // Invoke the function.
  const res: t.FuncResponse = await func({ params });
  return res;
};

/**
 * Calculate.
 */
export async function calculate<D = any>(args: {
  key: string;
  refs: t.IRefs;
  getValue: t.RefGetValue;
  getFunc: t.GetFunc;
}): Promise<t.IFuncResponse<D>> {
  const { key, refs, getValue, getFunc } = args;
  const formula = (await getValue(key)) || '';

  const node = isFormula(formula) ? ast.toTree(formula) : undefined;

  if (!node || !(node.type === 'function' || node.type === 'binary-expression')) {
    const error: t.IFuncError = {
      type: 'NOT_FORMULA',
      message: `The value of cell ${key} is not a formula. Must start with "=".`,
      cell: { key, value: formula },
    };

    const res: t.IFuncResponse = {
      ok: false,
      cell: key,
      formula,
      error,
    };
    return res;
  }

  let data: any;
  if (node.type === 'binary-expression') {
    const ast = node as ast.BinaryExpressionNode;
    const res = await evaluateExpr({ key, node: ast, refs, getValue, getFunc });
    data = res;
  }

  if (node.type === 'function') {
    const ast = node as ast.FunctionNode;
    const name = ast.name;
    const namespace = ast.namespace || 'sys'; // TEMP 🐷 'sys'.
    const func = await getFunc({ name, namespace });
    if (func) {
      const wait = ast.arguments.map(async (node, i) => {
        return toParamValue({ key, node, index: i, getValue, getFunc, refs });
      });
      const params = await Promise.all(wait);
      data = await func({ params });
    }
  }

  // Finish up.
  const res: t.IFuncResponse<D> = { ok: true, cell: key, formula, data };
  return res;
}
