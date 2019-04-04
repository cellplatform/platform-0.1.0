/**
 * See:
 *   - https://github.com/ProseMirror/prosemirror-example-setup/blob/master/src/inputrules.js
 */

import { Schema, NodeType } from 'prosemirror-model';
import {
  inputRules,
  wrappingInputRule,
  textblockTypeInputRule,
  smartQuotes,
  emDash,
  ellipsis,
  InputRule,
} from 'prosemirror-inputrules';

/**
 * `(NodeType) → InputRule`
 *
 * Given a blockquote node type, returns an input rule that turns `"> "`
 * at the start of a textblock into a blockquote.
 */
export function blockQuoteRule(nodeType: NodeType) {
  return wrappingInputRule(/^\s*>\s$/, nodeType);
}

/**
 * Given a list node type, returns an input rule that turns a number
 * followed by a dot at the start of a textblock into an ordered list.
 */
export function orderedListRule(nodeType: NodeType) {
  return wrappingInputRule(
    /^(\d+)\.\s$/,
    nodeType,
    match => ({ order: +match[1] }),
    (match, node) => node.childCount + node.attrs.order === +match[1],
  );
}

/**
 * Given a list node type, returns an input rule that turns a bullet
 * (dash, plush, or asterisk) at the start of a textblock into a
 * bullet list.
 */
export function bulletListRule(nodeType: NodeType) {
  return wrappingInputRule(/^\s*([-+*])\s$/, nodeType);
}

/**
 * Given a code block node type, returns an input rule that turns a
 * textblock starting with three backticks into a code block.
 */
export function codeBlockRule(nodeType: NodeType) {
  return textblockTypeInputRule(/^```$/, nodeType);
}

/**
 * Given `---` replace with a horizontal-rule.
 */
export const hrRule = new InputRule(/^—-$/, (state, match, start, end) => {
  const hr = state.schema.nodes.horizontal_rule.create();
  const tr = state.tr.delete(start, end).insert(start, hr);
  return tr;
});

/**
 * Given a node type and a maximum level, creates an input rule that
 * turns up to that number of `#` characters followed by a space at
 * the start of a textblock into a heading whose level corresponds to
 * the number of `#` signs.
 */
export function headingRule(nodeType: NodeType, maxLevel: number) {
  return textblockTypeInputRule(new RegExp('^(#{1,' + maxLevel + '})\\s$'), nodeType, match => ({
    level: match[1].length,
  }));
}

/**
 * A set of input rules for creating the basic { block } quotes, lists,
 * code blocks, and heading.
 */
export function build(schema: Schema) {
  const nodes = schema.nodes;
  // const rules = smartQuotes.concat(ellipsis, emDash);
  const rules = smartQuotes.concat(ellipsis, hrRule, emDash);

  if (nodes.blockquote) {
    rules.push(blockQuoteRule(nodes.blockquote));
  }
  if (nodes.ordered_list) {
    rules.push(orderedListRule(nodes.ordered_list));
  }
  if (nodes.bullet_list) {
    rules.push(bulletListRule(nodes.bullet_list));
  }
  if (nodes.code_block) {
    rules.push(codeBlockRule(nodes.code_block));
  }
  if (nodes.heading) {
    rules.push(headingRule(nodes.heading, 6));
  }

  return inputRules({ rules });
}
