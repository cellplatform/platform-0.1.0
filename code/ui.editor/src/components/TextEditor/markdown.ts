import { t } from '../../common';
import { defaultMarkdownParser, defaultMarkdownSerializer } from 'prosemirror-markdown';
import { Schema } from 'prosemirror-model';

export const schema = require('prosemirror-markdown').schema as Schema;

export function serialize(state: t.EditorState) {
  return defaultMarkdownSerializer.serialize(state.doc);
}

export function parse(text: string): t.Node {
  return defaultMarkdownParser.parse(text);
}
