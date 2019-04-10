/**
 * Based on:
 *  - https://github.com/ProseMirror/prosemirror-example-setup
 */

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
export function init(args: { schema: Schema; history?: boolean; mapKeys?: keyMap.EditorKeyMap }) {
  const { schema } = args;

  let plugins: Plugin[] = [
    inputRules.build(schema),
    keymap(keyMap.build(schema, args.mapKeys)),
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
        // attributes: { class: 'my-css-class' },
      },
    }),
  );
}
