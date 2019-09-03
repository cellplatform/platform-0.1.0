import { Subject } from 'rxjs';

import { CommandState, t, NedbStore, NeDb } from '../common';
import { root } from './cmds';

export function init(args: { state$: Subject<Partial<t.ITestState>> }) {
  const { state$ } = args;

  const store = NedbStore.create({ filename: 'tmp/client.store.db', autoload: true });
  const db = NeDb.create({ filename: 'tmp/client.doc.db' });

  return CommandState.create({
    root,
    beforeInvoke: async e => {
      const props: t.ICommandProps = { ...e.props, state$, store, db };
      return { props };
    },
  });
}
