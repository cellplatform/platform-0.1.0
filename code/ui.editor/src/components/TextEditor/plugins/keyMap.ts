import {
  baseKeymap,
  chainCommands,
  exitCode,
  joinDown,
  joinUp,
  lift,
  selectParentNode,
  setBlockType,
  toggleMark,
} from 'prosemirror-commands';
import { redo, undo } from 'prosemirror-history';
import { undoInputRule } from 'prosemirror-inputrules';
import { Schema } from 'prosemirror-model';
import { liftListItem, sinkListItem, splitListItem, wrapInList } from 'prosemirror-schema-list';
import { EditorState, Transaction } from 'prosemirror-state';
import * as utils from 'prosemirror-utils';
import { Subject } from 'rxjs';

import { t, time } from '../../../common';
import { EditorKeyMap } from '../types';

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
 *   - toggling [strong](#schema-basic.StrongMark)
 *   - toggling [emphasis](#schema-basic.EmMark)
 *   - toggling [code font](#schema-basic.CodeMark)
 *   - making the current textblock a paragraph
 *   - for making the current textblock a heading of the corresponding level
 *   - make the current textblock a code block
 *   - wrap the selection in an ordered list
 *   - wrap the selection in a bullet list
 *   - wrap the selection in a block quote
 *   - split a non-empty textblock in a list item while at the same time splitting the list item
 *   - insert a hard break
 *   - insert a horizontal rule
 *   - undo an input rule
 *   - `joinUp`
 *   - `joinDown`
 *   - `lift`
 *   - `selectParentNode`
 *
 * You can suppress or map these bindings by passing a `mapKeys`
 * argument, which maps key names (say `"Mod-B"` to either `false`, to
 * remove the binding, or a new key name string.
 */
export function build(options: {
  schema: Schema;
  events$: Subject<t.TextEditorEvent>;
  mapKeys?: EditorKeyMap;
  allowEnter?: boolean;
  allowMetaEnter?: boolean;
  allowHeadings?: boolean;
}) {
  const { schema, events$, mapKeys } = options;
  const find = {
    parentListItem: utils.findParentNode(node => node.type === schema.nodes.list_item),
  };

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
    return true;
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
    bind('Mod-Alt-c', toggleMark(type));
  }

  if (schema.nodes.code_block) {
    const type = schema.nodes.code_block;
    bind('Mod-Alt-Shift-c', setBlockType(type));
  }

  if (schema.nodes.bullet_list) {
    const type = schema.nodes.bullet_list;
    bind('Mod-Alt-b', wrapInList(type));
  }

  if (schema.nodes.ordered_list) {
    const type = schema.nodes.ordered_list;
    bind('Mod-Alt-o', wrapInList(type));
  }

  // if (schema.nodes.blockquote) {
  //   const type = schema.nodes.blockquote;
  //   bind('Ctrl->', wrapIn(type));
  // }

  if (schema.nodes.hard_break) {
    const br = schema.nodes.hard_break;
    const cmd = chainCommands(exitCode, (state, dispatch) => {
      if (dispatch) {
        const tr = state.tr.replaceSelectionWith(br.create()).scrollIntoView();
        dispatch(tr);
      }
      return true;
    });
    // bind('Mod-Enter', cmd);
    bind('Shift-Enter', cmd);
    if (isMac) {
      // bind('Ctrl-Enter', cmd);
    }
  }

  if (schema.nodes.list_item) {
    const type = schema.nodes.list_item;
    bind('Mod-[', liftListItem(type));
    bind('Mod-]', sinkListItem(type));
  }

  if (schema.nodes.paragraph) {
    const type = schema.nodes.paragraph;
    bind('Mod-Alt-0', setBlockType(type));
  }

  if (schema.nodes.heading && options.allowHeadings !== false) {
    const type = schema.nodes.heading;
    for (let i = 1; i <= 6; i++) {
      bind('Mod-Alt-' + i, setBlockType(type, { level: i }));
    }
  }

  if (schema.nodes.horizontal_rule) {
    const hr = schema.nodes.horizontal_rule;
    bind('Mod-H', (state, dispatch) => {
      const tr = state.tr.replaceSelectionWith(hr.create()).scrollIntoView();
      dispatch(tr);
      return true;
    });
  }

  const handleEnter: EditorCommand = (state, dispatch) => {
    const li = find.parentListItem(state.selection);

    if (li && li.node.textContent) {
      // Inside a <ul> or <ol>
      splitListItem(schema.nodes.list_item)(state, dispatch);
    } else {
      // New-line.
      baseKeymap.Enter(state, dispatch);
    }
    return true;
  };

  const fireEnter = (args: { isMeta?: boolean }) => {
    let isCancelled = false;
    events$.next({
      type: 'EDITOR/keydown/enter',
      payload: {
        isMeta: Boolean(args.isMeta),
        get isCancelled() {
          return isCancelled;
        },
        cancel() {
          isCancelled = true;
        },
      },
    });
    return { isCancelled };
  };

  bind('Mod-Enter', (state, dispatch) => {
    const { isCancelled } = fireEnter({ isMeta: true });
    if (isCancelled || options.allowMetaEnter === false) {
      return true; // Cancel further handlers.
    }
    return handleEnter(state, dispatch);
  });
  bind('Enter', (state, dispatch) => {
    const { isCancelled } = fireEnter({});

    if (isCancelled || options.allowEnter === false) {
      return true; // Cancel further handlers.
    }
    return handleEnter(state, dispatch);
  });

  // bind('`', (state, dispatch) => {
  //   toggleMark(schema.marks.code)(state, dispatch);
  //   return true;
  // });

  // bind('ArrowRight', (state, dispatch) => {
  //   console.group('🌳 NEXT');
  //   console.log('arrow next');
  //   const code = find.parentCode(state.selection);
  //   console.log('state.selection', state.selection);
  //   const f = utils.isNodeSelection(state.selection);
  //   console.log('f', f);
  //   console.log('code', code);
  //   console.groupEnd();

  //   return false;
  // });

  // Finish up.
  return keys;
}
