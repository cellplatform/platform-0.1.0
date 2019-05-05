/**
 * Based on:
 *  - https://github.com/ProseMirror/prosemirror-example-setup
 */
import { constants, t } from '../../../common';

import { Schema } from 'prosemirror-model';
import { keymap } from 'prosemirror-keymap';
import { history } from 'prosemirror-history';
import { baseKeymap } from 'prosemirror-commands';
import { Plugin } from 'prosemirror-state';
import { dropCursor } from 'prosemirror-dropcursor';
import { gapCursor } from 'prosemirror-gapcursor';
// import { menuBar } from 'prosemirror-menu';

import * as inputRules from './inputRules';
import * as keyMap from './keyMap';
import { Subject } from 'rxjs';

/**
 * Initializes an editor/schema with:
 *  - keymap
 *  - input rules
 *  - history (undo)
 *
 * For more options in the future see `example-setup`:
 *  - prompt
 *  - menu
 */
export function init(args: {
  schema: Schema;
  events$: Subject<t.TextEditorEvent>;
  history?: boolean;
  mapKeys?: keyMap.EditorKeyMap;
  allowEnter?: boolean;
  allowMetaEnter?: boolean;
  allowHeadings?: boolean;
}) {
  const { schema, events$, mapKeys, allowEnter, allowMetaEnter, allowHeadings } = args;

  let plugins: Plugin[] = [
    inputRules.build(schema, { allowHeadings }),
    keymap(keyMap.build({ schema, events$, mapKeys, allowEnter, allowMetaEnter, allowHeadings })),
    keymap(baseKeymap),
    dropCursor(),
    gapCursor(),
  ];

  if (args.history !== false) {
    plugins = [...plugins, history()];
  }

  return plugins.concat(
    new Plugin({
      props: {
        attributes: { class: constants.CSS.CLASS.MARKDOWN },
      },
    }),
  );
}
