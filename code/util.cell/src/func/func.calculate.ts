import { ast } from '../ast';
import { t, value, defaultValue } from '../common';
import * as util from './util';

const getExprFunc = async (getFunc: t.GetFunc, operator: ast.BinaryExpressionNode['operator']) => {
  if (operator === '+') {
    return getFunc({ name: 'SUM', namespace: 'sys' });
  }

  // TEMP 🐷 TODO - all the other expressions: '>' | '<' | '=' | '>=' | '<=' | '+' | '-' | '&'

  return undefined;
};

const getParamRefValue = async (args: {
  cell: string;
  paramIndex: number;
  refs: t.IRefs;
  getValue: t.RefGetValue;
  getFunc: t.GetFunc;
}) => {
  const { cell, paramIndex, refs, getValue, getFunc } = args;
  const param = defaultValue(paramIndex, -1).toString();

  // Lookup the ref.
  const outRefs = refs.out[cell] || [];
  const ref = outRefs.find(ref => util.path(ref.param).last === param);
  if (!ref) {
    return undefined;
  }

  // Bail out if the ref is in an error state.
  if (ref.error) {
    throw toError({
      type: ref.error.type === 'CIRCULAR' ? 'CIRCULAR' : 'REF',
      message: ref.error.message,
      cell: { key: cell, value: (await getValue(cell)) || '' },
    });
  }

  // Read the current cell value for the REF.
  const parts = ref.path.split('/');
  const targetKey = parts[parts.length - 1];

  // Calculate formulas into final values.
  let value = await getValue(targetKey);
  if (util.isFormula(value)) {
    const formula = value || '';
    const node = ast.toTree(value) as ast.BinaryExpressionNode | ast.FunctionNode;
    value = await evaluate({ cell: targetKey, formula, node, refs, getValue, getFunc }); // <== RECURSION 🌳
  }

  // Finish up.
  return value;
};

const toParamValue = async (args: {
  cell: string;
  formula: string;
  node: ast.Node;
  paramIndex: number;
  refs: t.IRefs;
  getValue: t.RefGetValue;
  getFunc: t.GetFunc;
}) => {
  const { node, cell, formula, refs, getValue, getFunc, paramIndex } = args;

  if (ast.isValueNode(node)) {
    return (node as any).value;
  }
  if (node.type === 'binary-expression') {
    return evaluateExpr({ cell, formula, node, refs, getValue, getFunc }); // <== RECURSION 🌳
  }
  if (node.type === 'function') {
    return evaluateFunc({ cell, formula, node, refs, getValue, getFunc }); // <== RECURSION 🌳
  }
  if (node.type === 'cell') {
    return getParamRefValue({ cell, refs, paramIndex, getValue, getFunc }); // <== RECURSION 🌳
  }
  if (node.type === 'cell-range') {
    // TEMP 🐷 TODO - look up RANGE
  }
};

const evaluate = async (args: {
  cell: string;
  formula: string;
  node: ast.BinaryExpressionNode | ast.FunctionNode;
  refs: t.IRefs;
  getValue: t.RefGetValue;
  getFunc: t.GetFunc;
  level?: number;
}) => {
  const { cell, formula, node, refs, getValue, getFunc, level = 0 } = args;
  if (node.type === 'binary-expression') {
    return evaluateExpr({ cell, formula, node, refs, getValue, getFunc, level });
  }
  if (node.type === 'function') {
    return evaluateFunc({ cell, formula, node, refs, getValue, getFunc, level });
  }
  return;
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

  const toValue = async (node: ast.Node, paramIndex: number) => {
    return node.type === 'binary-expression'
      ? evaluateExpr({ cell, formula, refs, getValue, getFunc, node, level: level + 1 }) // <== RECURSION 🌳
      : toParamValue({ cell, formula, node, paramIndex, getValue, getFunc, refs });
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
    node.arguments.map(async (node, paramIndex) =>
      toParamValue({ cell, formula, node, paramIndex, getValue, getFunc, refs }),
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
  const node = util.isFormula(formula) ? ast.toTree(formula) : undefined;

  // Ensure the node is a function/expression.
  if (!node || !(node.type === 'function' || node.type === 'binary-expression')) {
    const error = toError({
      type: 'NOT_FORMULA',
      message: `The value of cell ${cell} is not a formula. Must start with "=".`,
      cell: { key: cell, value: formula },
    });
    const res: t.IFuncResponse = { ok: false, cell: cell, formula, error };
    return res;
  }

  // Evaluate the function/expression.
  let data: any;
  let error: t.IFuncError | undefined;
  try {
    data = await evaluate({ cell, formula, node, refs, getValue, getFunc });
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
