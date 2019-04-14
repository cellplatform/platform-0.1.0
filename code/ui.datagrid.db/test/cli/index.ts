import { Subject } from 'rxjs';

import { CommandState, t, constants } from '../common';
import { root } from './cmds';

const dir = constants.DB.DIR;

export function init(args: { state$: Subject<Partial<t.ITestState>>; databases: t.IDbFactory }) {
  const { state$, databases } = args;

  return CommandState.create({
    root,
    beforeInvoke: async e => {
      const db = (await databases.getOrCreate({ dir, connect: false })).db;
      const props: t.ICommandProps = { ...e.props, db, state$, databases };
      return { props };
    },
  });
}
