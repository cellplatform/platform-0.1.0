import { ast } from '../ast';
import { t, value } from '../common';
import { isFormula } from './util';

const getExprFunc = async (getFunc: t.GetFunc, operator: ast.BinaryExpressionNode['operator']) => {
  if (operator === '+') {
    return getFunc({ name: 'SUM', namespace: 'sys' });
  }

  // TEMP 🐷 TODO - all the other expressions: '>' | '<' | '=' | '>=' | '<=' | '+' | '-' | '&'

  return undefined;
};

const getParamRefValue = async (args: {
  cell: string;
  index: number;
  refs: t.IRefs;
  getValue: t.RefGetValue;
}) => {
  const { cell, index, refs, getValue } = args;
  const outRefs = refs.out[cell] || [];
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
  cell: string;
  formula: string;
  node: ast.Node;
  index: number;
  refs: t.IRefs;
  getValue: t.RefGetValue;
  getFunc: t.GetFunc;
}) => {
  const { node, cell, formula, refs, getValue, getFunc, index } = args;

  if (ast.isValueNode(node)) {
    return (node as any).value;
  }
  if (node.type === 'binary-expression') {
    return evaluateExpr({ cell, formula, refs, getValue, getFunc, node });
  }
  if (node.type === 'function') {
    return evaluateFunc({ cell, formula, refs, getValue, getFunc, node });
  }
  if (node.type === 'cell') {
    return getParamRefValue({ cell, refs, getValue, index });
  }
  if (node.type === 'cell-range') {
    // TEMP 🐷 TODO - look up RANGE
  }
};

const evaluateExpr = async (args: {
  cell: string;
  formula: string;
  node: ast.BinaryExpressionNode;
  refs: t.IRefs;
  getValue: t.RefGetValue;
  getFunc: t.GetFunc;
  level?: number;
}) => {
  const { cell, formula, node, refs, getValue, getFunc, level = 0 } = args;

  const func = await getExprFunc(getFunc, node.operator);
  if (!func) {
    const err = `Binary expression operator '${node.operator}' is not mapped to a corresponding function.`;
    throw new Error(err);
  }

  const toValue = async (node: ast.Node, param: number) => {
    return node.type === 'binary-expression'
      ? evaluateExpr({ cell, formula, refs, getValue, getFunc, node, level: level + 1 }) // <== RECURSION 🌳
      : toParamValue({ cell, formula, node, index: param, getValue, getFunc, refs });
  };

  // Retrieve left/right parameters.
  const left = await toValue(node.left, level + 0);
  const right = await toValue(node.right, level + 1);
  const params = [left, right];

  // Invoke the function.
  const res: t.FuncResponse = await func({ params });
  return res;
};

const evaluateFunc = async (args: {
  cell: string;
  formula: string;
  node: ast.FunctionNode;
  refs: t.IRefs;
  getValue: t.RefGetValue;
  getFunc: t.GetFunc;
  level?: number;
}) => {
  const { cell, formula, node, refs, getValue, getFunc, level = 0 } = args;
  const name = node.name;
  const namespace = node.namespace || 'sys';

  // Lookup the function.
  const func = await getFunc({ name, namespace });
  if (!func) {
    throw toError({
      type: 'NOT_FOUND',
      message: `The function [${namespace}.${name}] was not found.`,
      cell: { key: cell, value: formula },
    });
  }

  // Calculate parameter values.
  const params = await Promise.all(
    node.arguments.map(async (node, index) =>
      toParamValue({ cell, formula, node, index, getValue, getFunc, refs }),
    ),
  );

  // Invoke the function.
  const res: t.FuncResponse = await func({ params });
  return res;
};

const toError = (args: t.IFuncError): t.IFuncError => {
  const error = (new Error(args.message) as unknown) as t.IFuncError;
  error.cell = args.cell;
  error.type = args.type;
  return error;
};
const fromError = (err: any): t.IFuncError => {
  if (err.type) {
    const { type, message, cell } = err as t.IFuncError;
    return { type, message, cell };
  } else {
    throw err;
  }
};

/**
 * Calculate.
 */
export async function calculate<D = any>(args: {
  cell: string;
  refs: t.IRefs;
  getValue: t.RefGetValue;
  getFunc: t.GetFunc;
}): Promise<t.IFuncResponse<D>> {
  const { cell, refs, getValue, getFunc } = args;
  const formula = (await getValue(cell)) || '';
  const node = isFormula(formula) ? ast.toTree(formula) : undefined;

  if (!node || !(node.type === 'function' || node.type === 'binary-expression')) {
    const error = toError({
      type: 'NOT_FORMULA',
      message: `The value of cell ${cell} is not a formula. Must start with "=".`,
      cell: { key: cell, value: formula },
    });
    const res: t.IFuncResponse = { ok: false, cell: cell, formula, error };
    return res;
  }

  let data: any;
  let error: t.IFuncError | undefined;
  try {
    if (node.type === 'binary-expression') {
      data = await evaluateExpr({ cell, formula, node, refs, getValue, getFunc });
    }
    if (node.type === 'function') {
      data = await evaluateFunc({ cell, formula, node, refs, getValue, getFunc });
    }
  } catch (err) {
    error = fromError(err);
  }

  // Finish up.
  const res: t.IFuncResponse<D> = {
    ok: !error,
    cell,
    formula,
    data,
    error,
  };
  return value.deleteUndefined(res);
}
