import { ast } from '../ast';
import { t } from '../common';
import * as util from './util';

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
    const error = util.toError({
      type: 'NOT_FORMULA',
      message: `The value of cell ${cell} is not a formula. Must start with "=".`,
      cell: { key: cell, value: formula },
    });
    const res: t.IFuncResponse = { ok: false, cell, formula, error };
    return res;
  }

  // Evaluate the function/expression.
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
    error = util.fromError(err);
  }

  // Finish up.
  const ok = !error;
  const res: t.IFuncResponse<D> = { ok, cell, formula, data };
  return error ? { ...res, error } : res;
}

/**
 * [Internal]
 */

const getExprFunc = async (getFunc: t.GetFunc, operator: ast.BinaryExpressionNode['operator']) => {
  if (operator === '+') {
    return getFunc({ name: 'SUM', namespace: 'sys' });
  }

  // TEMP 🐷 TODO - all the other expressions: '>' | '<' | '=' | '>=' | '<=' | '+' | '-' | '&'

  return undefined;
};

const getCellRefValue = async (args: {
  cell: string;
  node: ast.CellNode;
  refs: t.IRefs;
  getValue: t.RefGetValue;
  getFunc: t.GetFunc;
}) => {
  const { cell, refs, getValue, getFunc } = args;
  util.throwIfCircular({ cell, refs });

  // Read the current cell value for the node.
  const targetKey = args.node.key;
  let value = (await getValue(targetKey)) || '';

  // Calculate formulas into final values.
  if (util.isFormula(value)) {
    value = await evaluateNode({
      node: ast.toTree(value) as ast.BinaryExpressionNode | ast.FunctionNode,
      cell: targetKey,
      formula: value,
      refs,
      getValue,
      getFunc,
    }); // <== RECURSION 🌳
  }

  // Finish up.
  return value;
};

const evaluateNode = async (args: {
  cell: string;
  formula: string;
  node: ast.Node;
  refs: t.IRefs;
  getValue: t.RefGetValue;
  getFunc: t.GetFunc;
}) => {
  const { node, cell, formula, refs, getValue, getFunc } = args;

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
    return getCellRefValue({ cell, refs, node, getValue, getFunc }); // <== RECURSION 🌳
  }
  if (node.type === 'cell-range') {
    return evaluateRange({
      cell,
      formula,
      node: node as ast.CellRangeNode,
      refs,
      getValue,
      getFunc,
    }); // <== RECURSION 🌳
  }
};

/**
 * Execute a function that contains a range.
 */
const evaluateRange = async (args: {
  cell: string;
  formula: string;
  node: ast.CellRangeNode;
  refs: t.IRefs;
  getValue: t.RefGetValue;
  getFunc: t.GetFunc;
}) => {
  const { cell, formula, node, refs, getValue, getFunc } = args;
  util.throwIfCircular({ cell, refs });

  console.log('range', node);
};

/**
 * Execute a binary-expression (eg "=A+A1").
 */
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

  const toValue = async (node: ast.Node) => {
    return node.type === 'binary-expression'
      ? evaluateExpr({ cell, formula, refs, getValue, getFunc, node, level: level + 1 }) // <== RECURSION 🌳
      : evaluateNode({ cell, formula, node, getValue, getFunc, refs });
  };

  // Retrieve left/right parameters.
  const left = await toValue(node.left);
  const right = await toValue(node.right);
  const params = [left, right];

  // Invoke the function.
  const res: t.FuncResponse = await func({ params });
  return res;
};

/**
 * Execute a function (eg "=SUM(1,A1)").
 */
const evaluateFunc = async (args: {
  cell: string;
  formula: string;
  node: ast.FunctionNode;
  refs: t.IRefs;
  getValue: t.RefGetValue;
  getFunc: t.GetFunc;
  level?: number;
}) => {
  const { cell, formula, node, refs, getValue, getFunc } = args;
  const name = node.name;
  const namespace = node.namespace || 'sys';

  // Lookup the function.
  const func = await getFunc({ name, namespace });
  if (!func) {
    throw util.toError({
      type: 'NOT_FOUND',
      message: `The function [${namespace}.${name}] was not found.`,
      cell: { key: cell, value: formula },
    });
  }

  // Calculate parameter values.
  const params = await Promise.all(
    node.arguments.map(async node =>
      evaluateNode({ cell, formula, node, getValue, getFunc, refs }),
    ),
  );

  // Invoke the function.
  const res: t.FuncResponse = await func({ params });
  return res;
};
