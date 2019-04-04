import {
  chainCommands,
  exitCode,
  joinDown,
  joinUp,
  lift,
  selectParentNode,
  setBlockType,
  toggleMark,
  wrapIn,
} from 'prosemirror-commands';
import { redo, undo } from 'prosemirror-history';
import { undoInputRule } from 'prosemirror-inputrules';
import { Schema } from 'prosemirror-model';
import { liftListItem, sinkListItem, splitListItem, wrapInList } from 'prosemirror-schema-list';
import { EditorState, Transaction } from 'prosemirror-state';

import { EditorKeyMap } from '../types';
import { time } from '../../../common';

export { EditorKeyMap };

type EditorDispatch = (tr: Transaction) => void;
type EditorCommand = (state: EditorState, dispatch: EditorDispatch) => boolean;

const isMac = typeof navigator !== 'undefined' ? /Mac/.test(navigator.platform) : false;

/**
 * `(Schema, ?Object) → Object`
 *
 * Inspect the given schema looking for marks and nodes,
 * and if found, add the following key bindings related to them.
 *
 *   - `Mod-b`                  for toggling [strong](#schema-basic.StrongMark)
 *   - `Mod-i`                  for toggling [emphasis](#schema-basic.EmMark)
 *   - `Mod-`                   for toggling [code font](#schema-basic.CodeMark)
 *   - `Ctrl-Shift-0`           for making the current textblock a paragraph
 *   - `Ctrl-Shift-1`           to `Ctrl-Shift-Digit6` for making the current textblock a heading of the corresponding level
 *   - `Ctrl-Shift-Backslash`   to make the current textblock a code block
 *   - `Ctrl-Shift-8`           to wrap the selection in an ordered list
 *   - `Ctrl-Shift-9`           to wrap the selection in a bullet list
 *   - `Ctrl->`                 to wrap the selection in a block quote
 *   - `Enter`                  to split a non-empty textblock in a list item while at the same time splitting the list item
 *   - `Mod-Enter`              to insert a hard break
 *   - `Mod-_`                  to insert a horizontal rule
 *   - `Backspace`              to undo an input rule
 *   - `Alt-ArrowUp`            to `joinUp`
 *   - `Alt-ArrowDown`          to `joinDown`
 *   - `Mod-BracketLeft`        to `lift`
 *   - `Escape`                 to `selectParentNode`
 *
 * You can suppress or map these bindings by passing a `mapKeys`
 * argument, which maps key names (say `"Mod-B"` to either `false`, to
 * remove the binding, or a new key name string.
 */
export function build(schema: Schema, mapKeys?: EditorKeyMap) {
  const keys = {};
  function bind(key: string, cmd: EditorCommand) {
    if (mapKeys) {
      const mapped = mapKeys[key];
      if (mapped === false) {
        return;
      }
      if (typeof mapped === 'string') {
        key = mapped;
      }
    }
    keys[key] = cmd;
  }

  bind('Mod-z', undo);
  bind('Shift-Mod-z', redo);
  bind('Backspace', undoInputRule);
  if (!isMac) {
    bind('Mod-y', redo);
  }

  bind('Alt-ArrowUp', joinUp);
  bind('Alt-ArrowDown', joinDown);
  bind('Mod-BracketLeft', lift);
  bind('Escape', selectParentNode);

  // Insert date.
  bind('Mod-Shift-d', (state, dispatch) => {
    const date = time.day().format('D MMMM YYYY');
    const tr = state.tr.insertText(date).scrollIntoView();
    dispatch(tr);
    return false;
  });

  if (schema.marks.strong) {
    const type = schema.marks.strong;
    bind('Mod-b', toggleMark(type));
    bind('Mod-B', toggleMark(type));
  }

  if (schema.marks.em) {
    const type = schema.marks.em;
    bind('Mod-i', toggleMark(type));
    bind('Mod-I', toggleMark(type));
  }

  if (schema.marks.code) {
    const type = schema.marks.code;
    bind('Mod-`', toggleMark(type));
  }

  if (schema.nodes.bullet_list) {
    const type = schema.nodes.bullet_list;
    bind('Shift-Ctrl-8', wrapInList(type));
  }

  if (schema.nodes.ordered_list) {
    const type = schema.nodes.ordered_list;
    bind('Shift-Ctrl-9', wrapInList(type));
  }

  if (schema.nodes.blockquote) {
    const type = schema.nodes.blockquote;
    bind('Ctrl->', wrapIn(type));
  }

  if (schema.nodes.hard_break) {
    const br = schema.nodes.hard_break;
    const cmd = chainCommands(exitCode, (state, dispatch) => {
      if (dispatch) {
        const tr = state.tr.replaceSelectionWith(br.create()).scrollIntoView();
        dispatch(tr);
      }
      return true;
    });
    bind('Mod-Enter', cmd);
    bind('Shift-Enter', cmd);
    if (isMac) {
      bind('Ctrl-Enter', cmd);
    }
  }

  if (schema.nodes.list_item) {
    const type = schema.nodes.list_item;
    bind('Enter', splitListItem(type));
    bind('Mod-[', liftListItem(type));
    bind('Mod-]', sinkListItem(type));
  }

  if (schema.nodes.paragraph) {
    const type = schema.nodes.paragraph;
    bind('Shift-Ctrl-0', setBlockType(type));
  }

  if (schema.nodes.code_block) {
    const type = schema.nodes.code_block;
    bind('Shift-Ctrl-\\', setBlockType(type));
  }

  if (schema.nodes.heading) {
    const type = schema.nodes.heading;
    for (let i = 1; i <= 6; i++) {
      bind('Shift-Ctrl-' + i, setBlockType(type, { level: i }));
    }
  }

  if (schema.nodes.horizontal_rule) {
    const hr = schema.nodes.horizontal_rule;
    bind('Mod-_', (state, dispatch) => {
      const tr = state.tr.replaceSelectionWith(hr.create()).scrollIntoView();
      dispatch(tr);
      return true;
    });
  }

  return keys;
}
