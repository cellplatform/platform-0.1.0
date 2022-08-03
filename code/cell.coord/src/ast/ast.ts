import {
  BinaryExpressionNode,
  buildTree,
  CellNode as AstCellNode,
  CellRangeNode as AstCellRangeNode,
  FunctionNode as AstFunctionNode,
  LogicalNode,
  Node,
  NumberNode,
  TextNode,
  UnaryExpressionNode,
  visit,
} from 'excel-formula-ast';
import { Token, tokenize } from 'excel-formula-tokenizer';

import { value as valueUtil } from '../common';

export {
  Token,
  Node,
  NumberNode,
  BinaryExpressionNode,
  UnaryExpressionNode,
  LogicalNode,
  TextNode,
};

export type EmptyNode = { type: 'empty' };
export type ParseErrorNode = { type: 'parse-error' };
export type CellNode = AstCellNode & { ns?: string };
export type CellRangeNode = AstCellRangeNode & {
  sheet?: string;
  left: CellNode;
  right: CellNode;
};
export type FunctionNode = AstFunctionNode & { ns?: string };
export type TreeNode = Node | CellNode | EmptyNode | ParseErrorNode;

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
const VALUE_TYPES: Node['type'][] = ['number', 'text', 'logical', 'unary-expression'];

/**
 * Determine if the given node represents a concrete value.
 */
export function isValueNode(node: Node) {
  return VALUE_TYPES.includes(node.type);
}

/**
 * Converts a forumula into tokens.
 */
export function toTokens(expr: string) {
  expr = expr
    // Pad +/- with space.
    // NB: This fixes problem with tokenize misinterpreting logical expressions as ranges.
    .replace(/\+/g, ' + ')
    .replace(/-/g, ' - ');
  return tokenize(expr) as Token[];
}

/**
 * Converts the given expression to an abstract-syntax-tree.
 */
export function toTree<T extends TreeNode>(expr?: string): T {
  try {
    // Build the tree and with custom parser modifications.
    const node = parseTree(expr) as Node;
    visit(node, {
      enterCell: (cell: CellNode) => parseCell(cell),
      enterCellRange: (range: CellRangeNode) => parseRange(range),
      enterFunction: (func: FunctionNode) => parseFunction(func),
    });
    return node as T;
  } catch (error: any) {
    const err: ParseErrorNode = { type: 'parse-error' };
    return err as T;
  }
}

/**
 * [Internal]
 */
function parseTree(expr?: string): TreeNode {
  const tokens = expr ? toTokens(expr) : [];
  return tokens.length === 0 ? { type: 'empty' } : buildTree(tokens);
}

function parseCellNamespace(cell: CellNode) {
  const key = cell.key;
  const index = key.indexOf('!'); // Look for a (!) which indicates a sheet reference.

  // Update sheet.
  if (index > -1) {
    const node = parseTree(key.substr(index + 1)) as CellNode;
    cell.ns = key.substr(0, index).trim();
    cell.refType = node.refType;
    cell.key = node.key;
  }

  if (cell.ns === '') {
    delete cell.ns;
  }
}

function parseCell(cell: CellNode) {
  parseCellNamespace(cell);
}

function parseRange(range: CellRangeNode) {
  const left = range.left as AstCellNode;
  const right = range.right as AstCellNode;
  const leftKey = left.key.trim();

  // Look for a (!) on the left of the range which indicates a sheet reference.
  const index = leftKey.indexOf('!');
  if (index < 0) {
    return; // No explicit sheet reference.
  }

  // Update referenced sheet.
  const sheet = leftKey.substr(0, index).trim();
  range.sheet = sheet;
  right.key = `${sheet}!${right.key}`;
}

function parseFunction(func: FunctionNode) {
  parseFuncNamespace(func);
  parseFuncArguments(func);
}

function parseFuncNamespace(func: FunctionNode) {
  const name = func.name;
  const parts = name.split('.');
  if (parts.length === 1) {
    return; // No namespace found.
  }

  // Update the function.
  func.name = parts[parts.length - 1];
  func.ns = parts.slice(0, parts.length - 1).join('.');
}

function parseFuncArguments(func: FunctionNode) {
  parseFuncNegativeNumberArguments(func);
  parseFuncBooleanArguments(func);
}

function parseFuncNegativeNumberArguments(func: FunctionNode) {
  const isNegativeUnary = (node: Node) => {
    const arg = node as UnaryExpressionNode;
    return arg.type === 'unary-expression' && arg.operator === '-' && arg.operand.type === 'number';
  };
  func.arguments = func.arguments.map((node) => {
    const arg = node as UnaryExpressionNode;
    if (!isNegativeUnary(arg)) {
      return arg;
    }
    const value = -(arg.operand as NumberNode).value;
    const numberArg: NumberNode = { type: 'number', value: value };
    return numberArg;
  });
}

function parseFuncBooleanArguments(func: FunctionNode) {
  const booleanRefType = (node: Node): boolean | null => {
    const arg = node as CellNode;
    const isMatch =
      arg.type === 'cell' &&
      arg.refType === undefined &&
      (arg.key === 'true' || arg.key === 'false');

    return isMatch ? valueUtil.toBool(arg.key) : null;
  };

  func.arguments = func.arguments.map((node) => {
    const value = booleanRefType(node);
    return value === null ? node : ({ type: 'logical', value } as any);
  });
}
