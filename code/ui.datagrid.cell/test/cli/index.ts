import { Subject } from 'rxjs';

import { CellEditorView, CommandState, t } from '../common';
import { root } from './cmds';

export function init(args: {
  state$: Subject<Partial<t.ITestState>>;
  getEditorViews: () => CellEditorView[];
}) {
  const { state$, getEditorViews } = args;

  return CommandState.create({
    root,
    beforeInvoke: async e => {
      const editorViews = getEditorViews();
      const props: t.ICommandProps = { ...e.props, state$, editorViews };
      return { props };
    },
  });
}
