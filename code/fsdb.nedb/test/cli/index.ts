import { Subject } from 'rxjs';

import { CommandState, t, Store, NeDb } from '../common';
import { root } from './cmds';

export function init(args: { state$: Subject<Partial<t.ITestState>> }) {
  const { state$ } = args;

  const db = Store.create({ filename: 'tmp/client.store.db', autoload: true });
  const doc = NeDb.create({ filename: 'tmp/client.doc.db' });

  return CommandState.create({
    root,
    beforeInvoke: async e => {
      const props: t.ICommandProps = { ...e.props, state$, db, doc };
      return { props };
    },
  });
}
